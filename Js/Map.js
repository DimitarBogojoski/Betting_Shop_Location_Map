import { createWidgetHelpers } from "./widgets/widgetUtils.js";
import { createSearchWidget } from "./widgets/SearchWidget.js";
import { createLayerListWidget } from "./widgets/LayerListWidget.js";
import { createBasemapGalleryWidget } from "./widgets/BasemapGalleryWidget.js";
import { createMapControls } from "./widgets/MapControlsWidget.js";
import { createDistanceMeasurementWidget } from "./widgets/DistanceMeasurementWidget.js";
import { createAreaMeasurementWidget } from "./widgets/AreaMeasurementWidget.js";
import { createBookmarksWidget } from "./widgets/BookmarksWidget.js";
import { createSketchWidget } from "./widgets/SketchWidget.js";
import { createCoordinateConversionWidget } from "./widgets/CoordinateConversionWidget.js";
import { createPrintWidget } from "./widgets/PrintWidget.js";
import { createElevationProfileWidget } from "./widgets/ElevationProfileWidget.js";

let mapView = null;
let mapInitId = 0;
let mapLanguageHandler = null;
let activeWidgetInstances = [];

const OBLOZUVALNICI_URL =
    "https://gisserver.gdi.mk/arcgis/rest/services/KLADILNICI/KLADILNICI_KAZINA_MK/MapServer/1";

function destroyWidgetInstances() {
    activeWidgetInstances.forEach(widget => {
        try {
            widget?.destroy?.();
        } catch (error) {
            console.warn("Could not clean up a map widget:", error);
        }
    });
    activeWidgetInstances = [];
}

