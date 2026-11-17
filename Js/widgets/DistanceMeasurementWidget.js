/** Distance Measurement widget, translations, and post-map-click refresh. */
export function createDistanceMeasurementWidget({view, createMapComponent, createExpand, queryShadowDOM, changeElementText, findTextNode, isActive}) {
    let distanceTranslationObserver = null;
    let distanceMapClickHandle = null;
//DISTANCE MEASUREMENT
        const distanceMeasurement = createMapComponent(
            "arcgis-distance-measurement-2d",
            {
                unit: "metric"
            }
        );

// Expose component temporarily for debugging

        const measurementExpand = createExpand({
            content: distanceMeasurement,
            icon: "measure",
            translationKey: "distance"
        });

        window.distanceMeasurement = distanceMeasurement;

        function updateDistanceTranslations() {

            // ====================================
            // NEW MEASUREMENT BUTTON
            // ====================================

            const buttons = queryShadowDOM(
                distanceMeasurement,
                'calcite-button[slot="actions"]'
            );

            const newMeasurementButton = buttons.find(button =>
                button.dataset.translationKey === "distanceNewMeasurement" ||
                button.textContent.trim() === "New measurement"
            );

            if (newMeasurementButton) {

                newMeasurementButton.dataset.translationKey =
                    "distanceNewMeasurement";

                changeElementText(
                    newMeasurementButton,
                    window.t("distanceNewMeasurement")
                );
            }


            // ====================================
            // MEASUREMENT INSTRUCTION
            // ====================================

            const instructionParagraph = queryShadowDOM(
                distanceMeasurement,
                ".hint p"
            ).find(element =>
                element.dataset.translationKey === "distanceInstruction" ||
                element.textContent.trim() ===
                "Start measuring by clicking in the map to place your first point"
            );

            if (instructionParagraph) {

                instructionParagraph.dataset.translationKey =
                    "distanceInstruction";

                changeElementText(
                    instructionParagraph,
                    window.t("distanceInstruction")
                );
            }


            // ====================================
// UNIT LABEL
// ====================================

            const unitTranslations = [
                "Unit",
                "Единица",
                "Njësia"
            ];

            const unitLabels = queryShadowDOM(
                distanceMeasurement,
                "calcite-label.root"
            );

            const unitLabel = unitLabels.find(label =>
                label.dataset.translationKey === "distanceUnits" ||
                findTextNode(label, unitTranslations)
            );

            const translatedUnit = window.t("distanceUnits");

             if (unitLabel) {

                const textNode =
                    findTextNode(unitLabel, unitTranslations) ||
                    [...unitLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );


                    if (textNode.textContent.trim() !== translatedUnit) {
                        textNode.textContent = translatedUnit;
                    }

                    unitLabel.dataset.translationKey =
                        "distanceUnits";
            }


// ====================================
// TRANSLATE UNIT DROPDOWN OPTIONS
// ====================================

            const unitSelect = queryShadowDOM(
                distanceMeasurement,
                "select.select"
            )[0];

            if (unitSelect) {

                const unitOptions = {
                    "metric": "distanceUnitMetric",
                    "imperial": "distanceUnitImperial",
                    "inches": "distanceUnitInches",
                    "feet": "distanceUnitFeet",
                    "yards": "distanceUnitYards",
                    "miles": "distanceUnitMiles",
                    "nautical-miles": "distanceUnitNauticalMiles",
                    "us-feet": "distanceUnitUSFeet",
                    "millimeters": "distanceUnitMillimeters",
                    "centimeters": "distanceUnitCentimeters",
                    "decimeters": "distanceUnitDecimeters",
                    "kilometers": "distanceUnitKilometers"
                };

                // Translate dropdown accessibility label.
                unitSelect.setAttribute(
                    "aria-label",
                    window.t("distanceUnit")
                );

                // Translate every option.
                Object.entries(unitOptions).forEach(([value, key]) => {

                    const option = [...unitSelect.options].find(
                        option => option.value === value
                    );

                    if (!option) return;

                    const translatedText = window.t(key);

                    if (option.textContent !== translatedText) {
                        option.textContent = translatedText;
                    }

                    if (option.label !== translatedText) {
                        option.label = translatedText;
                    }
                });
            }

// ====================================
// TRANSLATE DISTANCE LABEL
// ====================================

            const distanceLabelTranslations = [
                "Distance",
                "Растојание",
                "Distanca"
            ];

            const distanceLabels = queryShadowDOM(
                distanceMeasurement,
                "calcite-label.title"
            );

            const distanceLabel = distanceLabels.find(label =>
                label.dataset.translationKey === "distanceResult" ||
                findTextNode(label, distanceLabelTranslations)
            );

            const translatedDistance = window.t("distanceResult");

            if (distanceLabel) {

                distanceLabel.dataset.translationKey = "distanceResult";

                changeElementText(
                    distanceLabel,
                    translatedDistance
                );
            }
        }

            function startDistanceTranslationObserver() {

                if (distanceTranslationObserver) {
                    distanceTranslationObserver.disconnect();
                }

                const observedRoots = new WeakSet();
                let translationScheduled = false;

                const observer = new MutationObserver(() => {

                    // Discover newly created nested Shadow DOM elements.
                    observeDistanceTree(distanceMeasurement);
                    observeDistanceTree(measurementExpand);

                    if (translationScheduled) return;

                    translationScheduled = true;

                    requestAnimationFrame(() => {

                        translationScheduled = false;

                        if (!isActive()) {
                        return;
                    }

                        updateDistanceTranslations();

                    });

                });

                distanceTranslationObserver = observer;

                const observerOptions = {
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true,
                    attributeFilter: [
                        "expanded",
                        "hidden",
                        "aria-expanded"
                    ]
                };

                function observeDistanceTree(root) {

                    if (!root) return;

                    // Observe each root only once.
                    if (!observedRoots.has(root)) {

                        observedRoots.add(root);

                        observer.observe(root, observerOptions);

                    }

                    // Discover nested Shadow DOM roots.
                    if (root.shadowRoot) {
                        observeDistanceTree(root.shadowRoot);
                    }

                    root.querySelectorAll?.("*").forEach(element => {

                        if (element.shadowRoot) {
                            observeDistanceTree(element.shadowRoot);
                        }

                    });

                }

                observeDistanceTree(distanceMeasurement);
                observeDistanceTree(measurementExpand);

            }

// Re-translate after clicking the map to create a measurement result.
        distanceMapClickHandle = view.on("click", () => {

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    updateDistanceTranslations();
                });
            });

        });

    return {
        component: distanceMeasurement,
        expand: measurementExpand,
        translate: updateDistanceTranslations,
        startObserver: startDistanceTranslationObserver,
        destroy() {
            distanceTranslationObserver?.disconnect();
            distanceTranslationObserver = null;
            distanceMapClickHandle?.remove();
            distanceMapClickHandle = null;
        }
    };
}
