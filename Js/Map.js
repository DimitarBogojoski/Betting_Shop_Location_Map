
let mapView = null;
let mapInitId = 0;
let mapLanguageHandler = null;
let distanceMapClickHandle = null;
let distanceTranslationObserver = null;
let areaTranslationObserver = null;
let bookmarkTranslationObserver = null;

const OBLOZUVALNICI_URL =
    "https://gisserver.gdi.mk/arcgis/rest/services/KLADILNICI/KLADILNICI_KAZINA_MK/MapServer/1";



window.destroyMapPage = function () {

    mapInitId++;

    if (mapLanguageHandler) {
        document.removeEventListener(
            "site-language-changed",
            mapLanguageHandler
        );

        mapLanguageHandler = null;
    }

    if (distanceTranslationObserver) {
        distanceTranslationObserver.disconnect();
        distanceTranslationObserver = null;
    }

    if (distanceMapClickHandle) {
        distanceMapClickHandle.remove();
        distanceMapClickHandle = null;
    }

    if (areaTranslationObserver) {
        areaTranslationObserver.disconnect();
        areaTranslationObserver = null;
    }

    if (bookmarkTranslationObserver) {
        bookmarkTranslationObserver.disconnect();
        bookmarkTranslationObserver = null;
    }

    if (mapView) {

        if (window.objectsMapView === mapView) {
            window.objectsMapView = null;
        }

        mapView.destroy();
        mapView = null;
    }
};

window.initMapPage = async function () {

    window.destroyMapPage();

    const thisInit = mapInitId;

    const container = document.getElementById("map-view");

    if (!container) return;

    try {


        const [
            ArcGISMap,
            MapView,
            FeatureLayer,
            GraphicsLayer,
            Search,
            LayerList,
            Home
        ] = await $arcgis.import([

            "@arcgis/core/Map.js",
            "@arcgis/core/views/MapView.js",
            "@arcgis/core/layers/FeatureLayer.js",
            "@arcgis/core/layers/GraphicsLayer.js",
            "@arcgis/core/widgets/Search.js",
            "@arcgis/core/widgets/LayerList.js",
            "@arcgis/core/widgets/Home.js"
        ]);

        if (
            thisInit !== mapInitId ||
            !container.isConnected
        ) {
            return;
        }

        function createExpand({content, icon, translationKey})
        {
            const expand = createMapComponent("arcgis-expand", {
                expandIcon: icon
            });

            expand.append(content);
            expand.dataset.translationKey = translationKey;
            return expand;
        }


//MAP
        const map = new ArcGISMap({
            basemap: "topo-vector"
        });


//GDI LAYER
        const OblozuvalnicaLayer = new FeatureLayer({

            url: OBLOZUVALNICI_URL,

            title: window.t("bettingShops"),

            outFields: ["ime", "adresa", "grad"],

            listMode: "show",

            renderer:{
                type: "simple",

                symbol:{
                    type: "picture-marker",
                    url: "Images/SoccerBall.png",
                    width: "18px",
                    height: "18px"
                }
            },

            popupTemplate: {
                title: "{ime}",

                content: [
                    {
                        type: "fields",

                        fieldInfos: [
                            {
                                fieldName: "ime",
                                label: "Име"
                            },
                            {
                                fieldName: "adresa",
                                label: "Адреса"
                            },
                            {
                                fieldName: "grad",
                                label: "Град"
                            },
                        ]
                    }
                ]
            }
        });

        map.add(OblozuvalnicaLayer);

//SKETCH
        const sketchGraphicsLayer = new GraphicsLayer({
            title: window.t("drawings"),
            listMode: "hide"
        });

        map.add(sketchGraphicsLayer);



//MAP VIEW
        const view = new MapView({

            container: container,

            map: map,

            center: [21.65, 41.60],

            zoom: 8,

            constraints: {
                minZoom: 5,
                maxZoom: 19
            },

            popup: {
                dockEnabled: false
            }

        });

        view.ui.remove("zoom");

        mapView = view;
        window.objectsMapView = view;

        await view.when();

        if (
            thisInit !== mapInitId ||
            !container.isConnected
        ) {
            view.destroy();
            return;
        }

        await OblozuvalnicaLayer.load();


        const componentNames = [

            "arcgis-legend",
            "arcgis-scale-bar",
            "arcgis-bookmarks",
            "arcgis-coordinate-conversion",
            "arcgis-distance-measurement-2d",
            "arcgis-area-measurement-2d",
            "arcgis-locate",
            "arcgis-print",
            "arcgis-compass",
            "arcgis-sketch"

        ];

        await Promise.all(

            componentNames.map(name =>
                customElements.whenDefined(name)
            )
        );

        if (
            thisInit !== mapInitId ||
            !container.isConnected
        ) {
            view.destroy();
            return;
        }

//HELPER: COMP CREATION
        function createMapComponent(tagName, properties = {}) {

            const component = document.createElement(tagName);

            component.view = view;

            Object.assign(component, properties);

            return component;
        }
//ZOOM

        const Zoom = createMapComponent("arcgis-zoom", {
            label: window.t("zoom"),
        });
        Zoom.messageOverrides = {
            zoomIn: window.t("zoomIn"),
            zoomOut: window.t("zoomOut")
        };

//SEARCH
        const searchContainer = document.createElement("div");

        const search = new Search({
            view: view,
            container: searchContainer,
            locationEnabled: false
        });

// Wait for the SearchViewModel to initialize.
        await search.viewModel.when();

// Apply the selected language to all sources.
        updateSearchPlaceholder();

        const searchExpand = createExpand({
            content: searchContainer,
            icon: "search",
            translationKey: "search",
            title: "Search",
        });

        function updateSearchPlaceholder() {
            search.allSources.forEach((source) => {
                source.placeholder = window.t("searchPlaceholder");
            });
        }

//LAYER LIST
        const layerListContainer = document.createElement("div");

        const layerList = new LayerList({
            view: view,
            container: layerListContainer
        });

        const layerListExpand = createExpand({
            content: layerListContainer,
            icon: "layers",
            translationKey: "layers"
        });


//BASEMAP LIST
        const basemapGallery = createMapComponent(
            "arcgis-basemap-gallery"
        );
        basemapGallery.style.width = "240px";
        basemapGallery.style.maxWidth = "calc(100vw - 90px)";
        basemapGallery.style.maxHeight = "65vh";

        const basemapGalleryExpand = createExpand({
            content: basemapGallery,
            icon: "basemap",
            translationKey: "basemaps"
        });



//DISTANCE MEASUREMENT
        const distanceMeasurement = createMapComponent(
            "arcgis-distance-measurement-2d",
            {
                unit: "metric"
            }
        );

// Expose component temporarily for debugging

        const measurementExpand = createExpand({
            content: distanceMeasurement,
            icon: "measure",
            translationKey: "distance"
        });

        window.distanceMeasurement = distanceMeasurement;

// Find elements inside nested Shadow DOMs
        function queryShadowDOM(host, selector) {

            const results = new Set();
            const visited = new Set();

            function search(root) {

                if (!root || visited.has(root)) return;

                visited.add(root);

                root.querySelectorAll?.(selector).forEach(element => {
                    results.add(element);
                });

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        search(element.shadowRoot);
                    }

                });
            }

            search(host);

            if (host.shadowRoot) {
                search(host.shadowRoot);
            }

            return [...results];
        }


