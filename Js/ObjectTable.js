window.initObjectsTable = function (records = []) {
    const tbody = document.getElementById("objects-table-body");
    const pagination = document.getElementById("objects-pagination");
    const summary = document.getElementById("objects-table-summary");
    const exportButton = document.getElementById("export-objects");

    if (!tbody || !pagination || !summary || !exportButton) {
        return;
    }

    const searchInput = document.getElementById("objects-search");

    const pageSizeSelect = document.getElementById("objects-page-size");

    let pageSize = Number(pageSizeSelect?.value || 10);
    let currentPage = 1;
    let filteredRecords = records;

    let totalPages = Math.max(
        1,
        Math.ceil(filteredRecords.length / pageSize)
    );

    let sortKey = "objectId";
    let sortDirection = "asc";

    const textCollator = new Intl.Collator("mk", {
        numeric: true,
        sensitivity: "base"
    });

    function sortRecords() {
        const direction = sortDirection === "asc" ? 1 : -1;

        filteredRecords = [...filteredRecords].sort((a, b) => {
            if (sortKey === "objectId") {
                const first = Number(a.objectId);
                const second = Number(b.objectId);

                if (Number.isFinite(first) && Number.isFinite(second)) {
                    return (first - second) * direction;
                }
            }

            const first = String(a[sortKey] ?? "");
            const second = String(b[sortKey] ?? "");

            return textCollator.compare(first, second) * direction;
        });
    }

    function addPageButton(label, page, options = {}) {
        const li = document.createElement("li");
        li.className = "page-item";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-link";
        button.textContent = label;
        button.disabled = Boolean(options.disabled);
        button.setAttribute(
            "aria-label",
            options.ariaLabel || window.t("pageNumber", { page })
        );

        if (options.active) {
            li.classList.add("active");
            button.setAttribute("aria-current", "page");
        }

        if (options.disabled) {
            li.classList.add("disabled");
        }

        button.addEventListener("click", () => {
            currentPage = page;
            render();
        });

        li.appendChild(button);
        pagination.appendChild(li);
    }

    function addEllipsis() {
        const li = document.createElement("li");
        li.className = "page-item disabled";

        const span = document.createElement("span");
        span.className = "page-link";
        span.textContent = "…";

        li.appendChild(span);
        pagination.appendChild(li);
    }

    function renderPagination() {
        pagination.replaceChildren();

        addPageButton("<", currentPage - 1, {
            disabled: currentPage === 1 || filteredRecords.length === 0,
            ariaLabel: window.t("previousPage")
        });

        // Show the first five pages initially, then a moving window.
        const start = Math.max(
            1,
            Math.min(currentPage - 2, totalPages - 4)
        );
        const end = Math.min(totalPages, start + 4);

        const visiblePages = new Set([1, totalPages]);

        for (let page = start; page <= end; page++) {
            visiblePages.add(page);
        }

        const sortedPages = [...visiblePages].sort((a, b) => a - b);
        let previousPage = 0;

        sortedPages.forEach((page) => {
            if (page - previousPage > 1) {
                addEllipsis();
            }

            addPageButton(String(page), page, {
                active: page === currentPage
            });

            previousPage = page;
        });

        addPageButton(">", currentPage + 1, {
            disabled: currentPage === totalPages || filteredRecords.length === 0,
            ariaLabel: window.t("nextPage")
        });
    }

    function render() {
        tbody.replaceChildren();

        const startIndex = (currentPage - 1) * pageSize;
        const visibleRecords = filteredRecords.slice(
            startIndex,
            startIndex + pageSize
        );

        if (visibleRecords.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;
            cell.className = "text-center text-secondary py-4";
            cell.textContent = window.t("noRecords");

            row.appendChild(cell);
            tbody.appendChild(row);
        } else {
            visibleRecords.forEach((record) => {
                const row = document.createElement("tr");

                row.classList.add("object-table-row");
                row.tabIndex = 0;

                row.setAttribute(
                    "aria-label",
                    window.t("showOnMap", {
                        name: record.name || record.objectId
                    })
                );

                function selectRow() {
                    tbody.querySelectorAll("tr").forEach((otherRow) => {
                        otherRow.classList.remove("table-active");
                    });

                    row.classList.add("table-active");

                    void window.selectObjectOnMap(record);
                }

                row.addEventListener("click", selectRow);

                row.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectRow();
                    }
                });

                [
                    record.objectId,
                    record.name,
                    record.address
                ].forEach((value) => {
                    const cell = document.createElement("td");
                    cell.textContent = value ?? "";
                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });
        }

        const first = filteredRecords.length ? startIndex + 1 : 0;
        const last = Math.min(
            startIndex + pageSize,
            filteredRecords.length
        );

        summary.textContent = window.t("tableSummary", {
            first,
            last,
            count: filteredRecords.length
        });

        if (filteredRecords.length !== records.length) {
            summary.textContent += window.t("totalRecords", {
                total: records.length
            });
        }

// Export still contains all loaded records.
        exportButton.disabled = records.length === 0;

        renderPagination();
    }

    function csvCell(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet software from interpreting data as formulas.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
    }

    exportButton.onclick = () => {
        const rows = [
            [
                window.t("objectId"),
                window.t("objectName"),
                window.t("address")
            ],
            ...records.map((record) => [
                record.objectId,
                record.name,
                record.address
            ])
        ];

        const csv = rows
            .map((row) => row.map(csvCell).join(","))
            .join("\r\n");

        // UTF-8 BOM helps spreadsheet programs display Cyrillic correctly.
        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "objekti.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    function normalizeSearch(value) {
        return String(value ?? "")
            .normalize("NFKC")
            .toLocaleLowerCase("mk")
            .trim();
    }

    function applySearch() {
        const query = normalizeSearch(searchInput?.value);

        if (query.length < 3) {
            filteredRecords = records;
        } else {
            filteredRecords = records.filter((record) =>
                [
                    record.objectId,
                    record.name,
                    record.address
                ].some((value) =>
                    normalizeSearch(value).includes(query)
                )
            );
        }

        sortRecords();

        currentPage = 1;

        totalPages = Math.max(
            1,
            Math.ceil(filteredRecords.length / pageSize)
        );

        render();
    }

    // Search input handler.
    if (searchInput) {
        searchInput.oninput = applySearch;
    }

    // Rows-per-page dropdown handler.
    if (pageSizeSelect) {
        pageSizeSelect.onchange = () => {
            pageSize = Number(pageSizeSelect.value);

            currentPage = 1;

            totalPages = Math.max(
                1,
                Math.ceil(filteredRecords.length / pageSize)
            );

            render();
        };
    }

    // Remove the previous table's language-change listener.
    if (window.objectsTableLanguageHandler) {
        document.removeEventListener(
            "site-language-changed",
            window.objectsTableLanguageHandler
        );
    }

    // Refresh translated table text without resetting search or pagination.
    window.objectsTableLanguageHandler = () => {
        if (!tbody.isConnected) {
            return;
        }

        updateSortHeaders();
        render();
    };

    document.addEventListener(
        "site-language-changed",
        window.objectsTableLanguageHandler
    );

    // Sortable table headers.
    document
        .querySelectorAll(".objects-table th[data-sort-key]")
        .forEach((header) => {
            const button = header.querySelector(
                ".objects-sort-button"
            );

            if (!button) {
                return;
            }

            button.addEventListener("click", () => {
                const key = header.dataset.sortKey;

                if (sortKey === key) {
                    sortDirection =
                        sortDirection === "asc" ? "desc" : "asc";
                } else {
                    sortKey = key;
                    sortDirection = "asc";
                }

                sortRecords();

                currentPage = 1;

                totalPages = Math.max(
                    1,
                    Math.ceil(filteredRecords.length / pageSize)
                );

                updateSortHeaders();

                render();
            });
        });

    function updateSortHeaders() {
        document
            .querySelectorAll(".objects-table th[data-sort-key]")
            .forEach((header) => {
                const isCurrent = header.dataset.sortKey === sortKey;

                if (isCurrent) {
                    header.setAttribute(
                        "aria-sort",
                        sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                    );
                } else {
                    header.removeAttribute("aria-sort");
                }
            });
    }

    updateSortHeaders();

    // Initial table display.
    applySearch();
};