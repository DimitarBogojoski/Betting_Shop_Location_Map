
let mapView = null;
let mapInitId = 0;

const OBLOZUVALNICI_URL =
    "https://gisserver.gdi.mk/arcgis/rest/services/KLADILNICI/KLADILNICI_KAZINA_MK/MapServer/1";



window.destroyMapPage = function () {

    mapInitId++;

    if (mapView) {
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
            Home
        ] = await $arcgis.import([

            "@arcgis/core/Map.js",
            "@arcgis/core/views/MapView.js",
            "@arcgis/core/layers/FeatureLayer.js",
            "@arcgis/core/layers/GraphicsLayer.js",
            "@arcgis/core/widgets/Search.js",
            "@arcgis/core/widgets/LayerList.js",
            "@arcgis/core/widgets/Expand.js",
            "@arcgis/core/widgets/Home.js"

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

            title: "Кладилници во радиус од 400м",

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

            title: "Мои цртежи",

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
            view: view
        });

        view.ui.add(home, "top-left");

//LEGEND
        const legend = createMapComponent("arcgis-legend");
        legend.layerInfos = [

            {
                layer: OblozuvalnicaLayer,
                title: "Кладилници во радиус од 400м"
            }

        ];

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
            "arcgis-compass"
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


        const locate = createMapComponent(
            "arcgis-locate"
        );

        view.ui.add(locate, "bottom-right");


        const scaleBar = createMapComponent("arcgis-scale-bar", {

            unit: "metric",

            barStyle: "line"

        });

        view.ui.add(scaleBar, "bottom-right");

    } catch (error) {

        if (
            thisInit !== mapInitId ||
            !container.isConnected
        ) {
            return;
        }

        console.error("Map initialization failed:", error);

        container.textContent =
            "Мапата не може да се вчита. Проверете ја конзолата.";

    }

};