// Change text without destroying nested HTML or icons
        function changeElementText(element, newText) {

            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT
            );

            let node;

            while (node = walker.nextNode()) {

                if (node.textContent.trim()) {

                    if (node.textContent.trim() !== newText) {
                        node.textContent = newText;
                    }

                    return true;
                }
            }

            return false;
        }

        function findTextNode(root, possibleTexts) {

            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT
            );

            let node;

            while (node = walker.nextNode()) {

                if (possibleTexts.includes(node.textContent.trim())) {
                    return node;
                }
            }

            return null;
        }

//AREA MEASUREMENT
        const areaMeasurement = createMapComponent(
            "arcgis-area-measurement-2d",
            {
                unit: "metric"
            }
        );
        const areaExpand = createExpand({
            content: areaMeasurement,
            icon: "measure-area",
            translationKey: "area"
        });



//BOOKMARKS
        const bookmarks = createMapComponent("arcgis-bookmarks",{
            showAddBookmarkButton: true,
            showEditBookmarkButton: true,
            dragEnabled: true
        });

        const bookmarksExpand = createExpand({
            content: bookmarks,
            icon: "bookmark",
            translationKey: "bookmarks"
        });


        function updateBookmarkTranslations() {

            // ====================================
            // NO BOOKMARKS HEADING
            // ====================================

            const heading = queryShadowDOM(
                bookmarks,
                "h2.no-bookmarks-heading"
            ).find(element =>
                element.dataset.translationKey === "bookmarksNoBookmarks" ||
                element.textContent.trim() === "No bookmarks"
            );

            if (heading) {

                heading.dataset.translationKey = "bookmarksNoBookmarks";

                const translated = window.t("bookmarksNoBookmarks");

                if (translated) {
                    changeElementText(heading, translated);
                }
            }


            // ====================================
            // NO BOOKMARKS DESCRIPTION
            // ====================================

            const description = queryShadowDOM(
                bookmarks,
                "p.no-bookmarks-description"
            ).find(element =>
                element.dataset.translationKey === "bookmarksEmptyDescription" ||
                element.textContent.trim() ===
                "Add bookmarks to your map and they will appear here."
            );

            if (description) {

                description.dataset.translationKey =
                    "bookmarksEmptyDescription";

                const translated = window.t("bookmarksEmptyDescription");

                if (translated) {
                    changeElementText(description, translated);
                }
            }


            // ====================================
            // ADD BOOKMARK BUTTON
            // ====================================

            const addButton = queryShadowDOM(
                bookmarks,
                "calcite-button.button"
            ).find(button =>
                button.dataset.translationKey === "bookmarkAdd" ||
                button.textContent.trim() === "Add bookmark"
            );

            if (addButton) {

                addButton.dataset.translationKey = "bookmarkAdd";

                const translated = window.t("bookmarkAdd");

                if (translated) {
                    changeElementText(addButton, translated);
                }
            }


// ====================================
// BOOKMARK DIALOG HEADING
// ====================================

            const dialogHeading = queryShadowDOM(
                bookmarks,
                "h2.heading"
            ).find(element =>
                element.dataset.translationKey === "bookmarkDialogHeading" ||
                [
                    "Add bookmark",
                    "Додај обележувач",
                    "Shto faqeshënues"
                ].includes(element.textContent.trim())
            );

            if (dialogHeading) {

                dialogHeading.dataset.translationKey =
                    "bookmarkDialogHeading";

                changeElementText(
                    dialogHeading,
                    window.t("bookmarkDialogHeading")
                );
            }


// ====================================
// BOOKMARK TITLE LABEL
// ====================================

            const titleVariants = [
                "Title",
                "Наслов",
                "Titulli"
            ];

            const titleLabels = queryShadowDOM(
                bookmarks,
                "calcite-label"
            );

            const titleLabel = titleLabels.find(label =>
                label.dataset.translationKey === "bookmarkTitleLabel" ||
                findTextNode(label, titleVariants)
            );

            if (titleLabel) {

                const textNode =
                    findTextNode(titleLabel, titleVariants) ||
                    [...titleLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (textNode) {

                    const translated = window.t("bookmarkTitleLabel");

                    if (translated && textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    titleLabel.dataset.translationKey =
                        "bookmarkTitleLabel";
                }
            }


// ====================================
// BOOKMARK TITLE INPUT
// ====================================

            const bookmarkInputs = queryShadowDOM(
                bookmarks,
                'input[name="bookmark-name"]'
            );

            const translatedPlaceholder =
                window.t("bookmarkTitlePlaceholder");

            bookmarkInputs.forEach(input => {

                if (!translatedPlaceholder) {
                    console.warn("Missing bookmarkTitlePlaceholder translation.");
                    return;
                }

                // Update the native input property.
                if (input.placeholder !== translatedPlaceholder) {
                    input.placeholder = translatedPlaceholder;
                }

                // Update the HTML attribute.
                if (
                    input.getAttribute("placeholder") !== translatedPlaceholder
                ) {
                    input.setAttribute("placeholder", translatedPlaceholder);
                }

                // Update accessibility label.
                const titleLabel = window.t("bookmarkTitleLabel");

                if (titleLabel) {
                    input.setAttribute("aria-label", titleLabel);
                }

                // Also update a Calcite input host, if present.
                const host = input.getRootNode()?.host;

                if (host?.tagName?.toLowerCase() === "calcite-input") {
                    host.placeholder = translatedPlaceholder;
                }

            });
// ====================================
// CANCEL BUTTON
// ====================================

            const footerButtons = queryShadowDOM(
                bookmarks,
                'calcite-button[slot="footer"]'
            );

            const cancelButton = footerButtons.find(button =>
                button.dataset.translationKey === "bookmarkCancel" ||
                [
                    "Cancel",
                    "Откажи",
                    "Anulo"
                ].includes(button.textContent.trim())
            );

            if (cancelButton) {

                cancelButton.dataset.translationKey = "bookmarkCancel";

                changeElementText(
                    cancelButton,
                    window.t("bookmarkCancel")
                );

            }


// ====================================
// ADD BUTTON
// ====================================

            const submitButton = footerButtons.find(button =>
                button.dataset.translationKey === "bookmarkSubmit" ||
                [
                    "Add",
                    "Додај",
                    "Shto"
                ].includes(button.textContent.trim())
            );

            if (submitButton) {

                submitButton.dataset.translationKey = "bookmarkSubmit";

                changeElementText(
                    submitButton,
                    window.t("bookmarkSubmit")
                );

            }


// ====================================
// EDIT BOOKMARK HEADING
// ====================================

            const editHeading = queryShadowDOM(
                bookmarks,
                "h2.heading"
            ).find(element =>
                element.dataset.translationKey === "bookmarkEditHeading" ||
                element.textContent.trim() === "Edit"
            );

            if (editHeading) {

                editHeading.dataset.translationKey = "bookmarkEditHeading";

                changeElementText(
                    editHeading,
                    window.t("bookmarkEditHeading")
                );
            }


// ====================================
// THUMBNAIL LABEL
// ====================================

            const thumbnailVariants = [
                "Thumbnail",
                "Сликичка",
                "Miniaturë"
            ];

            const thumbnailLabels = queryShadowDOM(
                bookmarks,
                "calcite-label"
            );

            const thumbnailLabel = thumbnailLabels.find(label =>
                label.dataset.translationKey === "bookmarkThumbnail" ||
                findTextNode(label, thumbnailVariants)
            );

            if (thumbnailLabel) {

                const textNode =
                    findTextNode(thumbnailLabel, thumbnailVariants) ||
                    [...thumbnailLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (textNode) {

                    const translated = window.t("bookmarkThumbnail");

                    if (translated && textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    thumbnailLabel.dataset.translationKey = "bookmarkThumbnail";
                }
            }


// ====================================
// THUMBNAIL OPTIONS
// ====================================

            const thumbnailOptions = [
                {
                    value: "screenshot",
                    key: "bookmarkScreenshot"
                },
                {
                    value: "url",
                    key: "bookmarkURL"
                },
                {
                    value: "none",
                    key: "bookmarkNone"
                }
            ];

            thumbnailOptions.forEach(({value, key}) => {

                const chip = queryShadowDOM(
                    bookmarks,
                    `calcite-chip[value="${value}"]`
                )[0];

                if (!chip) return;

                const translated = window.t(key);

                if (!translated) {
                    console.warn("Missing bookmark translation:", key);
                    return;
                }

                changeElementText(chip, translated);

                chip.dataset.translationKey = key;

            });


// ====================================
// UPDATE THUMBNAIL BUTTON
// ====================================

            const updateThumbnailButton = queryShadowDOM(
                bookmarks,
                "calcite-button.authoring-refresh-thumbnail-button"
            )[0];

            if (updateThumbnailButton) {

                const translated = window.t("bookmarkUpdate");

                if (translated) {

                    changeElementText(
                        updateThumbnailButton,
                        translated
                    );

                    updateThumbnailButton.dataset.translationKey =
                        "bookmarkUpdate";
                }
            }


// ====================================
// DELETE BOOKMARK BUTTON
// ====================================

            const deleteButton = queryShadowDOM(
                bookmarks,
                'calcite-button[slot="footer"]'
            ).find(button =>
                button.dataset.translationKey === "bookmarkDelete" ||
                button.textContent.trim() === "Delete"
            );

            if (deleteButton) {

                const translated = window.t("bookmarkDelete");

                if (translated) {

                    changeElementText(
                        deleteButton,
                        translated
                    );

                    deleteButton.dataset.translationKey =
                        "bookmarkDelete";
                }
            }

            // ====================================
// SAVE BOOKMARK BUTTON
// ====================================

            const saveButton = queryShadowDOM(
                bookmarks,
                'calcite-button[slot="footer"][type="submit"]'
            ).find(button =>
                button.dataset.translationKey === "bookmarkSave" ||
                ["Save", "Зачувај", "Ruaj"].includes(
                    button.textContent.trim()
                )
            );

            if (saveButton) {

                const translated = window.t("bookmarkSave");

                if (translated) {

                    changeElementText(
                        saveButton,
                        translated
                    );

                    saveButton.dataset.translationKey = "bookmarkSave";
                }
            }

        }

        // ====================================
// BOOKMARK TRANSLATION OBSERVER
// ====================================

        function startBookmarkTranslationObserver() {

            if (bookmarkTranslationObserver) {
                bookmarkTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeBookmarkTree(bookmarks);
                observeBookmarkTree(bookmarksExpand);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (
                        thisInit !== mapInitId ||
                        mapView !== view ||
                        !container.isConnected
                    ) {
                        return;
                    }

                    updateBookmarkTranslations();

                });
            });

            bookmarkTranslationObserver = observer;

            function observeBookmarkTree(root) {

                if (!root) return;

                if (!observedRoots.has(root)) {

                    observedRoots.add(root);

                    observer.observe(root, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributes: true,
                        attributeFilter: [
                            "placeholder",
                            "aria-label"
                            ]
                    });
                }

                if (root.shadowRoot) {
                    observeBookmarkTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeBookmarkTree(element.shadowRoot);
                    }

                });
            }

            observeBookmarkTree(bookmarks);
            observeBookmarkTree(bookmarksExpand);

        }




