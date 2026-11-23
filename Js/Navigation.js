const navigationSidebar = document.getElementById("navigationSidebar");
const mainContent = document.getElementById("main-content");

const pages = {
    Map: "Pages/Map.html",
    Video: "Pages/Video.html",
    Gallery: "Pages/Gallery.html",
    Contact: "Pages/Contact.html"
};

// Close the sidebar after selecting a page.
navigationSidebar?.addEventListener("click", (event) => {
    if (event.target.closest(".nav-link")) {
        bootstrap.Offcanvas
            .getOrCreateInstance(navigationSidebar)
            .hide();
    }
});

let currentRequest;
let mapModulePromise;

// Load Map.js only when needed.
async function ensureMapModuleLoaded() {
    if (typeof window.initMapPage === "function") return;

    mapModulePromise ??= import("./Map.js").catch(error => {
        mapModulePromise = null;
        throw error;
    });

    await mapModulePromise;

    if (typeof window.initMapPage !== "function") {
        throw new Error("Map.js did not expose window.initMapPage.");
    }
}

// Load the selected page.
async function loadPage() {
    currentRequest?.abort();

    const controller = new AbortController();
    currentRequest = controller;

    const isCurrent = () => currentRequest === controller;
    const pageName = window.location.hash.slice(1) || "Map";
    const file = pages[pageName];

    mainContent.setAttribute("aria-busy", "true");

    if (!file) {
        mainContent.innerHTML = "<h1>Страницата не е пронајдена.</h1>";
        mainContent.removeAttribute("aria-busy");
        return;
    }

    try {
        const response = await fetch(file, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.status}`);
        }

        const html = await response.text();

        if (!isCurrent()) return;

        // Clean up the previous page.
        window.destroyContactPage?.();
        window.destroyMapPage?.();

        mainContent.innerHTML = html;
        window.applyTranslations?.(mainContent);

        // Initialize the main map.
        if (document.getElementById("map-view")) {
            await ensureMapModuleLoaded();

            if (isCurrent()) {
                await window.initMapPage();
            }
        }

        // Load table data.
        if (document.getElementById("objects-table-body")) {
            window.loadObjectsTableData?.();
        }

        // Initialize the contact map.
        if (document.getElementById("contact-map")) {
            if (document.readyState !== "complete") {
                await new Promise(resolve => {
                    window.addEventListener("load", resolve, { once: true });
                });
            }

            if (isCurrent()) {
                await window.initContactPage();
            }
        }

    } catch (error) {
        if (error.name === "AbortError" || !isCurrent()) return;

        console.error(error);

        mainContent.innerHTML = `
            <p class="text-danger">
                Грешка при вчитување на страницата. Обидете се повторно.
            </p>
        `;
    } finally {
        if (isCurrent()) {
            mainContent.removeAttribute("aria-busy");
        }
    }
}

window.addEventListener("hashchange", loadPage);
loadPage();