/** Shared DOM helpers used by ArcGIS/Calcite widget modules. */
export function createWidgetHelpers(view) {
    function createMapComponent(tagName, properties = {}) {
        const component = document.createElement(tagName);
        component.view = view;
        Object.assign(component, properties);
        return component;
    }

    function createExpand({ content, icon, translationKey }) {
        const expand = createMapComponent("arcgis-expand", {
            expandIcon: icon
        });
        expand.append(content);
        expand.dataset.translationKey = translationKey;
        return expand;
    }

    function queryShadowDOM(host, selector) {
        const results = new Set();
        const visited = new Set();

        function search(root) {
            if (!root || visited.has(root)) return;
            visited.add(root);

            root.querySelectorAll?.(selector).forEach(element => results.add(element));
            root.querySelectorAll?.("*").forEach(element => {
                if (element.shadowRoot) search(element.shadowRoot);
            });
        }

        search(host);
        if (host?.shadowRoot) search(host.shadowRoot);
        return [...results];
    }

    function changeElementText(element, newText) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.trim()) {
                if (node.textContent.trim() !== newText) node.textContent = newText;
                return true;
            }
        }
        return false;
    }

    function findTextNode(root, possibleTexts) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (possibleTexts.includes(node.textContent.trim())) return node;
        }
        return null;
    }

    return {
        createMapComponent,
        createExpand,
        queryShadowDOM,
        changeElementText,
        findTextNode
    };
}