//HOME
        const home = new Home({
            view: view,
            label: window.t("homeW"),
        });
        home.uiStrings={title: window.t("homeW")};



//LEGEND
        const legend = createMapComponent("arcgis-legend");
        legend.layerInfos = [

            {
                layer: OblozuvalnicaLayer,
                title: window.t("Legend")
            }

        ];

        legend.style.position = "relative";
        legend.style.top = "10px";




//SKETCH
        const sketch = createMapComponent(
            "arcgis-sketch",
            {
                layer: sketchGraphicsLayer,
                defaultGraphicsLayerDisabled: true,
                toolbarKind: "docked"
            }
        );



//CONVERTER
        const coordinateConversion = createMapComponent(
            "arcgis-coordinate-conversion"
        );




        const compass = createMapComponent("arcgis-compass", {
            label: window.t("compass")
        });
        compass.messageOverrides = {
            reset: window.t("compass"),
            title: window.t("compass")
        };




//PRINT
        const print = createMapComponent("arcgis-print");

        const printExpand = createExpand({
            content: print,
            icon: "print",
            translationKey: "print"
        });


//EVAL PROF
        const elevationProfile = createMapComponent(
            "arcgis-elevation-profile");

        const elevationExpand = createExpand({
            content: elevationProfile,
            icon: "measure",
            translationKey: "elevation"
        });


