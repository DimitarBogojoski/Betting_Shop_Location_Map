window.loadObjectsTableData = async function () {
    const tbody = document.getElementById("objects-table-body");
    const summary = document.getElementById("objects-table-summary");
    const exportButton = document.getElementById("export-objects");
    const pagination = document.getElementById("objects-pagination");

    if (!tbody || !summary || !exportButton || !pagination) {
        return;
    }

    const layerUrl =
        "https://gisserver.gdi.mk/arcgis/rest/services/KLADILNICI/KLADILNICI_KAZINA_MK/MapServer/1";

    summary.textContent = "Се вчитуваат податоците...";
    exportButton.disabled = true;
    pagination.replaceChildren();
    tbody.replaceChildren();

    let layer;

    try {
        // Wait for the ArcGIS CDN loader on initial page load.
        if (document.readyState !== "complete") {
            await new Promise((resolve) => {
                window.addEventListener("load", resolve, { once: true });
            });
        }

        if (!tbody.isConnected) {
            return;
        }

        const [FeatureLayer, Graphic] = await $arcgis.import([
            "@arcgis/core/layers/FeatureLayer.js",
            "@arcgis/core/Graphic.js"
        ]);

        layer = new FeatureLayer({
            url: layerUrl
        });

        await layer.load();

        // Print the actual service fields for troubleshooting.
        console.table(
            layer.fields.map((field) => ({
                name: field.name,
                alias: field.alias,
                type: field.type
            }))
        );

        function normalize(value) {
            return String(value ?? "")
                .normalize("NFKC")
                .toLowerCase()
                .replace(/[\s_-]+/g, "");
        }

        function findField(candidates) {
            const matches = candidates.map(normalize);

            return layer.fields.find((field) =>
                matches.includes(normalize(field.name)) ||
                matches.includes(normalize(field.alias))
            )?.name;
        }

        const idField = layer.objectIdField;

        const nameField = findField([
            "ИМЕ",
            "IME",
            "NAME",
            "NAZIV",
            "НАЗИВ"
        ]);

        const addressField = findField([
            "АДРЕСА",
            "ADRESA",
            "ADDRESS",
            "ADRES"
        ]);

        if (!idField || !nameField || !addressField) {
            throw new Error(
                "Не се пронајдени потребните полиња. " +
                "Проверете ја листата со полиња во Console. " +
                `ID: ${idField}, име: ${nameField}, адреса: ${addressField}`
            );
        }

        // Get all matching IDs first, then retrieve records in small batches.
        const objectIds = await layer.queryObjectIds({
            where: "1=1"
        }) || [];

        objectIds.sort((a, b) => a - b);

        const records = [];
        const batchSize = 50;

        async function fetchBatch(ids) {
            const result = await layer.queryFeatures({
                objectIds: ids,
                outFields: [idField, nameField, addressField],
                returnGeometry: false
            });

            // Split the batch if the service's response limit is reached.
            if (result.exceededTransferLimit) {
                if (ids.length <= 1) {
                    throw new Error("Серверот го ограничи резултатот.");
                }

                const middle = Math.ceil(ids.length / 2);

                return [
                    ...await fetchBatch(ids.slice(0, middle)),
                    ...await fetchBatch(ids.slice(middle))
                ];
            }

            return result.features.map((feature) => ({
                objectId: feature.attributes[idField],
                name: feature.attributes[nameField],
                address: feature.attributes[addressField]
            }));
        }

        for (let index = 0; index < objectIds.length; index += batchSize) {
            if (!tbody.isConnected) {
                return;
            }

            const ids = objectIds.slice(index, index + batchSize);
            records.push(...await fetchBatch(ids));

            if (!tbody.isConnected) {
                return;
            }

            summary.textContent =
                `Вчитани ${records.length} од ${objectIds.length} записи`;
        }

        records.sort((a, b) => a.objectId - b.objectId);

        if (tbody.isConnected) {
            window.initObjectsTable(records);
        }
    } catch (error) {
        console.error("Failed to load table data:", error);

        if (!tbody.isConnected) {
            return;
        }

        summary.textContent =
            "Грешка при вчитување на податоците. Проверете ја конзолата.";

        exportButton.disabled = true;
    } finally {
        layer?.destroy();
    }
};

