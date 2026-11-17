/** Creates the ArcGIS LayerList widget and its Expand wrapper. */
export function createLayerListWidget({ LayerList, view, createExpand }) {
    const layerListContainer = document.createElement("div");
    const layerList = new LayerList({ view, container: layerListContainer });
    const layerListExpand = createExpand({
        content: layerListContainer,
        icon: "layers",
        translationKey: "layers"
    });

    function translate() {
        layerList.label = window.t("layers");
    }

    return {
        component: layerList,
        expand: layerListExpand,
        translate,
        destroy() {
            layerList.destroy();
        }
    };
}
