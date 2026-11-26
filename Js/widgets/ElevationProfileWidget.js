/** Elevation Profile widget and integration with the Sketch widget. */
export function createElevationProfileWidget({sketch, createMapComponent, createExpand, queryShadowDOM, changeElementText, findTextNode, isActive}) {
    let elevationTranslationObserver = null;
    const sketchEventController = new AbortController();
// ELEVATION PROFILE
        const elevationProfile = createMapComponent(
            "arcgis-elevation-profile",
            {
                profiles: [
                    {
                        type: "ground"
                    }
                ]
            }
        );

    // Make the Elevation Profile popup more compact
    Object.assign(elevationProfile.style, {
        width: "340px",
        maxWidth: "calc(100vw - 30px)",
        maxHeight: "420px",
        overflowY: "auto",
        boxSizing: "border-box"
    });

        const elevationExpand = createExpand({
            content: elevationProfile,
            icon: "measure",
            translationKey: "elevation"
        });

// ====================================
// ELEVATION PROFILE TRANSLATIONS
// ====================================

        function updateElevationProfileTranslations() {

            // ====================================
            // HELPER: TRANSLATE AN ELEMENT
            // ====================================

            function translateElement(element, key, variants) {

                if (!element) return;

                const translated = window.t(key);

                if (!translated) {
                    return;
                }

                // Find the original or previously translated text node.
                let textNode = findTextNode(element, variants);

                // If already translated, use the existing translation key.
                if (!textNode && element.dataset.translationKey === key) {

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

                if (textNode) {

                    if (textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    element.dataset.translationKey = key;
                }
            }


            // ====================================
            // PROMPT MESSAGE
            // ====================================

            const promptVariants = [
                "Draw line to generate an elevation profile.",
                "Create elevation profile by clicking in the map to place your first point, use double-click for last point.",
                "Нацртајте линија за да креирате профил на надморска височина.",
                "Кликнете на картата за да креирате профил на надморска височина и да ја поставите првата точка. Кликнете двапати за да ја поставите последната точка.",
                "Vizatoni një vijë për të krijuar profilin e lartësisë.",
                "Klikoni në hartë për të krijuar profilin e lartësisë dhe për të vendosur pikën e parë. Klikoni dy herë për të vendosur pikën e fundit."
            ];

            const prompt = queryShadowDOM(
                elevationProfile,
                ".prompt-message"
            ).find(element =>
                element.dataset.translationKey === "elevationPrompt" ||
                findTextNode(element, promptVariants)
            );

            translateElement(
                prompt,
                "elevationPrompt",
                promptVariants
            );


            // ====================================
            // GROUND LABEL
            // ====================================

            const groundVariants = [
                "Ground",
                "Терен",
                "Terreni"
            ];

            const groundLabel = queryShadowDOM(
                elevationProfile,
                "calcite-label.label"
            ).find(element =>
                element.dataset.translationKey === "elevationGround" ||
                findTextNode(element, groundVariants)
            );

            translateElement(
                groundLabel,
                "elevationGround",
                groundVariants
            );


            // ====================================
            // STATISTIC LABELS
            // ====================================

            const statisticTranslations = [

                {
                    key: "elevationLength",
                    variants: ["Length", "Должина", "Gjatësia"]
                },
                {
                    key: "elevationGain",
                    variants: ["Gain", "Искачување", "Ngjitja"]
                },
                {
                    key: "elevationLoss",
                    variants: ["Loss", "Спуштање", "Zbritja"]
                },
                {
                    key: "elevationMin",
                    variants: ["Min", "Мин.", "Min."]
                },
                {
                    key: "elevationMax",
                    variants: ["Max", "Макс.", "Maks."]
                },
                {
                    key: "elevationAvg",
                    variants: ["Avg", "Просек", "Mes."]
                },
                {
                    key: "elevationMaxSlope",
                    variants: [
                        "Max Slope",
                        "Макс. наклон",
                        "Pjerrësia maks."
                    ]
                },
                {
                    key: "elevationAvgSlope",
                    variants: [
                        "Avg Slope",
                        "Просечен наклон",
                        "Pjerrësia mes."
                    ]
                }

            ];

            const statisticLabels = queryShadowDOM(
                elevationProfile,
                ".statistic-label"
            );

            statisticLabels.forEach(label => {

                // Find the translation using its saved key or its visible text.
                const translation = statisticTranslations.find(item =>
                    label.dataset.translationKey === item.key ||
                    findTextNode(label, item.variants)
                );

                if (!translation) return;

                translateElement(
                    label,
                    translation.key,
                    translation.variants
                );

            });


            // ====================================
            // NEW PROFILE BUTTON
            // ====================================

            const buttonVariants = [
                "New profile",
                "Нов профил",
                "Profil i ri"
            ];

            const newProfileButton = queryShadowDOM(
                elevationProfile,
                ".action-button"
            ).find(element =>
                element.dataset.translationKey === "elevationNewProfile" ||
                findTextNode(element, buttonVariants)
            );

            translateElement(
                newProfileButton,
                "elevationNewProfile",
                buttonVariants
            );

            // ====================================
// DONE BUTTON
// ====================================

            const doneButtonVariants = [
                "Done",
                "Готово",
                "U krye"
            ];

            const doneButton = queryShadowDOM(
                elevationProfile,
                ".action-button"
            ).find(element =>
                element.dataset.translationKey === "elevationDone" ||
                doneButtonVariants.some(variant =>
                    element.textContent.trim() === variant
                )
            );

            translateElement(
                doneButton,
                "elevationDone",
                doneButtonVariants
            );

            // ====================================
// ELEVATION PROFILE UNIT TRANSLATIONS
// ====================================

// ====================================
// DISTANCE UNITS, ELEVATION UNITS,
// UNIFORM CHART SCALING
// ====================================

            const elevationLabelTranslations = [
                {
                    key: "elevationDistanceUnits",
                    variants: ["Distance Units"]
                },
                {
                    key: "elevationUnits",
                    variants: ["Elevation units"]
                },
                {
                    key: "elevationUniformChartScaling",
                    variants: ["Uniform chart scaling"]
                }
            ];

            const elevationLabels = queryShadowDOM(
                elevationProfile,
                "calcite-label, label, .label, .uniform-chart-scaling-label"
            );

            elevationLabels.forEach(label => {

                const translation = elevationLabelTranslations.find(item =>
                    label.dataset.translationKey === item.key ||
                    item.variants.some(variant =>
                        findTextNode(label, [variant])
                    )
                );

                if (!translation) return;

                translateElement(
                    label,
                    translation.key,
                    translation.variants
                );

            });


// ====================================
// DISTANCE AND ELEVATION UNIT OPTIONS
// ====================================

            const elevationUnitTranslations = [

                {
                    key: "distanceUnitMetric",
                    variants: ["Metric"]
                },
                {
                    key: "distanceUnitImperial",
                    variants: ["Imperial"]
                },
                {
                    key: "distanceUnitInches",
                    variants: ["Inches"]
                },
                {
                    key: "distanceUnitFeet",
                    variants: ["Feet"]
                },
                {
                    key: "distanceUnitYards",
                    variants: ["Yards"]
                },
                {
                    key: "distanceUnitMiles",
                    variants: ["Miles"]
                },
                {
                    key: "distanceUnitNauticalMiles",
                    variants: ["Nautical miles"]
                },
                {
                    key: "distanceUnitUSFeet",
                    variants: ["Feet (US)"]
                },
                {
                    key: "distanceUnitMillimeters",
                    variants: ["Millimeters"]
                },
                {
                    key: "distanceUnitCentimeters",
                    variants: ["Centimeters"]
                },
                {
                    key: "elevationUnitDecimeter",
                    variants: ["Decimeter"]
                },
                {
                    key: "elevationUnitMeters",
                    variants: ["Meters"]
                },
                {
                    key: "distanceUnitKilometers",
                    variants: ["Kilometers"]
                }

            ];

            const elevationUnitOptions = queryShadowDOM(
                elevationProfile,
                "calcite-option"
            );

            elevationUnitOptions.forEach(option => {

                const translation = elevationUnitTranslations.find(item =>
                    option.dataset.translationKey === item.key ||
                    item.variants.some(variant =>
                        findTextNode(option, [variant])
                    )
                );

                if (!translation) return;

                translateElement(
                    option,
                    translation.key,
                    translation.variants
                );

            });

        }

        // ====================================
// OBSERVE ELEVATION PROFILE SHADOW DOM
// ====================================

        function startElevationProfileTranslationObserver() {

            if (elevationTranslationObserver) {
                elevationTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                // Detect newly rendered content and nested Shadow DOM.
                observeElevationTree(elevationProfile);
                observeElevationTree(elevationExpand);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (!isActive()) {
                        return;
                    }

                    updateElevationProfileTranslations();

                });

            });

            elevationTranslationObserver = observer;

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

            function observeElevationTree(root) {

                if (!root) return;

                if (!observedRoots.has(root)) {

                    observedRoots.add(root);

                    observer.observe(root, observerOptions);
                }

                // Observe the root's own Shadow DOM.
                if (root.shadowRoot) {
                    observeElevationTree(root.shadowRoot);
                }

                // Discover nested Shadow DOM.
                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeElevationTree(element.shadowRoot);
                    }

                });

            }

            observeElevationTree(elevationProfile);
            observeElevationTree(elevationExpand);

        }

        // ====================================
