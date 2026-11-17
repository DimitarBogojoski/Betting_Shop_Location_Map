/** Coordinate Conversion component and all of its UI translations. */
export function createCoordinateConversionWidget({createMapComponent, queryShadowDOM, changeElementText, findTextNode, isActive}) {
    let coordinateConversionTranslationObserver = null;
//CONVERTER
        const coordinateConversion = createMapComponent(
            "arcgis-coordinate-conversion"
        );

        // ====================================
// COORDINATE CONVERSION TRANSLATIONS
// ====================================

        function updateCoordinateConversionTranslations() {

            // ====================================
            // ADD CONVERSION OPTION
            // ====================================

            const addConversionOption = queryShadowDOM(
                coordinateConversion,
                'option[value="default"]'
            )[0];

            if (addConversionOption) {

                const translated = window.t("coordinateAddConversion");

                if (translated) {

                    addConversionOption.textContent = translated;
                    addConversionOption.label = translated;
                    addConversionOption.setAttribute("label", translated);

                    addConversionOption.dataset.translationKey =
                        "coordinateAddConversion";
                }
            }


            // ====================================
            // HOVER TOOLTIP TRANSLATIONS
            // ====================================

            const tooltipTranslations = [
                {
                    selector: 'button[aria-label]',
                    key: "coordinateInputCoordinate",
                    variants: ["Input coordinate"]
                },
                {
                    selector: "calcite-button",
                    key: "coordinateCaptureMode",
                    variants: ["Capture mode"]
                },
                {
                    selector: "calcite-button",
                    key: "coordinateFormatSettings",
                    variants: ["Format settings"]
                }
            ];

            // ====================================
// INPUT COORDINATE HEADING
// ====================================

            const inputHeadingVariants = [
                "Input coordinate",
                "Внеси координата",
                "Fut koordinatën"
            ];

            const inputHeading = queryShadowDOM(
                coordinateConversion,
                "h4.heading"
            ).find(element =>
                element.dataset.translationKey === "coordinateInputCoordinate" ||
                inputHeadingVariants.includes(element.textContent.trim())
            );

            if (inputHeading) {

                const translated = window.t("coordinateInputCoordinate");

                if (translated) {
                    changeElementText(inputHeading, translated);
                    inputHeading.dataset.translationKey =
                        "coordinateInputCoordinate";
                }
            }


// ====================================
// INPUT COORDINATE PLACEHOLDER
// ====================================

            const coordinateInputs = queryShadowDOM(
                coordinateConversion,
                'input[placeholder]'
            );

            coordinateInputs.forEach(input => {

                if (
                    input.dataset.translationKey !== "coordinateInputCoordinate" &&
                    !inputHeadingVariants.includes(input.placeholder)
                ) {
                    return;
                }

                const translated = window.t("coordinateInputCoordinate");

                if (!translated) return;

                input.placeholder = translated;
                input.setAttribute("placeholder", translated);
                input.setAttribute("aria-label", translated);

                input.dataset.translationKey = "coordinateInputCoordinate";

            });


// ====================================
// GO TO LOCATION LABEL
// ====================================

            const goToLocationVariants = [
                "Go to location",
                "Оди до локацијата",
                "Shko te vendndodhja"
            ];

            const goToLocationLabel = queryShadowDOM(
                coordinateConversion,
                "calcite-label"
            ).find(element =>
                element.dataset.translationKey === "coordinateGoToLocation" ||
                findTextNode(element, goToLocationVariants)
            );

            if (goToLocationLabel) {

                const translated = window.t("coordinateGoToLocation");

                if (translated) {
                    changeElementText(goToLocationLabel, translated);
                    goToLocationLabel.dataset.translationKey =
                        "coordinateGoToLocation";
                }
            }


// ====================================
// CONVERT BUTTON
// ====================================

            const convertVariants = [
                "Convert",
                "Конвертирај",
                "Konverto"
            ];

            const convertButton = queryShadowDOM(
                coordinateConversion,
                "calcite-button"
            ).find(element =>
                element.dataset.translationKey === "coordinateConvert" ||
                findTextNode(element, convertVariants)
            );

            if (convertButton) {

                const translated = window.t("coordinateConvert");

                if (translated) {
                    changeElementText(convertButton, translated);
                    convertButton.dataset.translationKey = "coordinateConvert";
                }
            }

            tooltipTranslations.forEach(({ selector, key, variants }) => {

                const elements = queryShadowDOM(
                    coordinateConversion,
                    selector
                );

                const element = elements.find(item =>
                    item.dataset.translationKey === key ||
                    variants.includes(item.getAttribute("aria-label")) ||
                    variants.includes(item.getAttribute("title"))
                );

                if (!element) return;

                const translated = window.t(key);

                if (!translated) return;

                // Native hover tooltip.
                element.title = translated;
                element.setAttribute("title", translated);

                // Accessibility label.
                element.setAttribute("aria-label", translated);

                element.dataset.translationKey = key;

            });


            // ====================================
            // VISIBLE FORMAT SETTINGS LABELS
            // ====================================

            const labelTranslations = [
                {
                    selector: ".heading",
                    key: "coordinateFormatSettings",
                    variants: ["Format settings"]
                },
                {
                    selector: "calcite-label",
                    key: "coordinateChangeDisplay",
                    variants: ["Change coordinate display"]
                },
                {
                    selector: "calcite-label",
                    key: "coordinatePreview",
                    variants: ["Preview"]
                }
            ];

            labelTranslations.forEach(({ selector, key, variants }) => {

                const elements = queryShadowDOM(
                    coordinateConversion,
                    selector
                );

                elements.forEach(element => {

                    let textNode = findTextNode(element, variants);

                    // Support already translated elements on language changes.
                    if (
                        !textNode &&
                        element.dataset.translationKey === key
                    ) {
                        const walker = document.createTreeWalker(
                            element,
                            NodeFilter.SHOW_TEXT
                        );

                        let node;

                        while (node = walker.nextNode()) {
                            if (node.textContent.trim()) {
                                textNode = node;
                                break;
                            }
                        }
                    }

                    if (!textNode) return;

                    const translated = window.t(key);

                    if (!translated) return;

                    if (textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    element.dataset.translationKey = key;

                });

            });

        }

        // ====================================
// COORDINATE CONVERSION OBSERVER
// ====================================

        function startCoordinateConversionTranslationObserver() {

            if (coordinateConversionTranslationObserver) {
                coordinateConversionTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeCoordinateTree(coordinateConversion);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (!isActive()) {
                        return;
                    }

                    updateCoordinateConversionTranslations();

                });

            });

            coordinateConversionTranslationObserver = observer;

            function observeCoordinateTree(root) {

                if (!root || observedRoots.has(root)) return;

                observedRoots.add(root);

                observer.observe(root, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true,
                    attributeFilter: [
                        "title",
                        "aria-label",
                        "label"
                    ]
                });

                if (root.shadowRoot) {
                    observeCoordinateTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeCoordinateTree(element.shadowRoot);
                    }

                });

            }

            observeCoordinateTree(coordinateConversion);

        }

    return {
        component: coordinateConversion,
        translate: updateCoordinateConversionTranslations,
        startObserver: startCoordinateConversionTranslationObserver,
        destroy() {
            coordinateConversionTranslationObserver?.disconnect();
            coordinateConversionTranslationObserver = null;
        }
    };
}
