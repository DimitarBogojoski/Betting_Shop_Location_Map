/* ====================================
   OBJECT DATA
==================================== */

const OBJECTS_LAYER_URL =
    "https://gisserver.gdi.mk/arcgis/rest/services/KLADILNICI/KLADILNICI_KAZINA_MK/MapServer/1";

const BATCH_SIZE = 50;

function normalizeField(value) {
    return String(value ?? "")
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
}


/* ====================================
   LOAD TABLE DATA
==================================== */

window.loadObjectsTableData = async function () {
    const tbody = document.getElementById("objects-table-body");
    const summary = document.getElementById("objects-table-summary");
    const exportButton = document.getElementById("export-objects");
    const pagination = document.getElementById("objects-pagination");

    if (!tbody || !summary || !exportButton || !pagination) return;

    let layer;

    summary.textContent = "Се вчитуваат податоците...";
    exportButton.disabled = true;
    tbody.replaceChildren();
    pagination.replaceChildren();

    try {
        if (document.readyState !== "complete") {
            await new Promise(resolve =>
                window.addEventListener("load", resolve, { once: true })
            );
        }

        if (!tbody.isConnected) return;

        const [FeatureLayer] = await $arcgis.import([
            "@arcgis/core/layers/FeatureLayer.js"
        ]);

        layer = new FeatureLayer({ url: OBJECTS_LAYER_URL });

        await layer.load();

        if (!tbody.isConnected) return;

        const findField = candidates => {
            const names = new Set(candidates.map(normalizeField));

            return layer.fields.find(field =>
                names.has(normalizeField(field.name)) ||
                names.has(normalizeField(field.alias))
            )?.name;
        };

        const idField = layer.objectIdField;

        const nameField = findField([
            "ИМЕ", "IME", "NAME", "NAZIV", "НАЗИВ"
        ]);

        const addressField = findField([
            "АДРЕСА", "ADRESA", "ADDRESS", "ADRES"
        ]);

        if (!idField || !nameField || !addressField) {
            throw new Error(
                `Missing fields: ID=${idField}, name=${nameField}, address=${addressField}`
            );
        }

        const objectIds = await layer.queryObjectIds({
            where: "1=1"
        }) || [];

        objectIds.sort((a, b) => a - b);

        const records = [];

        for (let i = 0; i < objectIds.length; i += BATCH_SIZE) {
            if (!tbody.isConnected) return;

            const result = await layer.queryFeatures({
                objectIds: objectIds.slice(i, i + BATCH_SIZE),
                outFields: [idField, nameField, addressField],
                returnGeometry: false
            });

            records.push(...result.features.map(feature => ({
                objectId: feature.attributes[idField],
                name: feature.attributes[nameField],
                address: feature.attributes[addressField]
            })));

            if (!tbody.isConnected) return;

            summary.textContent =
                `Вчитани ${records.length} од ${objectIds.length} записи`;
        }

        records.sort((a, b) => a.objectId - b.objectId);

        if (tbody.isConnected) {
            window.initObjectsTable(records);
        }

    } catch (error) {
        console.error("Failed to load table data:", error);

        if (tbody.isConnected) {
            summary.textContent =
                "Грешка при вчитување на податоците. Проверете ја конзолата.";

            exportButton.disabled = true;
        }

    } finally {
        layer?.destroy();
    }
};


/* ====================================
   SELECT OBJECT ON MAP
==================================== */

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

    const isCurrent = () =>
        selectionId === tableSelectionId &&
        window.objectsMapView === view &&
        !view.destroyed;

    let layer;

    try {
        const [FeatureLayer, Graphic] = await $arcgis.import([
            "@arcgis/core/layers/FeatureLayer.js",
            "@arcgis/core/Graphic.js"
        ]);

        if (!isCurrent()) return;

        layer = new FeatureLayer({
            url: OBJECTS_LAYER_URL
        });

        await layer.load();
        await view.when();

        if (!isCurrent()) return;

        const result = await layer.queryFeatures({
            objectIds: [record.objectId],
            outFields: ["*"],
            returnGeometry: true,
            outSpatialReference: view.spatialReference
        });

        if (!isCurrent()) return;

        const sourceFeature = result.features[0];

        if (!sourceFeature?.geometry) {
            throw new Error("Selected record has no map geometry.");
        }

        if (selectedTableGraphic && selectedTableView && !selectedTableView.destroyed) {
            selectedTableView.graphics.remove(selectedTableGraphic);
        }

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
                content: [{
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "tableName", label: "Име" },
                        { fieldName: "tableAddress", label: "Адреса" },
                        { fieldName: "tableCity", label: "Град" }
                    ]
                }]
            }
        });

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

        view.container.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        view.closePopup();

        await view.goTo(
            feature.geometry.type === "point"
                ? { target: feature.geometry, zoom: 18 }
                : feature.geometry
        );

        if (!isCurrent()) return;

        await view.openPopup({
            features: [feature],
            location: feature.geometry.type === "point"
                ? feature.geometry
                : feature.geometry.extent.center
        });

    } catch (error) {
        if (error.name !== "AbortError" && isCurrent()) {
            console.error("Could not select the table object:", error);
        }

    } finally {
        layer?.destroy();
    }
};