// CONNECT SKETCH TO ELEVATION PROFILE
// ====================================

        function updateElevationProfile(graphic) {

            if (!graphic || graphic.geometry?.type !== "polyline") {
                return;
            }

            // A valid profile needs at least two vertices.
            const paths = graphic.geometry.paths;

            if (!paths || !paths.some(path => path.length >= 2)) {
                return;
            }

            // Send the drawn line to the Elevation Profile component.
            elevationProfile.geometry = graphic.geometry;
        }


// When a new graphic is created.
        sketch.addEventListener("arcgisCreate", (event) => {

            if (event.detail.state !== "complete") {
                return;
            }

            updateElevationProfile(event.detail.graphic);

        }, { signal: sketchEventController.signal });


// When an existing graphic is modified.
        sketch.addEventListener("arcgisUpdate", (event) => {

            if (event.detail.state !== "complete") {
                return;
            }

            const polyline = event.detail.graphics?.find(
                graphic => graphic.geometry?.type === "polyline"
            );

            if (polyline) {
                updateElevationProfile(polyline);
            }

        }, { signal: sketchEventController.signal });

    return {
        component: elevationProfile,
        expand: elevationExpand,
        translate: updateElevationProfileTranslations,
        startObserver: startElevationProfileTranslationObserver,
        destroy() {
            elevationTranslationObserver?.disconnect();
            elevationTranslationObserver = null;
            sketchEventController.abort();
        }
    };
}
