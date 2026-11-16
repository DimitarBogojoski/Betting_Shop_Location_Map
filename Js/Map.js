
let mapView = null;
let mapInitId = 0;
let mapLanguageHandler = null;
let distanceMapClickHandle = null;
let distanceTranslationObserver = null;
let areaTranslationObserver = null;
let bookmarkTranslationObserver = null;
let elevationTranslationObserver = null;
let sketchTranslationObserver = null;
let coordinateConversionTranslationObserver = null;

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

    if (elevationTranslationObserver) {
        elevationTranslationObserver.disconnect();
        elevationTranslationObserver = null;
    }

    if (sketchTranslationObserver) {
        sketchTranslationObserver.disconnect();
        sketchTranslationObserver = null;
    }

    if (coordinateConversionTranslationObserver) {
        coordinateConversionTranslationObserver.disconnect();
        coordinateConversionTranslationObserver = null;
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
            basemap: "topo-vector",
            ground: "world-elevation"
        });


//GDI LAYER
        const OblozuvalnicaLayer = new FeatureLayer({

            url: OBLOZUVALNICI_URL,

            title: window.t("bettingShops"),

            outFields: ["ime", "adresa", "grad"],

            listMode: "show",

            // renderer:{
            //     type: "simple",
            //
            //     symbol:{
            //         type: "picture-marker",
            //         url: "Images/SoccerBall.png",
            //         width: "18px",
            //         height: "18px"
            //     }
            // },

            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-marker",
                    style: "circle",
                    size: 8,
                    color: "blue",
                    outline: {
                        color: "white",
                        width: 1
                    }
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
            "arcgis-sketch",
            "arcgis-elevation-profile"

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

        // ====================================
// SKETCH WIDGET TRANSLATIONS
// ====================================

        function updateSketchTranslations() {

            const tooltipTranslations = [
                {
                    key: "sketchSelectFeature",
                    variants: ["Select feature", "Избери објект", "Zgjidh objektin"]
                },
                {
                    key: "sketchDrawPoint",
                    variants: ["Draw a point", "Нацртај точка", "Vizato një pikë"]
                },
                {
                    key: "sketchDrawPolyline",
                    variants: ["Draw a polyline", "Нацртај линија", "Vizato një vijë"]
                },
                {
                    key: "sketchDrawPolygon",
                    variants: ["Draw a polygon", "Нацртај полигон", "Vizato një poligon"]
                },
                {
                    key: "sketchDrawRectangle",
                    variants: [
                        "Draw a rectangle or square",
                        "Нацртај правоаголник или квадрат",
                        "Vizato një drejtkëndësh ose katror"
                    ]
                },
                {
                    key: "sketchDrawCircle",
                    variants: [
                        "Draw a circle or ellipse",
                        "Нацртај круг или елипса",
                        "Vizato një rreth ose elipsë"
                    ]
                },
                {
                    key: "sketchUndo",
                    variants: ["Undo", "Врати", "Zhbëj"]
                },
                {
                    key: "sketchRedo",
                    variants: ["Redo", "Повтори", "Ribëj"]
                },
                {
                    key: "sketchSettings",
                    variants: ["Settings", "Поставки", "Cilësimet"]
                }
            ];

            const translations = [

                // Settings
                {
                    selector: ".heading",
                    key: "sketchSettings",
                    variants: ["Settings"]
                },
                {
                    selector: ".esri-labeled-switch__label-content div",
                    key: "sketchEnableTooltips",
                    variants: ["Enable tooltips"]
                },
                {
                    selector: ".esri-labeled-switch__label",
                    key: "sketchEnableSnapping",
                    variants: ["Enable snapping"]
                },
                {
                    selector: ".esri-labeled-switch__label",
                    key: "sketchGeometryGuides",
                    variants: ["Geometry guides"]
                },
                {
                    selector: ".esri-labeled-switch__label",
                    key: "sketchFeatureToFeature",
                    variants: ["Feature to feature"]
                },
                {
                    selector: ".esri-labeled-switch__label",
                    key: "sketchGrid",
                    variants: ["Grid"]
                },
                {
                    selector: ".heading",
                    key: "sketchSnappingLayers",
                    variants: ["Snapping layers"]
                },
                {
                    selector: ".heading",
                    key: "sketchGridOptions",
                    variants: ["Grid options"]
                }

            ];

            translations.forEach(({ selector, key, variants }) => {

                const elements = queryShadowDOM(sketch, selector);

                elements.forEach(element => {

                    const textNode = findTextNode(
                        element,
                        variants
                    );

                    // Also recognize elements already translated.
                    if (
                        !textNode &&
                        element.dataset.translationKey !== key
                    ) {
                        return;
                    }

                    const translated = window.t(key);



                    if (!translated) {
                        console.warn("Missing Sketch translation:", key);
                        return;
                    }

                    if (textNode) {

                        if (textNode.textContent.trim() !== translated) {
                            textNode.textContent = translated;
                        }

                    } else if (element.dataset.translationKey === key) {

                        changeElementText(element, translated);

                    }

                    element.dataset.translationKey = key;

                });

            });

            // ====================================
// SKETCH TOOLBAR HOVER TOOLTIPS
// ====================================

            function findInteractiveAncestor(element) {

                let current = element;

                while (current && current !== sketch) {

                    if (
                        current.matches?.(
                            'button, calcite-button, calcite-action, [role="button"], [tabindex="0"]'
                        )
                    ) {
                        return current;
                    }

                    // Move through normal DOM and Shadow DOM.
                    const root = current.getRootNode();

                    current = current.parentElement || root?.host || null;
                }

                return null;
            }


            const tooltipContainers = queryShadowDOM(
                sketch,
                ".text-container"
            );

            tooltipContainers.forEach(container => {

                const currentText = container.textContent
                    .replace(/\s+/g, " ")
                    .trim();

                // Identify the corresponding toolbar tooltip.
                const translation = tooltipTranslations.find(item =>
                    container.dataset.translationKey === item.key ||
                    item.variants.includes(currentText)
                );

                if (!translation) return;

                const translated = window.t(translation.key);

                if (!translated) {
                    console.warn(
                        "Missing Sketch tooltip translation:",
                        translation.key
                    );
                    return;
                }

                // Find the actual interactive toolbar button.
                const button = findInteractiveAncestor(container);

                // Apply the hover tooltip to both elements.
                const targets = [container, button].filter(Boolean);

                targets.forEach(target => {

                    if (target.getAttribute("title") !== translated) {
                        target.setAttribute("title", translated);
                    }

                    if (target.getAttribute("aria-label") !== translated) {
                        target.setAttribute("aria-label", translated);
                    }

                    target.dataset.tooltipTranslationKey = translation.key;

                });

            });

        }

        // ====================================
// SKETCH TRANSLATION OBSERVER
// ====================================

        function startSketchTranslationObserver() {

            if (sketchTranslationObserver) {
                sketchTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeSketchTree(sketch);

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

                    updateSketchTranslations();

                });

            });

            sketchTranslationObserver = observer;

            function observeSketchTree(root) {

                if (!root || observedRoots.has(root)) return;

                observedRoots.add(root);

                observer.observe(root, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });

                if (root.shadowRoot) {
                    observeSketchTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeSketchTree(element.shadowRoot);
                    }

                });

            }

            observeSketchTree(sketch);

        }


