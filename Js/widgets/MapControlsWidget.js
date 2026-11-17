/** Creates the independent map controls that do not need complex translation observers. */
export function createMapControls({ Home, view, createMapComponent, OblozuvalnicaLayer }) {
    const zoom = createMapComponent("arcgis-zoom", { label: window.t("zoom") });
    zoom.messageOverrides = {
        zoomIn: window.t("zoomIn"),
        zoomOut: window.t("zoomOut")
    };

    const home = new Home({ view, label: window.t("homeW") });
    home.uiStrings = { title: window.t("homeW") };

    const legend = createMapComponent("arcgis-legend");
    legend.layerInfos = [{ layer: OblozuvalnicaLayer, title: window.t("Legend") }];
    legend.style.position = "relative";
    legend.style.top = "10px";

    const compass = createMapComponent("arcgis-compass", { label: window.t("compass") });
    const locate = createMapComponent("arcgis-locate", { label: window.t("locate") });
    const scaleBar = createMapComponent("arcgis-scale-bar", {
        unit: "metric",
        barStyle: "line"
    });

    function translate() {
        zoom.label = window.t("zoom");
        zoom.messageOverrides = {
            zoomIn: window.t("zoomIn"),
            zoomOut: window.t("zoomOut")
        };

        home.label = window.t("homeW");
        home.uiStrings = { title: window.t("homeW") };

        compass.label = window.t("compass");
        compass.messageOverrides = {
            reset: window.t("compass"),
            title: window.t("compass")
        };

        locate.label = window.t("locate");
        locate.messageOverrides = {
            title: window.t("locate"),
            label: window.t("locate")
        };
    }

    return { zoom, home, legend, compass, locate, scaleBar, translate };
}