//LOCATE
        const locate = createMapComponent("arcgis-locate", {
            label: window.t("locate")
        });

        locate.messageOverrides = {
            title: window.t("locate"),
            label: window.t("locate")
        };



//SCALEBAR
        const scaleBar = createMapComponent("arcgis-scale-bar", {

            unit: "metric",

            barStyle: "line"

        });


        function updateDistanceTranslations() {

            // ====================================
            // NEW MEASUREMENT BUTTON
            // ====================================

            const buttons = queryShadowDOM(
                distanceMeasurement,
                'calcite-button[slot="actions"]'
            );

            const newMeasurementButton = buttons.find(button =>
                button.dataset.translationKey === "distanceNewMeasurement" ||
                button.textContent.trim() === "New measurement"
            );

            if (newMeasurementButton) {

                newMeasurementButton.dataset.translationKey =
                    "distanceNewMeasurement";

                changeElementText(
                    newMeasurementButton,
                    window.t("distanceNewMeasurement")
                );
            }


            // ====================================
            // MEASUREMENT INSTRUCTION
            // ====================================

            const instructionParagraph = queryShadowDOM(
                distanceMeasurement,
                ".hint p"
            ).find(element =>
                element.dataset.translationKey === "distanceInstruction" ||
                element.textContent.trim() ===
                "Start measuring by clicking in the map to place your first point"
            );

            if (instructionParagraph) {

                instructionParagraph.dataset.translationKey =
                    "distanceInstruction";

                changeElementText(
                    instructionParagraph,
                    window.t("distanceInstruction")
                );
            }


            // ====================================
// UNIT LABEL
// ====================================

            const unitTranslations = [
                "Unit",
                "Единица",
                "Njësia"
            ];

            const unitLabels = queryShadowDOM(
                distanceMeasurement,
                "calcite-label.root"
            );

            const unitLabel = unitLabels.find(label =>
                label.dataset.translationKey === "distanceUnits" ||
                findTextNode(label, unitTranslations)
            );

            const translatedUnit = window.t("distanceUnits");

             if (unitLabel) {

                const textNode =
                    findTextNode(unitLabel, unitTranslations) ||
                    [...unitLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );


                    if (textNode.textContent.trim() !== translatedUnit) {
                        textNode.textContent = translatedUnit;
                    }

                    unitLabel.dataset.translationKey =
                        "distanceUnits";
            }


// ====================================
// TRANSLATE UNIT DROPDOWN OPTIONS
// ====================================

            const unitSelect = queryShadowDOM(
                distanceMeasurement,
                "select.select"
            )[0];

            if (unitSelect) {

                const unitOptions = {
                    "metric": "distanceUnitMetric",
                    "imperial": "distanceUnitImperial",
                    "inches": "distanceUnitInches",
                    "feet": "distanceUnitFeet",
                    "yards": "distanceUnitYards",
                    "miles": "distanceUnitMiles",
                    "nautical-miles": "distanceUnitNauticalMiles",
                    "us-feet": "distanceUnitUSFeet",
                    "millimeters": "distanceUnitMillimeters",
                    "centimeters": "distanceUnitCentimeters",
                    "decimeters": "distanceUnitDecimeters",
                    "kilometers": "distanceUnitKilometers"
                };

                // Translate dropdown accessibility label.
                unitSelect.setAttribute(
                    "aria-label",
                    window.t("distanceUnit")
                );

                // Translate every option.
                Object.entries(unitOptions).forEach(([value, key]) => {

                    const option = [...unitSelect.options].find(
                        option => option.value === value
                    );

                    if (!option) return;

                    const translatedText = window.t(key);

                    if (option.textContent !== translatedText) {
                        option.textContent = translatedText;
                    }

                    if (option.label !== translatedText) {
                        option.label = translatedText;
                    }
                });
            }

// ====================================
// TRANSLATE DISTANCE LABEL
// ====================================

            const distanceLabelTranslations = [
                "Distance",
                "Растојание",
                "Distanca"
            ];

            const distanceLabels = queryShadowDOM(
                distanceMeasurement,
                "calcite-label.title"
            );

            const distanceLabel = distanceLabels.find(label =>
                label.dataset.translationKey === "distanceResult" ||
                findTextNode(label, distanceLabelTranslations)
            );

            const translatedDistance = window.t("distanceResult");

            if (distanceLabel) {

                distanceLabel.dataset.translationKey = "distanceResult";

                changeElementText(
                    distanceLabel,
                    translatedDistance
                );
            }
        }


        function updateAreaTranslations() {

            // ====================================
            // NEW MEASUREMENT BUTTON
            // ====================================

            const buttons = queryShadowDOM(
                areaMeasurement,
                'calcite-button[slot="actions"]'
            );

            const newMeasurementButton = buttons.find(button =>
                button.dataset.translationKey === "areaNewMeasurement" ||
                [
                    "New measurement",
                    "Ново мерење",
                    "Matje e re"
                ].includes(button.textContent.trim())
            );

            if (newMeasurementButton) {

                newMeasurementButton.dataset.translationKey =
                    "areaNewMeasurement";

                changeElementText(
                    newMeasurementButton,
                    window.t("distanceNewMeasurement")
                );
            }


            // ====================================
            // MEASUREMENT INSTRUCTION
            // ====================================

            const instruction = queryShadowDOM(
                areaMeasurement,
                ".hint p"
            ).find(element =>
                element.dataset.translationKey === "distanceInstruction" ||
                element.textContent.trim() ===
                "Start measuring by clicking in the map to place your first point"
            );

            if (instruction) {

                instruction.dataset.translationKey =
                    "distanceInstruction";

                changeElementText(
                    instruction,
                    window.t("distanceInstruction")
                );
            }


            // ====================================
            // UNIT LABEL
            // ====================================

            const unitTranslations = [
                "Unit",
                "Единица",
                "Njësia"
            ];

            const unitLabels = queryShadowDOM(
                areaMeasurement,
                "calcite-label.root"
            );

            const unitLabel = unitLabels.find(label =>
                label.dataset.translationKey === "distanceUnits" ||
                findTextNode(label, unitTranslations)
            );

            if (unitLabel) {

                const textNode =
                    findTextNode(unitLabel, unitTranslations) ||
                    [...unitLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (textNode) {

                    const translated = window.t("distanceUnits");

                    if (translated &&
                        textNode.textContent.trim() !== translated) {

                        textNode.textContent = translated;

                    }

                    unitLabel.dataset.translationKey = "distanceUnits";
                }
            }


            // ====================================
            // UNIT DROPDOWN OPTIONS
            // ====================================

            const unitSelect = queryShadowDOM(
                areaMeasurement,
                "select.select"
            )[0];

            if (unitSelect) {

                const unitOptions = {
                    "metric": "distanceUnitMetric",
                    "imperial": "distanceUnitImperial",
                    "inches": "distanceUnitInches",
                    "feet": "distanceUnitFeet",
                    "yards": "distanceUnitYards",
                    "miles": "distanceUnitMiles",
                    "nautical-miles": "distanceUnitNauticalMiles",
                    "us-feet": "distanceUnitUSFeet",
                    "millimeters": "distanceUnitMillimeters",
                    "centimeters": "distanceUnitCentimeters",
                    "decimeters": "distanceUnitDecimeters",
                    "kilometers": "distanceUnitKilometers"
                };

                unitSelect.setAttribute(
                    "aria-label",
                    window.t("distanceUnits")
                );

                Object.entries(unitOptions).forEach(([value, key]) => {

                    const option = [...unitSelect.options].find(
                        option => option.value === value
                    );

                    if (!option) return;

                    const translated = window.t(key);

                    if (!translated) return;

                    if (option.textContent !== translated) {
                        option.textContent = translated;
                    }

                    if (option.label !== translated) {
                        option.label = translated;
                    }

                });
            }


            // ====================================
            // AREA AND PERIMETER RESULTS
            // ====================================

            const resultLabels = [
                {
                    key: "areaResult",
                    variants: [
                        "Area",
                        "Површина",
                        "Sipërfaqja"
                    ]
                },
                {
                    key: "perimeterResult",
                    variants: [
                        "Perimeter",
                        "Периметар",
                        "Perimetri"
                    ]
                }
            ];

            const areaLabels = queryShadowDOM(
                areaMeasurement,
                "calcite-label.title"
            );

            resultLabels.forEach(({key, variants}) => {

                const label = areaLabels.find(element =>
                    element.dataset.translationKey === key ||
                    findTextNode(element, variants)
                );

                if (!label) return;

                const textNode =
                    findTextNode(label, variants) ||
                    [...label.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (!textNode) return;

                const translated = window.t(key);


                if (textNode.textContent.trim() !== translated) {
                    textNode.textContent = translated;
                }

                label.dataset.translationKey = key;


            });


            // ====================================
// TRANSLATE AREA UNIT DROPDOWN OPTIONS
// ====================================

            const areaUnitTranslations = [
                {
                    key: "areaUnitSquareInches",
                    variants: ["Square inches", "Квадратни инчи", "Inç katrorë"]
                },
                {
                    key: "areaUnitSquareFeet",
                    variants: ["Square feet", "Квадратни стапки", "Këmbë katrorë"]
                },
                {
                    key: "areaUnitSquareYards",
                    variants: ["Square yards", "Квадратни јарди", "Jardë katrorë"]
                },
                {
                    key: "areaUnitSquareMiles",
                    variants: ["Square miles", "Квадратни милји", "Milje katrorë"]
                },
                {
                    key: "areaUnitSquareNauticalMiles",
                    variants: [
                        "Square nautical miles",
                        "Квадратни наутички милји",
                        "Milje detare katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareUSFeet",
                    variants: [
                        "Square feet (US)",
                        "Квадратни стапки (САД)",
                        "Këmbë katrorë (SHBA)"
                    ]
                },
                {
                    key: "areaUnitSquareMillimeters",
                    variants: [
                        "Square millimeters",
                        "Квадратни милиметри",
                        "Milimetra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareCentimeters",
                    variants: [
                        "Square centimeters",
                        "Квадратни сантиметри",
                        "Centimetra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareDecimeters",
                    variants: [
                        "Square decimeters",
                        "Квадратни дециметри",
                        "Decimetra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareMeters",
                    variants: [
                        "Square meters",
                        "Квадратни метри",
                        "Metra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareKilometers",
                    variants: [
                        "Square kilometers",
                        "Квадратни километри",
                        "Kilometra katrorë"
                    ]
                },
                {
                    key: "areaUnitAcres",
                    variants: ["Acres", "Акри", "Akre"]
                },
                {
                    key: "areaUnitAres",
                    variants: ["Ares", "Ари", "Are"]
                },
                {
                    key: "areaUnitHectares",
                    variants: ["Hectares", "Хектари", "Hektarë"]
                }
            ];

            const areaOptions = queryShadowDOM(
                areaMeasurement,
                "calcite-option"
            );

            areaOptions.forEach(option => {

                const translation = areaUnitTranslations.find(item =>
                    option.dataset.translationKey === item.key ||
                    findTextNode(option, item.variants)
                );

                if (!translation) return;

                const textNode =
                    findTextNode(option, translation.variants) ||
                    [...option.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (!textNode) return;

                const translatedText = window.t(translation.key);

                if (!translatedText) {
                    console.warn(
                        "Missing area unit translation:",
                        translation.key
                    );
                    return;
                }

                if (textNode.textContent.trim() !== translatedText) {
                    textNode.textContent = translatedText;
                }

                option.dataset.translationKey = translation.key;

                console.log(
                    "Area option translated:",
                    translatedText
                );

            });

        }



// ====================================
// OBSERVE DISTANCE WIDGET SHADOW DOM
// ====================================

            function startDistanceTranslationObserver() {

                if (distanceTranslationObserver) {
                    distanceTranslationObserver.disconnect();
                }

                const observedRoots = new WeakSet();
                let translationScheduled = false;

                const observer = new MutationObserver(() => {

                    // Discover newly created nested Shadow DOM elements.
                    observeDistanceTree(distanceMeasurement);
                    observeDistanceTree(measurementExpand);

                    if (translationScheduled) return;

                    translationScheduled = true;

                    requestAnimationFrame(() => {

                        translationScheduled = false;

                        if (
                            thisInit !== mapInitId ||
                            mapView !== view ||
                            !container.isConnected
                        ) {
                            return;
                        }

                        updateDistanceTranslations();

                    });

                });

                distanceTranslationObserver = observer;

                const observerOptions = {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true,
                    attributeFilter: [
                        "expanded",
                        "hidden",
                        "aria-expanded"
                    ]
                };

                function observeDistanceTree(root) {

                    if (!root) return;

                    // Observe each root only once.
                    if (!observedRoots.has(root)) {

                        observedRoots.add(root);

                        observer.observe(root, observerOptions);

                    }

                    // Discover nested Shadow DOM roots.
                    if (root.shadowRoot) {
                        observeDistanceTree(root.shadowRoot);
                    }

                    root.querySelectorAll?.("*").forEach(element => {

                        if (element.shadowRoot) {
                            observeDistanceTree(element.shadowRoot);
                        }

                    });

                }

                observeDistanceTree(distanceMeasurement);
                observeDistanceTree(measurementExpand);

            }

        // ====================================
// OBSERVE AREA WIDGET SHADOW DOM
// ====================================

        function startAreaTranslationObserver() {

            if (areaTranslationObserver) {
                areaTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeAreaTree(areaMeasurement);
                observeAreaTree(areaExpand);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (
                        thisInit !== mapInitId ||
                        mapView !== view ||
                        !container.isConnected
                    ) {
                        return;
                    }

                    updateAreaTranslations();

                });

            });

            areaTranslationObserver = observer;

            const options = {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: [
                    "expanded",
                    "hidden",
                    "aria-expanded"
                ]
            };

            function observeAreaTree(root) {

                if (!root || observedRoots.has(root)) return;

                observedRoots.add(root);

                observer.observe(root, options);

                if (root.shadowRoot) {
                    observeAreaTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeAreaTree(element.shadowRoot);
                    }

                });

            }

            observeAreaTree(areaMeasurement);
            observeAreaTree(areaExpand);

        }


// Re-translate after clicking the map to create a measurement result.
        distanceMapClickHandle = view.on("click", () => {

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    updateDistanceTranslations();
                });
            });

        });


            function updateMapTranslations() {
                if (
                    thisInit !== mapInitId ||
                    !container.isConnected ||
                    mapView !== view
                ) {
                    return;
                }

                // Layer titles used by the layer list and legend.
                OblozuvalnicaLayer.title = window.t("bettingShops");
                sketchGraphicsLayer.title = window.t("drawings");

                // Reassign the popup template with translated field labels.
                OblozuvalnicaLayer.popupTemplate = {
                    title: "{ime}",

                    content: [
                        {
                            type: "fields",

                            fieldInfos: [
                                {
                                    fieldName: "ime",
                                    label: window.t("name")
                                },
                                {
                                    fieldName: "adresa",
                                    label: window.t("addressW")
                                },
                                {
                                    fieldName: "grad",
                                    label: window.t("city")
                                }
                            ]
                        }
                    ]
                };

                legend.layerInfos = [
                    {
                        layer: OblozuvalnicaLayer,
                        title: window.t("bettingShops")
                    }
                ];

                const uiItems = [
                    [Zoom, "top-left"],
                    [searchExpand, "top-left"],
                    [layerListExpand, "top-left"],
                    [basemapGalleryExpand, "top-left"],
                    [measurementExpand, "top-left"],
                    [areaExpand, "top-left"],
                    [bookmarksExpand, "top-left"],
                    [home, "top-left"],
                    [legend, "bottom-left"],
                    [sketch, "top-right"],
                    [coordinateConversion, "top-right"],
                    [compass, "top-right"],
                    [printExpand, "bottom-right"],
                    [elevationExpand, "bottom-right"],
                    [locate, "bottom-right"],
                    [scaleBar, "bottom-right"]
                ];

                uiItems.forEach(([item, position]) => {
                    view.ui.add(item, position);
                });

                // Works with your Expand widgets and components.
                const expandTools = [
                    searchExpand,
                    layerListExpand,
                    basemapGalleryExpand,
                    measurementExpand,
                    areaExpand,
                    bookmarksExpand,
                    printExpand,
                    elevationExpand
                ];

                expandTools.forEach((expand) => {
                    const tool = window.t(expand.dataset.translationKey);

                    expand.label = tool;
                    expand.expandTooltip = tool;
                    expand.collapseTooltip = window.t("closeTool", {tool});
                });


                // Public labels for the legacy widgets.
                search.label = window.t("search");
                updateSearchPlaceholder();
                updateDistanceTranslations();
                updateAreaTranslations();
                updateBookmarkTranslations();
                startBookmarkTranslationObserver();

                layerList.label = window.t("layers");
                compass.label = window.t("compass");
                locate.label = window.t("locate");
                home.label = window.t("homeW");
                home.uiStrings = {
                    title: window.t("homeW")
                };


                compass.messageOverrides = {
                    reset: window.t("compass"),
                    title: window.t("compass")
                };
                locate.messageOverrides = {
                    title: window.t("locate"),
                    label: window.t("locate")
                };
                Zoom.messageOverrides = {
                    zoomIn: window.t("zoomIn"),
                    zoomOut: window.t("zoomOut")
                };


                // Public labels and host-level hover text for components.
                // These do not translate buttons inside their interfaces.
                const components = [
                    [basemapGallery, "basemaps"],
                    [distanceMeasurement, "distance"],
                    [areaMeasurement, "area"],
                    [bookmarks, "bookmarks"],
                    [legend, "legend"],
                    [sketch, "sketch"],
                    [coordinateConversion, "coordinates"],
                    [compass, "compass"],
                    [print, "print"],
                    [elevationProfile, "elevation"],
                    [locate, "locate"],
                    [scaleBar, "scale"],
                ];

                components.forEach(([component, key]) => {
                    const text = window.t(key);

                    component.label = text;
                    component.setAttribute("aria-label", text);
                    component.setAttribute("title", text);
                });
            }

// Apply initial translations.
        updateMapTranslations();

// Wait for both ArcGIS components.
        await Promise.all([
            distanceMeasurement.componentOnReady(),
            areaMeasurement.componentOnReady(),
            bookmarks.componentOnReady()
        ]);

// Start observing both widgets.
        startDistanceTranslationObserver();
        startAreaTranslationObserver();
        startBookmarkTranslationObserver();

// Apply translations immediately.
        updateDistanceTranslations();
        updateAreaTranslations();
        updateBookmarkTranslations();

// Listen for language changes.
        mapLanguageHandler = updateMapTranslations;

        document.addEventListener(
            "site-language-changed",
            mapLanguageHandler
        );

    } catch (error) {

        if (
            thisInit !== mapInitId ||
            !container.isConnected
        ) {
            return;
        }

        console.error("Map initialization failed:", error);

        container.textContent = window.t("mapError");
    }

};