window.destroyMapPage = function () {
    mapInitId++;

    if (mapLanguageHandler) {
        document.removeEventListener("site-language-changed", mapLanguageHandler);
        mapLanguageHandler = null;
    }

    destroyWidgetInstances();

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

    let view = null;

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

        if (thisInit !== mapInitId || !container.isConnected) return;

        const map = new ArcGISMap({
            basemap: "topo-vector",
            ground: "world-elevation"
        });

        const OblozuvalnicaLayer = new FeatureLayer({
            url: OBLOZUVALNICI_URL,
            title: window.t("bettingShops"),
            outFields: ["ime", "adresa", "grad"],
            listMode: "show",
            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-marker",
                    style: "circle",
                    size: 8,
                    color: "blue",
                    outline: { color: "white", width: 1 }
                }
            },
            popupTemplate: {
                title: "{ime}",
                content: [{
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "ime", label: "Име" },
                        { fieldName: "adresa", label: "Адреса" },
                        { fieldName: "grad", label: "Град" }
                    ]
                }]
            }
        });
        map.add(OblozuvalnicaLayer);

        const sketchGraphicsLayer = new GraphicsLayer({
            title: window.t("drawings"),
            listMode: "hide"
        });
        map.add(sketchGraphicsLayer);

        view = new MapView({
            container,
            map,
            center: [21.65, 41.60],
            zoom: 8,
            constraints: { minZoom: 5, maxZoom: 19 },
            popup: { dockEnabled: false }
        });

        view.ui.remove("zoom");
        mapView = view;
        window.objectsMapView = view;

        await view.when();
        if (thisInit !== mapInitId || !container.isConnected) {
            view.destroy();
            if (mapView === view) mapView = null;
            return;
        }

        await OblozuvalnicaLayer.load();

        const componentNames = [
            "arcgis-zoom",
            "arcgis-expand",
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
            "arcgis-elevation-profile",
            "arcgis-basemap-gallery"
        ];

        await Promise.all(componentNames.map(name => customElements.whenDefined(name)));
        if (thisInit !== mapInitId || !container.isConnected) {
            view.destroy();
            if (mapView === view) mapView = null;
            return;
        }

        const helpers = createWidgetHelpers(view);
        const isActive = () =>
            thisInit === mapInitId && mapView === view && container.isConnected;
        const widgetContext = { ...helpers, view, isActive };

        // Create each widget in its own module.
        const searchWidget = await createSearchWidget({ Search, view, createExpand: helpers.createExpand });
        const layerListWidget = createLayerListWidget({ LayerList, view, createExpand: helpers.createExpand });
        const basemapGalleryWidget = createBasemapGalleryWidget(helpers);
        const controls = createMapControls({
            Home,
            view,
            createMapComponent: helpers.createMapComponent,
            OblozuvalnicaLayer
        });
        const distanceWidget = createDistanceMeasurementWidget(widgetContext);
        const areaWidget = createAreaMeasurementWidget(widgetContext);
        const bookmarksWidget = createBookmarksWidget(widgetContext);
        const sketchWidget = createSketchWidget({
            sketchGraphicsLayer,
            createMapComponent: helpers.createMapComponent,
            queryShadowDOM: helpers.queryShadowDOM,
            changeElementText: helpers.changeElementText,
            findTextNode: helpers.findTextNode,
            isActive
        });
        const coordinateWidget = createCoordinateConversionWidget(widgetContext);
        const printWidget = createPrintWidget(widgetContext);
        const elevationWidget = createElevationProfileWidget({
            sketch: sketchWidget.component,
            ...widgetContext
        });

        activeWidgetInstances = [
            searchWidget,
            layerListWidget,
            distanceWidget,
            areaWidget,
            bookmarksWidget,
            sketchWidget,
            coordinateWidget,
            printWidget,
            elevationWidget
        ];

        // Add all widgets to the map in the same positions as the original setup.
        const uiItems = [
            [controls.zoom, "top-left"],
            [searchWidget.expand, "top-left"],
            [layerListWidget.expand, "top-left"],
            [basemapGalleryWidget.expand, "top-left"],
            [distanceWidget.expand, "top-left"],
            [areaWidget.expand, "top-left"],
            [bookmarksWidget.expand, "top-left"],
            [controls.home, "top-left"],
            [controls.legend, "bottom-left"],
            [sketchWidget.component, "top-right"],
            [coordinateWidget.component, "top-right"],
            [controls.compass, "top-right"],
            [printWidget.expand, "bottom-right"],
            [elevationWidget.expand, "bottom-right"],
            [controls.locate, "bottom-right"],
            [controls.scaleBar, "bottom-right"]
        ];

        // Add each UI component once. Language changes should only update labels.
        uiItems.forEach(([item, position]) => view.ui.add(item, position));

        function updateMapTranslations() {
            if (!isActive()) return;

            OblozuvalnicaLayer.title = window.t("bettingShops");
            sketchGraphicsLayer.title = window.t("drawings");
            OblozuvalnicaLayer.popupTemplate = {
                title: "{ime}",
                content: [{
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "ime", label: window.t("name") },
                        { fieldName: "adresa", label: window.t("addressW") },
                        { fieldName: "grad", label: window.t("city") }
                    ]
                }]
            };

            controls.legend.layerInfos = [{
                layer: OblozuvalnicaLayer,
                title: window.t("bettingShops")
            }];

            const expandTools = [
                searchWidget.expand,
                layerListWidget.expand,
                basemapGalleryWidget.expand,
                distanceWidget.expand,
                areaWidget.expand,
                bookmarksWidget.expand,
                printWidget.expand,
                elevationWidget.expand
            ];

            expandTools.forEach(expand => {
                const tool = window.t(expand.dataset.translationKey);
                expand.label = tool;
                expand.expandTooltip = tool;
                expand.collapseTooltip = window.t("closeTool", { tool });
            });

            searchWidget.translate();
            layerListWidget.translate();
            basemapGalleryWidget.translate();
            controls.translate();
            distanceWidget.translate();
            areaWidget.translate();
            bookmarksWidget.translate();
            sketchWidget.translate();
            coordinateWidget.translate();
            printWidget.translate();
            elevationWidget.translate();

            const components = [
                [basemapGalleryWidget.component, "basemaps"],
                [distanceWidget.component, "distance"],
                [areaWidget.component, "area"],
                [bookmarksWidget.component, "bookmarks"],
                [controls.legend, "legend"],
                [sketchWidget.component, "sketch"],
                [coordinateWidget.component, "coordinates"],
                [controls.compass, "compass"],
                [printWidget.component, "print"],
                [elevationWidget.component, "elevation"],
                [controls.locate, "locate"],
                [controls.scaleBar, "scale"]
            ];

            components.forEach(([component, key]) => {
                const label = window.t(key);
                component.label = label;
                component.setAttribute("aria-label", label);
                component.setAttribute("title", label);
            });
        }

        // Initial translation pass, then wait for the web components to hydrate.
        updateMapTranslations();

        await Promise.all([
            distanceWidget.component.componentOnReady(),
            areaWidget.component.componentOnReady(),
            bookmarksWidget.component.componentOnReady(),
            elevationWidget.component.componentOnReady(),
            sketchWidget.component.componentOnReady(),
            coordinateWidget.component.componentOnReady(),
            printWidget.component.componentOnReady(),
            basemapGalleryWidget.component.componentOnReady(),
            controls.legend.componentOnReady?.() ?? Promise.resolve(),
            controls.compass.componentOnReady?.() ?? Promise.resolve(),
            controls.locate.componentOnReady?.() ?? Promise.resolve(),
            controls.scaleBar.componentOnReady?.() ?? Promise.resolve(),
            controls.zoom.componentOnReady?.() ?? Promise.resolve()
        ]);

        if (!isActive()) return;

        distanceWidget.startObserver();
        areaWidget.startObserver();
        bookmarksWidget.startObserver();
        elevationWidget.startObserver();
        coordinateWidget.startObserver();
        printWidget.startObserver();
        sketchWidget.startObserver();

        // Do one post-hydration translation pass for all widgets.
        updateMapTranslations();

        mapLanguageHandler = updateMapTranslations;
        document.addEventListener("site-language-changed", mapLanguageHandler);

    } catch (error) {
        if (thisInit !== mapInitId || !container.isConnected) return;

        console.error("Map initialization failed:", error);
        destroyWidgetInstances();
        container.textContent = window.t("mapError");

        if (view && !view.destroyed) {
            if (window.objectsMapView === view) window.objectsMapView = null;
            if (mapView === view) mapView = null;
            view.destroy();
        }
    }
};
