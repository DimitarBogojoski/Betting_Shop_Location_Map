
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
            placeholder: window.t("searchPlaceholder")
        });

        const searchExpand = createExpand({
            content: searchContainer,
            icon: "search",
            translationKey: "search"
        });



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

        const measurementExpand = createExpand({
            content: distanceMeasurement,
            icon: "measure",
            translationKey: "distance"
        });



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



        const locate = createMapComponent("arcgis-locate", {
            label: window.t("locate")
        });

        locate.messageOverrides = {
            title: window.t("locate"),
            label: window.t("locate")
        };




        const scaleBar = createMapComponent("arcgis-scale-bar", {

            unit: "metric",

            barStyle: "line"

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
                expand.collapseTooltip = window.t("closeTool", { tool });
            });


            // Public labels for the legacy widgets.
            search.label = window.t("search");
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