//CONVERTER
        const coordinateConversion = createMapComponent(
            "arcgis-coordinate-conversion"
        );

        // ====================================
// COORDINATE CONVERSION TRANSLATIONS
// ====================================

        function updateCoordinateConversionTranslations() {

            // ====================================
            // ADD CONVERSION OPTION
            // ====================================

            const addConversionOption = queryShadowDOM(
                coordinateConversion,
                'option[value="default"]'
            )[0];

            if (addConversionOption) {

                const translated = window.t("coordinateAddConversion");

                if (translated) {

                    addConversionOption.textContent = translated;
                    addConversionOption.label = translated;
                    addConversionOption.setAttribute("label", translated);

                    addConversionOption.dataset.translationKey =
                        "coordinateAddConversion";
                }
            }


            // ====================================
            // HOVER TOOLTIP TRANSLATIONS
            // ====================================

            const tooltipTranslations = [
                {
                    selector: 'button[aria-label]',
                    key: "coordinateInputCoordinate",
                    variants: ["Input coordinate"]
                },
                {
                    selector: "calcite-button",
                    key: "coordinateCaptureMode",
                    variants: ["Capture mode"]
                },
                {
                    selector: "calcite-button",
                    key: "coordinateFormatSettings",
                    variants: ["Format settings"]
                }
            ];

            // ====================================
// INPUT COORDINATE HEADING
// ====================================

            const inputHeadingVariants = [
                "Input coordinate",
                "Внеси координата",
                "Fut koordinatën"
            ];

            const inputHeading = queryShadowDOM(
                coordinateConversion,
                "h4.heading"
            ).find(element =>
                element.dataset.translationKey === "coordinateInputCoordinate" ||
                inputHeadingVariants.includes(element.textContent.trim())
            );

            if (inputHeading) {

                const translated = window.t("coordinateInputCoordinate");

                if (translated) {
                    changeElementText(inputHeading, translated);
                    inputHeading.dataset.translationKey =
                        "coordinateInputCoordinate";
                }
            }


// ====================================
// INPUT COORDINATE PLACEHOLDER
// ====================================

            const coordinateInputs = queryShadowDOM(
                coordinateConversion,
                'input[placeholder]'
            );

            coordinateInputs.forEach(input => {

                if (
                    input.dataset.translationKey !== "coordinateInputCoordinate" &&
                    !inputHeadingVariants.includes(input.placeholder)
                ) {
                    return;
                }

                const translated = window.t("coordinateInputCoordinate");

                if (!translated) return;

                input.placeholder = translated;
                input.setAttribute("placeholder", translated);
                input.setAttribute("aria-label", translated);

                input.dataset.translationKey = "coordinateInputCoordinate";

            });


// ====================================
// GO TO LOCATION LABEL
// ====================================

            const goToLocationVariants = [
                "Go to location",
                "Оди до локацијата",
                "Shko te vendndodhja"
            ];

            const goToLocationLabel = queryShadowDOM(
                coordinateConversion,
                "calcite-label"
            ).find(element =>
                element.dataset.translationKey === "coordinateGoToLocation" ||
                findTextNode(element, goToLocationVariants)
            );

            if (goToLocationLabel) {

                const translated = window.t("coordinateGoToLocation");

                if (translated) {
                    changeElementText(goToLocationLabel, translated);
                    goToLocationLabel.dataset.translationKey =
                        "coordinateGoToLocation";
                }
            }


// ====================================
// CONVERT BUTTON
// ====================================

            const convertVariants = [
                "Convert",
                "Конвертирај",
                "Konverto"
            ];

            const convertButton = queryShadowDOM(
                coordinateConversion,
                "calcite-button"
            ).find(element =>
                element.dataset.translationKey === "coordinateConvert" ||
                findTextNode(element, convertVariants)
            );

            if (convertButton) {

                const translated = window.t("coordinateConvert");

                if (translated) {
                    changeElementText(convertButton, translated);
                    convertButton.dataset.translationKey = "coordinateConvert";
                }
            }

            tooltipTranslations.forEach(({ selector, key, variants }) => {

                const elements = queryShadowDOM(
                    coordinateConversion,
                    selector
                );

                const element = elements.find(item =>
                    item.dataset.translationKey === key ||
                    variants.includes(item.getAttribute("aria-label")) ||
                    variants.includes(item.getAttribute("title"))
                );

                if (!element) return;

                const translated = window.t(key);

                if (!translated) return;

                // Native hover tooltip.
                element.title = translated;
                element.setAttribute("title", translated);

                // Accessibility label.
                element.setAttribute("aria-label", translated);

                element.dataset.translationKey = key;

            });


            // ====================================
            // VISIBLE FORMAT SETTINGS LABELS
            // ====================================

            const labelTranslations = [
                {
                    selector: ".heading",
                    key: "coordinateFormatSettings",
                    variants: ["Format settings"]
                },
                {
                    selector: "calcite-label",
                    key: "coordinateChangeDisplay",
                    variants: ["Change coordinate display"]
                },
                {
                    selector: "calcite-label",
                    key: "coordinatePreview",
                    variants: ["Preview"]
                }
            ];

            labelTranslations.forEach(({ selector, key, variants }) => {

                const elements = queryShadowDOM(
                    coordinateConversion,
                    selector
                );

                elements.forEach(element => {

                    let textNode = findTextNode(element, variants);

                    // Support already translated elements on language changes.
                    if (
                        !textNode &&
                        element.dataset.translationKey === key
                    ) {
                        const walker = document.createTreeWalker(
                            element,
                            NodeFilter.SHOW_TEXT
                        );

                        let node;

                        while (node = walker.nextNode()) {
                            if (node.textContent.trim()) {
                                textNode = node;
                                break;
                            }
                        }
                    }

                    if (!textNode) return;

                    const translated = window.t(key);

                    if (!translated) return;

                    if (textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    element.dataset.translationKey = key;

                });

            });

        }

        // ====================================
// COORDINATE CONVERSION OBSERVER
// ====================================

        function startCoordinateConversionTranslationObserver() {

            if (coordinateConversionTranslationObserver) {
                coordinateConversionTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeCoordinateTree(coordinateConversion);

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

                    updateCoordinateConversionTranslations();

                });

            });

            coordinateConversionTranslationObserver = observer;

            function observeCoordinateTree(root) {

                if (!root || observedRoots.has(root)) return;

                observedRoots.add(root);

                observer.observe(root, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true,
                    attributeFilter: [
                        "title",
                        "aria-label",
                        "label"
                    ]
                });

                if (root.shadowRoot) {
                    observeCoordinateTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeCoordinateTree(element.shadowRoot);
                    }

                });

            }

            observeCoordinateTree(coordinateConversion);

        }

