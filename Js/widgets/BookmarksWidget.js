export function createBookmarksWidget({ createMapComponent, createExpand, queryShadowDOM, changeElementText, findTextNode, isActive}) {
    let bookmarkTranslationObserver = null;
//BOOKMARKS
        const bookmarks = createMapComponent("arcgis-bookmarks",{
            showAddBookmarkButton: true,
            showEditBookmarkButton: true,
            dragEnabled: true
        });

        const bookmarksExpand = createExpand({
            content: bookmarks,
            icon: "bookmark",
            translationKey: "bookmarks"
        });


        function updateBookmarkTranslations() {

            // ====================================
            // NO BOOKMARKS HEADING
            // ====================================

            const heading = queryShadowDOM(
                bookmarks,
                "h2.no-bookmarks-heading"
            ).find(element =>
                element.dataset.translationKey === "bookmarksNoBookmarks" ||
                element.textContent.trim() === "No bookmarks"
            );

            if (heading) {

                heading.dataset.translationKey = "bookmarksNoBookmarks";

                const translated = window.t("bookmarksNoBookmarks");

                if (translated) {
                    changeElementText(heading, translated);
                }
            }


            // ====================================
            // NO BOOKMARKS DESCRIPTION
            // ====================================

            const description = queryShadowDOM(
                bookmarks,
                "p.no-bookmarks-description"
            ).find(element =>
                element.dataset.translationKey === "bookmarksEmptyDescription" ||
                element.textContent.trim() ===
                "Add bookmarks to your map and they will appear here."
            );

            if (description) {

                description.dataset.translationKey =
                    "bookmarksEmptyDescription";

                const translated = window.t("bookmarksEmptyDescription");

                if (translated) {
                    changeElementText(description, translated);
                }
            }


            // ====================================
            // ADD BOOKMARK BUTTON
            // ====================================

            const addButton = queryShadowDOM(
                bookmarks,
                "calcite-button.button"
            ).find(button =>
                button.dataset.translationKey === "bookmarkAdd" ||
                button.textContent.trim() === "Add bookmark"
            );

            if (addButton) {

                addButton.dataset.translationKey = "bookmarkAdd";

                const translated = window.t("bookmarkAdd");

                if (translated) {
                    changeElementText(addButton, translated);
                }
            }


// ====================================
// BOOKMARK DIALOG HEADING
// ====================================

            const dialogHeading = queryShadowDOM(
                bookmarks,
                "h2.heading"
            ).find(element =>
                element.dataset.translationKey === "bookmarkDialogHeading" ||
                [
                    "Add bookmark",
                    "Додај обележувач",
                    "Shto faqeshënues"
                ].includes(element.textContent.trim())
            );

            if (dialogHeading) {

                dialogHeading.dataset.translationKey =
                    "bookmarkDialogHeading";

                changeElementText(
                    dialogHeading,
                    window.t("bookmarkDialogHeading")
                );
            }


// ====================================
// BOOKMARK TITLE LABEL
// ====================================

            const titleVariants = [
                "Title",
                "Наслов",
                "Titulli"
            ];

            const titleLabels = queryShadowDOM(
                bookmarks,
                "calcite-label"
            );

            const titleLabel = titleLabels.find(label =>
                label.dataset.translationKey === "bookmarkTitleLabel" ||
                findTextNode(label, titleVariants)
            );

            if (titleLabel) {

                const textNode =
                    findTextNode(titleLabel, titleVariants) ||
                    [...titleLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (textNode) {

                    const translated = window.t("bookmarkTitleLabel");

                    if (translated && textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    titleLabel.dataset.translationKey =
                        "bookmarkTitleLabel";
                }
            }


// ====================================
// BOOKMARK TITLE INPUT
// ====================================

            const bookmarkInputs = queryShadowDOM(
                bookmarks,
                'input[name="bookmark-name"]'
            );

            const translatedPlaceholder =
                window.t("bookmarkTitlePlaceholder");

            bookmarkInputs.forEach(input => {

                if (!translatedPlaceholder) {
                    return;
                }

                // Update the native input property.
                if (input.placeholder !== translatedPlaceholder) {
                    input.placeholder = translatedPlaceholder;
                }

                // Update the HTML attribute.
                if (
                    input.getAttribute("placeholder") !== translatedPlaceholder
                ) {
                    input.setAttribute("placeholder", translatedPlaceholder);
                }

                // Update accessibility label.
                const titleLabel = window.t("bookmarkTitleLabel");

                if (titleLabel) {
                    input.setAttribute("aria-label", titleLabel);
                }

                // Also update a Calcite input host, if present.
                const host = input.getRootNode()?.host;

                if (host?.tagName?.toLowerCase() === "calcite-input") {
                    host.placeholder = translatedPlaceholder;
                }

            });
// ====================================
// CANCEL BUTTON
// ====================================

            const footerButtons = queryShadowDOM(
                bookmarks,
                'calcite-button[slot="footer"]'
            );

            const cancelButton = footerButtons.find(button =>
                button.dataset.translationKey === "bookmarkCancel" ||
                [
                    "Cancel",
                    "Откажи",
                    "Anulo"
                ].includes(button.textContent.trim())
            );

            if (cancelButton) {

                cancelButton.dataset.translationKey = "bookmarkCancel";

                changeElementText(
                    cancelButton,
                    window.t("bookmarkCancel")
                );

            }


// ====================================
// ADD BUTTON
// ====================================

            const submitButton = footerButtons.find(button =>
                button.dataset.translationKey === "bookmarkSubmit" ||
                [
                    "Add",
                    "Додај",
                    "Shto"
                ].includes(button.textContent.trim())
            );

            if (submitButton) {

                submitButton.dataset.translationKey = "bookmarkSubmit";

                changeElementText(
                    submitButton,
                    window.t("bookmarkSubmit")
                );

            }


// ====================================
// EDIT BOOKMARK HEADING
// ====================================

            const editHeading = queryShadowDOM(
                bookmarks,
                "h2.heading"
            ).find(element =>
                element.dataset.translationKey === "bookmarkEditHeading" ||
                element.textContent.trim() === "Edit"
            );

            if (editHeading) {

                editHeading.dataset.translationKey = "bookmarkEditHeading";

                changeElementText(
                    editHeading,
                    window.t("bookmarkEditHeading")
                );
            }


// ====================================
// THUMBNAIL LABEL
// ====================================

            const thumbnailVariants = [
                "Thumbnail",
                "Сликичка",
                "Miniaturë"
            ];

            const thumbnailLabels = queryShadowDOM(
                bookmarks,
                "calcite-label"
            );

            const thumbnailLabel = thumbnailLabels.find(label =>
                label.dataset.translationKey === "bookmarkThumbnail" ||
                findTextNode(label, thumbnailVariants)
            );

            if (thumbnailLabel) {

                const textNode =
                    findTextNode(thumbnailLabel, thumbnailVariants) ||
                    [...thumbnailLabel.childNodes].find(node =>
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.trim()
                    );

                if (textNode) {

                    const translated = window.t("bookmarkThumbnail");

                    if (translated && textNode.textContent.trim() !== translated) {
                        textNode.textContent = translated;
                    }

                    thumbnailLabel.dataset.translationKey = "bookmarkThumbnail";
                }
            }


// ====================================
// THUMBNAIL OPTIONS
// ====================================

            const thumbnailOptions = [
                {
                    value: "screenshot",
                    key: "bookmarkScreenshot"
                },
                {
                    value: "url",
                    key: "bookmarkURL"
                },
                {
                    value: "none",
                    key: "bookmarkNone"
                }
            ];

            thumbnailOptions.forEach(({value, key}) => {

                const chip = queryShadowDOM(
                    bookmarks,
                    `calcite-chip[value="${value}"]`
                )[0];

                if (!chip) return;

                const translated = window.t(key);

                if (!translated) {
                    return;
                }

                changeElementText(chip, translated);

                chip.dataset.translationKey = key;

            });


// ====================================
// UPDATE THUMBNAIL BUTTON
// ====================================

            const updateThumbnailButton = queryShadowDOM(
                bookmarks,
                "calcite-button.authoring-refresh-thumbnail-button"
            )[0];

            if (updateThumbnailButton) {

                const translated = window.t("bookmarkUpdate");

                if (translated) {

                    changeElementText(
                        updateThumbnailButton,
                        translated
                    );

                    updateThumbnailButton.dataset.translationKey =
                        "bookmarkUpdate";
                }
            }


// ====================================
// DELETE BOOKMARK BUTTON
// ====================================

            const deleteButton = queryShadowDOM(
                bookmarks,
                'calcite-button[slot="footer"]'
            ).find(button =>
                button.dataset.translationKey === "bookmarkDelete" ||
                button.textContent.trim() === "Delete"
            );

            if (deleteButton) {

                const translated = window.t("bookmarkDelete");

                if (translated) {

                    changeElementText(
                        deleteButton,
                        translated
                    );

                    deleteButton.dataset.translationKey =
                        "bookmarkDelete";
                }
            }

            // ====================================
// SAVE BOOKMARK BUTTON
// ====================================

            const saveButton = queryShadowDOM(
                bookmarks,
                'calcite-button[slot="footer"][type="submit"]'
            ).find(button =>
                button.dataset.translationKey === "bookmarkSave" ||
                ["Save", "Зачувај", "Ruaj"].includes(
                    button.textContent.trim()
                )
            );

            if (saveButton) {

                const translated = window.t("bookmarkSave");

                if (translated) {

                    changeElementText(
                        saveButton,
                        translated
                    );

                    saveButton.dataset.translationKey = "bookmarkSave";
                }
            }

        }

        // ====================================
// BOOKMARK TRANSLATION OBSERVER
// ====================================

        function startBookmarkTranslationObserver() {

            if (bookmarkTranslationObserver) {
                bookmarkTranslationObserver.disconnect();
            }

            const observedRoots = new WeakSet();
            let scheduled = false;

            const observer = new MutationObserver(() => {

                observeBookmarkTree(bookmarks);
                observeBookmarkTree(bookmarksExpand);

                if (scheduled) return;

                scheduled = true;

                requestAnimationFrame(() => {

                    scheduled = false;

                    if (!isActive()) {
                        return;
                    }

                    updateBookmarkTranslations();

                });
            });

            bookmarkTranslationObserver = observer;

            function observeBookmarkTree(root) {

                if (!root) return;

                if (!observedRoots.has(root)) {

                    observedRoots.add(root);

                    observer.observe(root, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributes: true,
                        attributeFilter: [
                            "placeholder",
                            "aria-label"
                            ]
                    });
                }

                if (root.shadowRoot) {
                    observeBookmarkTree(root.shadowRoot);
                }

                root.querySelectorAll?.("*").forEach(element => {

                    if (element.shadowRoot) {
                        observeBookmarkTree(element.shadowRoot);
                    }

                });
            }

            observeBookmarkTree(bookmarks);
            observeBookmarkTree(bookmarksExpand);

        }

    return {
        component: bookmarks,
        expand: bookmarksExpand,
        translate: updateBookmarkTranslations,
        startObserver: startBookmarkTranslationObserver,
        destroy() {
            bookmarkTranslationObserver?.disconnect();
            bookmarkTranslationObserver = null;
        }
    };
}
