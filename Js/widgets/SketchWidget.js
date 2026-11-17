/** Sketch widget and its toolbar/settings localization. */
export function createSketchWidget({sketchGraphicsLayer, createMapComponent, queryShadowDOM, changeElementText, findTextNode, isActive}) {
    let sketchTranslationObserver = null;
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

                    if (!isActive()) {
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

    return {
        component: sketch,
        translate: updateSketchTranslations,
        startObserver: startSketchTranslationObserver,
        destroy() {
            sketchTranslationObserver?.disconnect();
            sketchTranslationObserver = null;
        }
    };
}