//COMPASS
        const compass = createMapComponent("arcgis-compass", {
            label: window.t("compass")
        });
        compass.messageOverrides = {
            reset: window.t("compass"),
            title: window.t("compass")
        };




// ====================================
// PRINT
// ====================================

        const print = createMapComponent("arcgis-print", {
            printServiceUrl:
                "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });

// Print request submitted
        print.addEventListener("arcgisSubmit", (event) => {
            console.log("PRINT SUBMITTED:", event.detail);
        });

// Print request completed
        print.addEventListener("arcgisComplete", (event) => {

            const file = event.detail?.link;
            const error = file?.error;
            const details = error?.details;

            console.group("PRINT EXPORT DIAGNOSTICS");

            console.log("Error name:", error?.name);
            console.log("Error message:", error?.message);

            console.log("HTTP status:", details?.httpStatus);
            console.log("Request URL:", details?.url);
            console.log("Message code:", details?.messageCode);
            console.log("Sub code:", details?.subCode);
            console.log("Server messages:", details?.messages);

            console.log("Raw server response:", details?.raw);
            console.log("Request options:", details?.requestOptions);

            console.log(
                "All error details:",
                JSON.stringify(details, null, 2)
            );

            console.groupEnd();

        });

// Print file saved
        print.addEventListener("arcgisSaveAs", (event) => {
            console.log("PRINT FILE SAVED:", event.detail);
        });


// IMPORTANT: Keep this declaration!
        const printExpand = createExpand({
            content: print,
            icon: "print",
            translationKey: "print"
        });

// ELEVATION PROFILE
        const elevationProfile = createMapComponent(
            "arcgis-elevation-profile",
            {
                profiles: [
                    {
                        type: "ground"
                    }
                ]
            }
        );

        const elevationExpand = createExpand({
            content: elevationProfile,
            icon: "measure",
            translationKey: "elevation"
        });

// ====================================
// ELEVATION PROFILE TRANSLATIONS
// ====================================

        function updateElevationProfileTranslations() {

            // ====================================
            // HELPER: TRANSLATE AN ELEMENT
            // ====================================

            function translateElement(element, key, variants) {

                if (!element) return;

                const translated = window.t(key);

                if (!translated) {
                    console.warn("Missing elevation translation:", key);
                    return;
                }

                // Find the original or previously translated text node.
                let textNode = findTextNode(element, variants);

                // If already translated, use the existing translation key.
                if (!textNode && element.dataset.translationKey === key) {

                    const walker = document.createTreeWalker(
                        element,
                        NodeFilter.SHOW_TEXT
                    );

                    let node;

                    while (node = walker.nextNode()) {

                        if (node.textContent.trim()) {
                            textNode = node;
                            break;
                        }
                    }
                }

                if (textNode) {

                    if (textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    element.dataset.translationKey = key;
                }
            }


            // ====================================
            // PROMPT MESSAGE
            // ====================================

            const promptVariants = [
                "Draw line to generate an elevation profile.",
                "Create elevation profile by clicking in the map to place your first point, use double-click for last point.",
                "Нацртајте линија за да креирате профил на надморска височина.",
                "Кликнете на картата за да креирате профил на надморска височина и да ја поставите првата точка. Кликнете двапати за да ја поставите последната точка.",
                "Vizatoni një vijë për të krijuar profilin e lartësisë.",
                "Klikoni në hartë për të krijuar profilin e lartësisë dhe për të vendosur pikën e parë. Klikoni dy herë për të vendosur pikën e fundit."
            ];

            const prompt = queryShadowDOM(
                elevationProfile,
                ".prompt-message"
            ).find(element =>
                element.dataset.translationKey === "elevationPrompt" ||
                findTextNode(element, promptVariants)
            );

            translateElement(
                prompt,
                "elevationPrompt",
                promptVariants
            );


            // ====================================
            // GROUND LABEL
            // ====================================

            const groundVariants = [
                "Ground",
                "Терен",
                "Terreni"
            ];

            const groundLabel = queryShadowDOM(
                elevationProfile,
                "calcite-label.label"
            ).find(element =>
                element.dataset.translationKey === "elevationGround" ||
                findTextNode(element, groundVariants)
            );

            translateElement(
                groundLabel,
                "elevationGround",
                groundVariants
            );


            // ====================================
            // STATISTIC LABELS
            // ====================================

            const statisticTranslations = [

                {
                    key: "elevationLength",
                    variants: ["Length", "Должина", "Gjatësia"]
                },
                {
                    key: "elevationGain",
                    variants: ["Gain", "Искачување", "Ngjitja"]
                },
                {
                    key: "elevationLoss",
                    variants: ["Loss", "Спуштање", "Zbritja"]
                },
                {
                    key: "elevationMin",
                    variants: ["Min", "Мин.", "Min."]
                },
                {
                    key: "elevationMax",
                    variants: ["Max", "Макс.", "Maks."]
                },
                {
                    key: "elevationAvg",
                    variants: ["Avg", "Просек", "Mes."]
                },
                {
                    key: "elevationMaxSlope",
                    variants: [
                        "Max Slope",
                        "Макс. наклон",
                        "Pjerrësia maks."
                    ]
                },
                {
                    key: "elevationAvgSlope",
                    variants: [
                        "Avg Slope",
                        "Просечен наклон",
                        "Pjerrësia mes."
                    ]
                }

            ];

            const statisticLabels = queryShadowDOM(
                elevationProfile,
                ".statistic-label"
            );

            statisticLabels.forEach(label => {

                // Find the translation using its saved key or its visible text.
                const translation = statisticTranslations.find(item =>
                    label.dataset.translationKey === item.key ||
                    findTextNode(label, item.variants)
                );

                if (!translation) return;

                translateElement(
                    label,
                    translation.key,
                    translation.variants
                );

            });


            // ====================================
            // NEW PROFILE BUTTON
            // ====================================

            const buttonVariants = [
                "New profile",
                "Нов профил",
                "Profil i ri"
            ];

            const newProfileButton = queryShadowDOM(
                elevationProfile,
                ".action-button"
            ).find(element =>
                element.dataset.translationKey === "elevationNewProfile" ||
                findTextNode(element, buttonVariants)
            );

            translateElement(
                newProfileButton,
                "elevationNewProfile",
                buttonVariants
            );

            // ====================================
// DONE BUTTON
// ====================================

            const doneButtonVariants = [
                "Done",
                "Готово",
                "U krye"
            ];

            const doneButton = queryShadowDOM(
                elevationProfile,
                ".action-button"
            ).find(element =>
                element.dataset.translationKey === "elevationDone" ||
                doneButtonVariants.some(variant =>
                    element.textContent.trim() === variant
                )
            );

            translateElement(
                doneButton,
                "elevationDone",
                doneButtonVariants
            );

            // ====================================
// ELEVATION PROFILE UNIT TRANSLATIONS
// ====================================

// ====================================
// DISTANCE UNITS, ELEVATION UNITS,
// UNIFORM CHART SCALING
// ====================================

            const elevationLabelTranslations = [
                {
                    key: "elevationDistanceUnits",
                    variants: ["Distance Units"]
                },
                {
                    key: "elevationUnits",
                    variants: ["Elevation units"]
                },
                {
                    key: "elevationUniformChartScaling",
                    variants: ["Uniform chart scaling"]
                }
            ];

            const elevationLabels = queryShadowDOM(
                elevationProfile,
                "calcite-label, label, .label, .uniform-chart-scaling-label"
            );

            elevationLabels.forEach(label => {

                const translation = elevationLabelTranslations.find(item =>
                    label.dataset.translationKey === item.key ||
                    item.variants.some(variant =>
                        findTextNode(label, [variant])
                    )
                );

                if (!translation) return;

                translateElement(
                    label,
                    translation.key,
                    translation.variants
                );

            });


// ====================================
// DISTANCE AND ELEVATION UNIT OPTIONS
// ====================================

            const elevationUnitTranslations = [

                {
                    key: "distanceUnitMetric",
                    variants: ["Metric"]
                },
                {
                    key: "distanceUnitImperial",
                    variants: ["Imperial"]
                },
                {
                    key: "distanceUnitInches",
                    variants: ["Inches"]
                },
                {
                    key: "distanceUnitFeet",
                    variants: ["Feet"]
                },
                {
                    key: "distanceUnitYards",
                    variants: ["Yards"]
                },
                {
                    key: "distanceUnitMiles",
                    variants: ["Miles"]
                },
                {
                    key: "distanceUnitNauticalMiles",
                    variants: ["Nautical miles"]
                },
                {
                    key: "distanceUnitUSFeet",
                    variants: ["Feet (US)"]
                },
                {
                    key: "distanceUnitMillimeters",
                    variants: ["Millimeters"]
                },
                {
                    key: "distanceUnitCentimeters",
                    variants: ["Centimeters"]
                },
                {
                    key: "elevationUnitDecimeter",
                    variants: ["Decimeter"]
                },
                {
                    key: "elevationUnitMeters",
                    variants: ["Meters"]
                },
                {
                    key: "distanceUnitKilometers",
                    variants: ["Kilometers"]
                }

            ];

            const elevationUnitOptions = queryShadowDOM(
                elevationProfile,
                "calcite-option"
            );

            elevationUnitOptions.forEach(option => {

                const translation = elevationUnitTranslations.find(item =>
                    option.dataset.translationKey === item.key ||
                    item.variants.some(variant =>
                        findTextNode(option, [variant])
                    )
                );

                if (!translation) return;

                translateElement(
                    option,
                    translation.key,
                    translation.variants
                );

            });

        }

        // ====================================
// OBSERVE ELEVATION PROFILE SHADOW DOM
// ====================================

        function startElevationProfileTranslationObserver() {

            if (elevationTranslationObserver) {
                elevationTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                // Detect newly rendered content and nested Shadow DOM.
                observeElevationTree(elevationProfile);
                observeElevationTree(elevationExpand);

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

                    updateElevationProfileTranslations();

                });

            });

            elevationTranslationObserver = observer;

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

            function observeElevationTree(root) {

                if (!root) return;

                if (!observedRoots.has(root)) {

                    observedRoots.add(root);

                    observer.observe(root, observerOptions);
                }

                // Observe the root's own Shadow DOM.
                if (root.shadowRoot) {
                    observeElevationTree(root.shadowRoot);
                }

                // Discover nested Shadow DOM.
                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeElevationTree(element.shadowRoot);
                    }

                });

            }

            observeElevationTree(elevationProfile);
            observeElevationTree(elevationExpand);

        }

        // ====================================