let selectedTableGraphic = null;
let selectedTableView = null;
let tableSelectionId = 0;

window.selectObjectOnMap = async function (record) {
    const view = window.objectsMapView;
    const selectionId = ++tableSelectionId;

    if (!view || view.destroyed) {
        console.warn("The map is not ready yet.");
        return;
    }

    let layer;

    try {
        const [FeatureLayer, Graphic] = await $arcgis.import([
            "@arcgis/core/layers/FeatureLayer.js",
            "@arcgis/core/Graphic.js"
        ]);

        if (selectionId !== tableSelectionId || view.destroyed) {
            return;
        }

        layer = new FeatureLayer({
            url:
                "https://gisserver.gdi.mk/arcgis/rest/services/KLADILNICI/KLADILNICI_KAZINA_MK/MapServer/1"
        });

        await layer.load();
        await view.when();

        const result = await layer.queryFeatures({
            objectIds: [record.objectId],
            outFields: ["*"],
            returnGeometry: true,
            outSpatialReference: view.spatialReference
        });

        // Ignore an older click if a newer selection was made.
        if (
            selectionId !== tableSelectionId ||
            view.destroyed ||
            window.objectsMapView !== view
        ) {
            return;
        }

        const sourceFeature = result.features[0];

        if (!sourceFeature?.geometry) {
            throw new Error("The selected record has no map geometry.");
        }

// Remove the previous selection marker.
        if (
            selectedTableGraphic &&
            selectedTableView &&
            !selectedTableView.destroyed
        ) {
            selectedTableView.graphics.remove(selectedTableGraphic);
        }

// Create a standalone graphic.
// It does not depend on the temporary query layer.
        const feature = new Graphic({
            geometry: sourceFeature.geometry.clone(),

            attributes: {
                tableObjectId: record.objectId,
                tableName: record.name ?? "",
                tableAddress: record.address ?? "",
                tableCity: sourceFeature.attributes.grad ?? ""
            },

            popupTemplate: {
                title: "{tableName}",

                content: [
                    {
                        type: "fields",

                        fieldInfos: [
                            {
                                fieldName: "tableObjectId",
                                label: "OBJECT ID",
                                format: {
                                    places: 0,
                                    digitSeparator: false
                                }
                            },
                            {
                                fieldName: "tableName",
                                label: "Име"
                            },
                            {
                                fieldName: "tableAddress",
                                label: "Адреса"
                            },
                            {
                                fieldName: "tableCity",
                                label: "Град"
                            }
                        ]
                    }
                ]
            }
        });

// Draw the selected point clearly.
        if (feature.geometry.type === "point") {
            feature.symbol = {
                type: "simple-marker",
                color: "#f28c28",
                size: 16,
                outline: {
                    color: "#ffffff",
                    width: 2
                }
            };
        }

        view.graphics.add(feature);

        selectedTableGraphic = feature;
        selectedTableView = view;

        // Bring the map into view if the table is below the viewport.
        view.container.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        view.closePopup();

        if (feature.geometry.type === "point") {
            await view.goTo({
                target: feature.geometry,
                zoom: 18
            });
        } else {
            await view.goTo(feature.geometry);
        }

        if (
            selectionId !== tableSelectionId ||
            view.destroyed ||
            window.objectsMapView !== view
        ) {
            return;
        }

        await view.openPopup({
            features: [feature],
            location:
                feature.geometry.type === "point"
                    ? feature.geometry
                    : feature.geometry.extent.center
        });
    } catch (error) {
        // A newer map movement can interrupt an earlier animation.
        if (error.name !== "AbortError") {
            console.error("Could not select the table object:", error);
        }
    } finally {
        layer?.destroy();
    }
};