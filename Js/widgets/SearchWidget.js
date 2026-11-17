/** Creates the ArcGIS Search widget and its Expand wrapper. */
export async function createSearchWidget({ Search, view, createExpand }) {
    const searchContainer = document.createElement("div");
    const search = new Search({
        view,
        container: searchContainer,
        locationEnabled: false
    });

    await search.viewModel.when();

    function updateSearchPlaceholder() {
        search.allSources.forEach(source => {
            source.placeholder = window.t("searchPlaceholder");
        });
    }

    const searchExpand = createExpand({
        content: searchContainer,
        icon: "search",
        translationKey: "search"
    });

    function translate() {
        search.label = window.t("search");
        updateSearchPlaceholder();
    }

    updateSearchPlaceholder();
    return {
        component: search,
        expand: searchExpand,
        translate,
        updateSearchPlaceholder,
        destroy() {
            search.destroy();
        }
    };
}