// CONNECT SKETCH TO ELEVATION PROFILE
// ====================================

        function updateElevationProfile(graphic) {

            if (!graphic || graphic.geometry?.type !== "polyline") {
                return;
            }

            // A valid profile needs at least two vertices.
            const paths = graphic.geometry.paths;

            if (!paths || !paths.some(path => path.length >= 2)) {
                return;
            }

            // Send the drawn line to the Elevation Profile component.
            elevationProfile.geometry = graphic.geometry;

            console.log("Elevation profile updated:", graphic.geometry);
        }


// When a new graphic is created.
        sketch.addEventListener("arcgisCreate", (event) => {

            if (event.detail.state !== "complete") {
                return;
            }

            updateElevationProfile(event.detail.graphic);

        });


// When an existing graphic is modified.
        sketch.addEventListener("arcgisUpdate", (event) => {

            if (event.detail.state !== "complete") {
                return;
            }

            const polyline = event.detail.graphics?.find(
                graphic => graphic.geometry?.type === "polyline"
            );

            if (polyline) {
                updateElevationProfile(polyline);
            }

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
                updateElevationProfileTranslations();
                updateCoordinateConversionTranslations();
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
            bookmarks.componentOnReady(),
            elevationProfile.componentOnReady(),
            sketch.componentOnReady(),
            coordinateConversion.componentOnReady()
        ]);

// Start observing widgets.
        startDistanceTranslationObserver();
        startAreaTranslationObserver();
        startBookmarkTranslationObserver();
        startElevationProfileTranslationObserver();
        startCoordinateConversionTranslationObserver();
        updateCoordinateConversionTranslations();

// Apply initial translations.
        updateElevationProfileTranslations();
// Apply translations immediately.
        updateDistanceTranslations();
        updateAreaTranslations();
        updateBookmarkTranslations();
        startSketchTranslationObserver();
        updateSketchTranslations();

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

