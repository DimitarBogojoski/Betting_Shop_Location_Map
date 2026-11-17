/** Print component, export UI localization and mutation observer. */
export function createPrintWidget({createMapComponent, createExpand, queryShadowDOM, isActive}) {
    let printTranslationObserver = null;
// ====================================
// PRINT
// ====================================

        const print = createMapComponent("arcgis-print", {
            printServiceUrl:
                "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });


// IMPORTANT: Keep this declaration!
        const printExpand = createExpand({
            content: print,
            icon: "print",
            translationKey: "print"
        });


// ====================================
// PRINT WIDGET TRANSLATIONS
// ====================================

        function updatePrintTranslations() {

            // Translate an element's matching text node without
            // replacing its nested HTML or other content.
            function translatePrintElement(element, key, variants) {

                if (!element) return;

                const translated = window.t(key);

                if (!translated) {
                    return;
                }

                const normalize = text =>
                    text.replace(/\s+/g, " ").trim().toLowerCase();

                const walker = document.createTreeWalker(
                    element,
                    NodeFilter.SHOW_TEXT
                );

                let node;

                while (node = walker.nextNode()) {

                    const current = normalize(node.textContent);

                    if (variants.some(variant =>
                        normalize(variant) === current
                    )) {

                        if (node.textContent.trim() !== translated) {
                            node.textContent = translated;
                        }

                        element.dataset.translationKey = key;
                        return;
                    }
                }
            }


            // ====================================
            // HEADINGS, TABS AND LABELS
            // ====================================

            const textTranslations = [

                {
                    selector: ".header-title",
                    key: "printExportHeading",
                    variants: ["Export", "Извоз", "Eksporti"]
                },
                {
                    selector: "calcite-tab-title",
                    key: "printLayout",
                    variants: ["Layout", "Распоред", "Paraqitja"]
                },
                {
                    selector: "calcite-tab-title",
                    key: "printMapOnly",
                    variants: ["Map only", "Само карта", "Vetëm harta"]
                },
                {
                    selector: "calcite-tab-title",
                    key: "printExports",
                    variants: [
                        "Exports",
                        "Извезени датотеки",
                        "Skedarët e eksportuar"
                    ]
                },
                {
                    selector: "calcite-label",
                    key: "printTitle",
                    variants: ["Title", "Наслов", "Titulli"]
                },
                {
                    selector: "calcite-label",
                    key: "printTemplate",
                    variants: ["Template", "Шаблон", "Modeli"]
                },
                {
                    selector: ".heading",
                    key: "printLetterLandscape",
                    variants: [
                        "Letter ANSI A landscape",
                        "Letter ANSI A – хоризонтално",
                        "Letter ANSI A – horizontal"
                    ]
                },
                {
                    selector: ".heading",
                    key: "printChooseTemplate",
                    variants: [
                        "Choose template",
                        "Избери шаблон",
                        "Zgjidhni modelin"
                    ]
                },
                {
                    selector: ".heading",
                    key: "printAdvancedOptions",
                    variants: [
                        "Advanced options",
                        "Напредни опции",
                        "Opsionet e avancuara"
                    ]
                },
                {
                    selector: ".label",
                    key: "printA3Landscape",
                    variants: [
                        "A3 landscape",
                        "A3 – хоризонтално",
                        "A3 – horizontal"
                    ]
                },
                {
                    selector: ".label",
                    key: "printA3Portrait",
                    variants: [
                        "A3 portrait",
                        "A3 – вертикално",
                        "A3 – vertikal"
                    ]
                },
                {
                    selector: ".label",
                    key: "printA4Landscape",
                    variants: [
                        "A4 landscape",
                        "A4 – хоризонтално",
                        "A4 – horizontal"
                    ]
                },
                {
                    selector: ".label",
                    key: "printA4Portrait",
                    variants: [
                        "A4 portrait",
                        "A4 – вертикално",
                        "A4 – vertikal"
                    ]
                },
                {
                    selector: ".label",
                    key: "printLetterPortrait",
                    variants: [
                        "Letter ANSI A portrait",
                        "Letter ANSI A – вертикално",
                        "Letter ANSI A – vertikal"
                    ]
                },
                {
                    selector: ".label",
                    key: "printTabloidLandscape",
                    variants: [
                        "Tabloid ANSI B landscape",
                        "Tabloid ANSI B – хоризонтално",
                        "Tabloid ANSI B – horizontal"
                    ]
                },
                {
                    selector: ".label",
                    key: "printTabloidPortrait",
                    variants: [
                        "Tabloid ANSI B portrait",
                        "Tabloid ANSI B – вертикално",
                        "Tabloid ANSI B – vertikal"
                    ]
                },

                // Template descriptions
                {
                    selector: ".description",
                    key: "printLetterLandscapeSize",
                    variants: ["11 × 8.5 inches", "11 × 8,5 инчи", "11 × 8,5 inç"]
                },
                {
                    selector: ".description",
                    key: "printA3LandscapeSize",
                    variants: ["42 × 29.7 centimeters", "42 × 29,7 сантиметри", "42 × 29,7 centimetra"]
                },
                {
                    selector: ".description",
                    key: "printA3PortraitSize",
                    variants: ["29.7 × 42 centimeters", "29,7 × 42 сантиметри", "29,7 × 42 centimetra"]
                },
                {
                    selector: ".description",
                    key: "printA4LandscapeSize",
                    variants: ["29.7 × 21 centimeters", "29,7 × 21 сантиметри", "29,7 × 21 centimetra"]
                },
                {
                    selector: ".description",
                    key: "printA4PortraitSize",
                    variants: ["21 x 29.7 centimeters", "21 × 29,7 сантиметри", "21 × 29,7 centimetra"]
                },
                {
                    selector: ".description",
                    key: "printLetterPortraitSize",
                    variants: ["8.5 × 11 inches", "8,5 × 11 инчи", "8,5 × 11 inç"]
                },
                {
                    selector: ".description",
                    key: "printTabloidLandscapeSize",
                    variants: ["17 × 11 inches", "17 × 11 инчи", "17 × 11 inç"]
                },
                {
                    selector: ".description",
                    key: "printTabloidPortraitSize",
                    variants: ["11 × 17 inches", "11 × 17 инчи", "11 × 17 inç"]
                },

                // Other settings
                {
                    selector: "calcite-label",
                    key: "printShowPrintArea",
                    variants: [
                        "Show print area",
                        "Прикажи ја областа за печатење",
                        "Shfaq zonën e printimit"
                    ]
                },
                {
                    selector: "calcite-label",
                    key: "printFileFormat",
                    variants: ["File format", "Формат на датотека", "Formati i skedarit"]
                },
                {
                    selector: "calcite-label",
                    key: "printSetScale",
                    variants: ["Set scale", "Постави размер", "Vendos shkallën"]
                },
                {
                    selector: "calcite-label",
                    key: "printCopyright",
                    variants: ["Copyright", "Авторски права", "Të drejtat e autorit"]
                },
                {
                    selector: ".sr-label",
                    key: "printOutputSpatialReference",
                    variants: [
                        "Output spatial reference",
                        "Излезен просторен референтен систем",
                        "Sistemi referues hapësinor i daljes"
                    ]
                },
                {
                    selector: "calcite-label",
                    key: "printIncludeLegend",
                    variants: ["Include legend", "Вклучи легенда", "Përfshi legjendën"]
                },
                {
                    selector: "calcite-label",
                    key: "printDynamicLegend",
                    variants: ["Dynamic legend", "Динамичка легенда", "Legjendë dinamike"]
                },
                {
                    selector: "calcite-label",
                    key: "printIncludeNorthArrow",
                    variants: [
                        "Include north arrow",
                        "Вклучи стрелка за север",
                        "Përfshi shigjetën e veriut"
                    ]
                },
                {
                    selector: "calcite-label",
                    key: "printIncludeScaleBar",
                    variants: [
                        "Include scale bar",
                        "Вклучи размерна линија",
                        "Përfshi shkallën grafike"
                    ]
                },

                // Template confirmation button
                {
                    selector: ".template-done-button",
                    key: "printDone",
                    variants: ["Done", "Готово", "U krye"]
                },

                // Export button visible text
                {
                    selector: 'calcite-button[aria-label]',
                    key: "printExportButton",
                    variants: ["Export", "Извези", "Eksporto"]
                },

                // ====================================
// ADDITIONAL PRINT LABELS
// ====================================

                {
                    selector: "calcite-label",
                    key: "printAuthor",
                    variants: ["Author", "Автор", "Autori"]
                },
                {
                    selector: "calcite-label",
                    key: "printScaleBarUnit",
                    variants: [
                        "Scale bar unit",
                        "Единица на размерната линија",
                        "Njësia e shiritit të shkallës"
                    ]
                },
                {
                    selector: "calcite-label",
                    key: "printFileName",
                    variants: [
                        "File name",
                        "Име на датотеката",
                        "Emri i skedarit"
                    ]
                },
                {
                    selector: "calcite-label",
                    key: "printWidth",
                    variants: ["Width", "Ширина", "Gjerësia"]
                },
                {
                    selector: "calcite-label",
                    key: "printHeight",
                    variants: ["Height", "Висина", "Lartësia"]
                },
                {
                    selector: "p.exported-files-title",
                    key: "printNoExportedFiles",
                    variants: [
                        "No exported files",
                        "Нема извезени датотеки",
                        "Nuk ka skedarë të eksportuar"
                    ]
                },
                {
                    selector: "div",
                    key: "printExportedFilesDescription",
                    variants: [
                        "When you export a file, it will be shown here. Exports are only stored for a short period of time. Download your export to ensure continued access.",
                        "Кога ќе извезете датотека, таа ќе се прикаже тука. Извезените датотеки се чуваат само краток период. Преземете ја извезената датотека за да имате пристап до неа и понатаму.",
                        "Kur eksportoni një skedar, ai do të shfaqet këtu. Eksportet ruhen vetëm për një periudhë të shkurtër. Shkarkoni eksportin për të siguruar qasje të vazhdueshme."
                    ]
                }
            ];



            textTranslations.forEach(({ selector, key, variants }) => {

                const elements = queryShadowDOM(print, selector);

                elements.forEach(element => {
                    translatePrintElement(element, key, variants);
                });

            });


            // ====================================
            // TITLE PLACEHOLDER
            // ====================================

            const titlePlaceholderVariants = [
                "Title of file",
                "Наслов на датотеката",
                "Titulli i skedarit"
            ];

            const fileNameVariants = [
                "File name",
                "Име на датотеката",
                "Emri i skedarit"
            ];

            queryShadowDOM(
                print,
                'input[placeholder]'
            ).forEach(input => {

                if (
                    input.dataset.translationKey !== "printFileNamePlaceholder" &&
                    !fileNameVariants.includes(input.placeholder.trim())
                ) {
                    return;
                }

                const translated = window.t("printFileNamePlaceholder");

                if (!translated) return;

                input.placeholder = translated;
                input.setAttribute("placeholder", translated);
                input.setAttribute("aria-label", translated);

                input.dataset.translationKey = "printFileNamePlaceholder";

            });

            queryShadowDOM(print, 'input[placeholder]').forEach(input => {

                const isTitleInput = titlePlaceholderVariants.some(
                    value => input.placeholder.trim() === value
                ) || input.dataset.translationKey === "printTitlePlaceholder";

                if (!isTitleInput) return;

                const translated = window.t("printTitlePlaceholder");

                if (!translated) return;

                if (input.placeholder !== translated) {
                    input.placeholder = translated;
                }

                input.setAttribute("placeholder", translated);
                input.setAttribute("aria-label", window.t("printTitle"));

                input.dataset.translationKey = "printTitlePlaceholder";

            });


            // ====================================
            // EXPORT BUTTON ACCESSIBILITY LABEL
            // ====================================

            const exportAriaVariants = [
                "Export. Exported files will appear below.",
                "Извези. Извезените датотеки ќе се појават подолу.",
                "Eksporto. Skedarët e eksportuar do të shfaqen më poshtë."
            ];

            queryShadowDOM(print, "calcite-button[aria-label]").forEach(button => {

                if (!exportAriaVariants.includes(button.getAttribute("aria-label"))) {
                    return;
                }

                const translated = window.t("printExportButtonAria");

                if (translated) {
                    button.setAttribute("aria-label", translated);
                }

            });


            // ====================================
            // TEMPLATE UNIT OPTIONS
            // ====================================

            const unitOptions = [
                {
                    key: "printMilesKilometers",
                    variants: [
                        "Miles and Kilometers",
                        "Милји и километри",
                        "Milje dhe kilometra"
                    ]
                },
                {
                    key: "printFeetMeters",
                    variants: [
                        "Feet and Meters",
                        "Стапки и метри",
                        "Këmbë dhe metra"
                    ]
                }
            ];

            ["option", "calcite-option"].forEach(selector => {

                queryShadowDOM(print, selector).forEach(option => {

                    const currentText = option.textContent
                        .replace(/\s+/g, " ")
                        .trim();

                    const translation = unitOptions.find(item =>
                        item.variants.includes(currentText) ||
                        option.dataset.translationKey === item.key
                    );

                    if (!translation) return;

                    const translated = window.t(translation.key);

                    if (!translated) return;

                    option.textContent = translated;

                    if (option.hasAttribute("label")) {
                        option.setAttribute("label", translated);
                    }

                    if ("label" in option) {
                        option.label = translated;
                    }

                    option.dataset.translationKey = translation.key;

                });

            });

        }


// ====================================
// PRINT TRANSLATION OBSERVER
// ====================================

        function startPrintTranslationObserver() {

            if (printTranslationObserver) {
                printTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observePrintTree(print);
                observePrintTree(printExpand);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (!isActive()) {
                        return;
                    }

                    updatePrintTranslations();

                });

            });

            printTranslationObserver = observer;

            const options = {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: [
                    "placeholder",
                    "aria-label",
                    "title",
                    "label",
                    "selected"
                ]
            };

            function observePrintTree(root) {

                if (!root || observedRoots.has(root)) return;

                observedRoots.add(root);

                observer.observe(root, options);

                if (root.shadowRoot) {
                    observePrintTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observePrintTree(element.shadowRoot);
                    }

                });

            }

            observePrintTree(print);
            observePrintTree(printExpand);

        }

    return {
        component: print,
        expand: printExpand,
        translate: updatePrintTranslations,
        startObserver: startPrintTranslationObserver,
        destroy() {
            printTranslationObserver?.disconnect();
            printTranslationObserver = null;
        }
    };
}
