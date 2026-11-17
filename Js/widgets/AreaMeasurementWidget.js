/** Area Measurement widget, unit translations and mutation observer. */
export function createAreaMeasurementWidget({createMapComponent, createExpand, queryShadowDOM, changeElementText, findTextNode, isActive}) {
    let areaTranslationObserver = null;
//AREA MEASUREMENT
        const areaMeasurement = createMapComponent(
            "arcgis-area-measurement-2d",
            {
                unit: "metric"
            }
        );
        const areaExpand = createExpand({
            content: areaMeasurement,
            icon: "measure-area",
            translationKey: "area"
        });

        function updateAreaTranslations() {

            // ====================================
            // NEW MEASUREMENT BUTTON
            // ====================================

            const buttons = queryShadowDOM(
                areaMeasurement,
                'calcite-button[slot="actions"]'
            );

            const newMeasurementButton = buttons.find(button =>
                button.dataset.translationKey === "areaNewMeasurement" ||
                [
                    "New measurement",
                    "Ново мерење",
                    "Matje e re"
                ].includes(button.textContent.trim())
            );

            if (newMeasurementButton) {

                newMeasurementButton.dataset.translationKey =
                    "areaNewMeasurement";

                changeElementText(
                    newMeasurementButton,
                    window.t("distanceNewMeasurement")
                );
            }


            // ====================================
            // MEASUREMENT INSTRUCTION
            // ====================================

            const instruction = queryShadowDOM(
                areaMeasurement,
                ".hint p"
            ).find(element =>
                element.dataset.translationKey === "distanceInstruction" ||
                element.textContent.trim() ===
                "Start measuring by clicking in the map to place your first point"
            );

            if (instruction) {

                instruction.dataset.translationKey =
                    "distanceInstruction";

                changeElementText(
                    instruction,
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
                areaMeasurement,
                "calcite-label.root"
            );

            const unitLabel = unitLabels.find(label =>
                label.dataset.translationKey === "distanceUnits" ||
                findTextNode(label, unitTranslations)
            );

            if (unitLabel) {

                const textNode =
                    findTextNode(unitLabel, unitTranslations) ||
                    [...unitLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (textNode) {

                    const translated = window.t("distanceUnits");

                    if (translated &&
                        textNode.textContent.trim() !== translated) {

                        textNode.textContent = translated;

                    }

                    unitLabel.dataset.translationKey = "distanceUnits";
                }
            }


            // ====================================
            // UNIT DROPDOWN OPTIONS
            // ====================================

            const unitSelect = queryShadowDOM(
                areaMeasurement,
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

                unitSelect.setAttribute(
                    "aria-label",
                    window.t("distanceUnits")
                );

                Object.entries(unitOptions).forEach(([value, key]) => {

                    const option = [...unitSelect.options].find(
                        option => option.value === value
                    );

                    if (!option) return;

                    const translated = window.t(key);

                    if (!translated) return;

                    if (option.textContent !== translated) {
                        option.textContent = translated;
                    }

                    if (option.label !== translated) {
                        option.label = translated;
                    }

                });
            }


            // ====================================
            // AREA AND PERIMETER RESULTS
            // ====================================

            const resultLabels = [
                {
                    key: "areaResult",
                    variants: [
                        "Area",
                        "Површина",
                        "Sipërfaqja"
                    ]
                },
                {
                    key: "perimeterResult",
                    variants: [
                        "Perimeter",
                        "Периметар",
                        "Perimetri"
                    ]
                }
            ];

            const areaLabels = queryShadowDOM(
                areaMeasurement,
                "calcite-label.title"
            );

            resultLabels.forEach(({key, variants}) => {

                const label = areaLabels.find(element =>
                    element.dataset.translationKey === key ||
                    findTextNode(element, variants)
                );

                if (!label) return;

                const textNode =
                    findTextNode(label, variants) ||
                    [...label.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (!textNode) return;

                const translated = window.t(key);


                if (textNode.textContent.trim() !== translated) {
                    textNode.textContent = translated;
                }

                label.dataset.translationKey = key;


            });


            // ====================================
// TRANSLATE AREA UNIT DROPDOWN OPTIONS
// ====================================

            const areaUnitTranslations = [
                {
                    key: "areaUnitSquareInches",
                    variants: ["Square inches", "Квадратни инчи", "Inç katrorë"]
                },
                {
                    key: "areaUnitSquareFeet",
                    variants: ["Square feet", "Квадратни стапки", "Këmbë katrorë"]
                },
                {
                    key: "areaUnitSquareYards",
                    variants: ["Square yards", "Квадратни јарди", "Jardë katrorë"]
                },
                {
                    key: "areaUnitSquareMiles",
                    variants: ["Square miles", "Квадратни милји", "Milje katrorë"]
                },
                {
                    key: "areaUnitSquareNauticalMiles",
                    variants: [
                        "Square nautical miles",
                        "Квадратни наутички милји",
                        "Milje detare katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareUSFeet",
                    variants: [
                        "Square feet (US)",
                        "Квадратни стапки (САД)",
                        "Këmbë katrorë (SHBA)"
                    ]
                },
                {
                    key: "areaUnitSquareMillimeters",
                    variants: [
                        "Square millimeters",
                        "Квадратни милиметри",
                        "Milimetra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareCentimeters",
                    variants: [
                        "Square centimeters",
                        "Квадратни сантиметри",
                        "Centimetra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareDecimeters",
                    variants: [
                        "Square decimeters",
                        "Квадратни дециметри",
                        "Decimetra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareMeters",
                    variants: [
                        "Square meters",
                        "Квадратни метри",
                        "Metra katrorë"
                    ]
                },
                {
                    key: "areaUnitSquareKilometers",
                    variants: [
                        "Square kilometers",
                        "Квадратни километри",
                        "Kilometra katrorë"
                    ]
                },
                {
                    key: "areaUnitAcres",
                    variants: ["Acres", "Акри", "Akre"]
                },
                {
                    key: "areaUnitAres",
                    variants: ["Ares", "Ари", "Are"]
                },
                {
                    key: "areaUnitHectares",
                    variants: ["Hectares", "Хектари", "Hektarë"]
                }
            ];

            const areaOptions = queryShadowDOM(
                areaMeasurement,
                "calcite-option"
            );

            areaOptions.forEach(option => {

                const translation = areaUnitTranslations.find(item =>
                    option.dataset.translationKey === item.key ||
                    findTextNode(option, item.variants)
                );

                if (!translation) return;

                const textNode =
                    findTextNode(option, translation.variants) ||
                    [...option.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (!textNode) return;

                const translatedText = window.t(translation.key);

                if (!translatedText) {
                    return;
                }

                if (textNode.textContent.trim() !== translatedText) {
                    textNode.textContent = translatedText;
                }
                option.dataset.translationKey = translation.key;
            });

        }

        function startAreaTranslationObserver() {

            if (areaTranslationObserver) {
                areaTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeAreaTree(areaMeasurement);
                observeAreaTree(areaExpand);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (!isActive()) {
                        return;
                    }

                    updateAreaTranslations();

                });

            });

            areaTranslationObserver = observer;

            const options = {
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

            function observeAreaTree(root) {

                if (!root || observedRoots.has(root)) return;

                observedRoots.add(root);

                observer.observe(root, options);

                if (root.shadowRoot) {
                    observeAreaTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeAreaTree(element.shadowRoot);
                    }

                });

            }

            observeAreaTree(areaMeasurement);
            observeAreaTree(areaExpand);

        }

    return {
        component: areaMeasurement,
        expand: areaExpand,
        translate: updateAreaTranslations,
        startObserver: startAreaTranslationObserver,
        destroy() {
            areaTranslationObserver?.disconnect();
            areaTranslationObserver = null;
        }
    };
}
