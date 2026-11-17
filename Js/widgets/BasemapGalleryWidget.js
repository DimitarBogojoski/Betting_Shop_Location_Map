/** Creates the Basemap Gallery component and its Expand wrapper. */
export function createBasemapGalleryWidget({ createMapComponent, createExpand }) {
    const basemapGallery = createMapComponent("arcgis-basemap-gallery");
    basemapGallery.style.width = "240px";
    basemapGallery.style.maxWidth = "calc(100vw - 90px)";
    basemapGallery.style.maxHeight = "65vh";

    const basemapGalleryExpand = createExpand({
        content: basemapGallery,
        icon: "basemap",
        translationKey: "basemaps"
    });

    function translate() {
        const label = window.t("basemaps");
        basemapGallery.label = label;
        basemapGallery.setAttribute("aria-label", label);
        basemapGallery.setAttribute("title", label);
    }

    return { component: basemapGallery, expand: basemapGalleryExpand, translate };
}
