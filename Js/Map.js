
let mapView = null;
let mapInitId = 0;
let mapLanguageHandler = null;

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
            Expand,
            Home,
            ElevationProfile
        ] = await $arcgis.import([

            "@arcgis/core/Map.js",
            "@arcgis/core/views/MapView.js",
            "@arcgis/core/layers/FeatureLayer.js",
            "@arcgis/core/layers/GraphicsLayer.js",
            "@arcgis/core/widgets/Search.js",
            "@arcgis/core/widgets/LayerList.js",
            "@arcgis/core/widgets/Expand.js",
            "@arcgis/core/widgets/Home.js",
            "@arcgis/core/widgets/ElevationProfile.js"
        ]);

        if (
            thisInit !== mapInitId ||
            !container.isConnected
        ) {
            return;
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

//SEARCH
        const search = new Search({
            view: view
        });
        const searchExpand = new Expand({

            view: view,

            content: search,

            expandIcon: "search",

            expandTooltip: "Search",

        });

        view.ui.add(searchExpand, "top-left");

//LAYER LIST
        const layerList = new LayerList({

            view: view

        });
        const layerListExpand = new Expand({

            view: view,

            content: layerList,

            expandIcon: "layers",

            expandTooltip: "Layers",


        });

        view.ui.add(layerListExpand, "top-left");

//BASEMAP LIST
        const basemapGallery = createMapComponent(
            "arcgis-basemap-gallery"
        );
        basemapGallery.style.width = "240px";
        basemapGallery.style.maxWidth = "calc(100vw - 90px)";
        basemapGallery.style.maxHeight = "65vh";

        const basemapGalleryExpand = createMapComponent("arcgis-expand", {
            expandIcon: "basemap",
            expandTooltip: "Basemap Gallery",
            mode: "floating",
            placement: "right-start"
        });

        basemapGalleryExpand.append(basemapGallery);

        view.ui.add(basemapGalleryExpand, "top-left");

//DISTANCE MEASUREMENT
        const distanceMeasurement = createMapComponent(
            "arcgis-distance-measurement-2d",
            {
                unit: "metric"
            }
        );

        const measurementExpand = createMapComponent("arcgis-expand", {
            expandIcon: "measure",
            expandTooltip: "Distance Measurement",

        });

        measurementExpand.append(distanceMeasurement);
        view.ui.add(measurementExpand, "top-left");

//AREA MEASUREMENT
        const areaMeasurement = createMapComponent(
            "arcgis-area-measurement-2d",
            {
                unit: "metric"
            }
        );
        const areaExpand = createMapComponent("arcgis-expand", {
            expandIcon: "measure-area",
            expandTooltip: "Measure Area",

        });

        areaExpand.append(areaMeasurement);
        view.ui.add(areaExpand, "top-left");

//BOOKMARKS
        const bookmarks = createMapComponent("arcgis-bookmarks",{
            showAddBookmarkButton: true,
            showEditBookmarkButton: true,
            dragEnabled: true
        });

        const bookmarksExpand = createMapComponent("arcgis-expand", {
            expandIcon: "bookmark",
            expandTooltip: "Bookmarks",

        });

        bookmarksExpand.append(bookmarks);
        view.ui.add(bookmarksExpand, "top-left");
//HOME
        const home = new Home({
            view: view,
            label: window.t("homeW")
        });

        view.ui.add(home, "top-left");

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

        view.ui.add(legend, "bottom-left");


//SKETCH
        const sketch = createMapComponent(
            "arcgis-sketch",
            {
                layer: sketchGraphicsLayer,
                toolbarKind: "docked"
            }
        );

        view.ui.add(sketch, "top-right");

//CONVERTER
        const coordinateConversion = createMapComponent(
            "arcgis-coordinate-conversion"
        );

        view.ui.add(coordinateConversion, "top-right");


        const compass = createMapComponent(
            "arcgis-compass",
            {
                label: window.t("compass")
            }
        );

        view.ui.add(compass, "top-right");

//PRINT
        const print = createMapComponent("arcgis-print");

        const printExpand = createMapComponent("arcgis-expand", {
            expandIcon: "print",
            expandTooltip: "Print Map",
        });

        printExpand.append(print);
        view.ui.add(printExpand, "bottom-right");


        //EVAL PROF
        const elevationProfile = createMapComponent(
            "arcgis-elevation-profile");

        const elevationExpand = createMapComponent("arcgis-expand", {
            expandTooltip: "Elevation Profile"
        });

        elevationExpand.append(elevationProfile);
        view.ui.add(elevationExpand, "bottom-right");


        const locate = createMapComponent(
            "arcgis-locate",
            {
                label: window.t("locate")
            }
        );

        view.ui.add(locate, "bottom-right");


        const scaleBar = createMapComponent("arcgis-scale-bar", {

            unit: "metric",

            barStyle: "line"

        });

        view.ui.add(scaleBar, "bottom-right");


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

            // Works with your Expand widgets and components.
            const expandableTools = [
                [searchExpand, "search"],
                [layerListExpand, "layers"],
                [basemapGalleryExpand, "basemaps"],
                [measurementExpand, "distance"],
                [areaExpand, "area"],
                [bookmarksExpand, "bookmarks"],
                [printExpand, "print"],
                [elevationExpand, "elevation"]
            ];

            expandableTools.forEach(([expand, key]) => {
                const tool = window.t(key);

                expand.label = tool;
                expand.expandTooltip = tool;

                expand.collapseTooltip = window.t("closeTool", {
                    tool
                });
            });

            // Public labels for the legacy widgets.
            search.label = window.t("search");
            layerList.label = window.t("layers");
            compass.label = window.t("compass");
            locate.label = window.t("locate");
            home.label = window.t("homeW");


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
                [scaleBar, "scale"]
            ];

            components.forEach(([component, key]) => {
                const text = window.t(key);

                component.label = text;
                component.setAttribute("aria-label", text);
                component.setAttribute("title", text);
                });
        }

        // Apply the selected language when the map finishes loading.
        updateMapTranslations();

        // Update labels without recreating the map.
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

