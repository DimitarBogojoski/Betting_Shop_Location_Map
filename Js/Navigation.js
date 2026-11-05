const navigationSidebar = document.getElementById("navigationSidebar");
//Returning sidebar
navigationSidebar.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        bootstrap.Offcanvas
            .getOrCreateInstance(navigationSidebar)
            .hide();
    });
});

//Update lang
const selectedLanguageFlag = document.getElementById(
    "selected-language-flag"
);

const selectedLanguageLabel = document.getElementById(
    "selected-language-label"
);

document.querySelectorAll(".language-option").forEach((button) => {
    button.addEventListener("click", () => {
        const language = button.dataset.language;

        selectedLanguageFlag.src = button.dataset.flag;
        selectedLanguageLabel.textContent = language;

        // Add actual page-translation logic here later.
    });
});

//Changes the page
const mainContent = document.getElementById("main-content");

const pages = {
    Map: "Pages/Map.html",
    Video: "Pages/Video.html",
    Gallery: "Pages/Gallery.html",
    Contact: "Pages/Contact.html"
};

let currentRequest;

async function loadPage() {
    const pageName = window.location.hash.slice(1) || "Map";
    const file = pages[pageName];

    currentRequest?.abort();

    if (!file) {
        mainContent.innerHTML = "<h1>Страницата не е пронајдена.</h1>";
        return;
    }

    currentRequest = new AbortController();
    mainContent.setAttribute("aria-busy", "true");

    try {
        const response = await fetch(file, {
            signal: currentRequest.signal
        });

        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.status}`);
        }

        const html = await response.text();

        // Destroy previously initialized maps.
        window.destroyContactPage?.();
        window.destroyMapPage?.();

        mainContent.innerHTML = html;

// Initialize the main map.
        if (document.getElementById("map-view")) {
            await window.initMapPage();
        }

// Initialize the contact map.
        if (document.getElementById("contact-map")) {

            if (document.readyState !== "complete") {
                await new Promise((resolve) => {
                    window.addEventListener("load", resolve, {
                        once: true
                    });
                });
            }

            if (document.getElementById("contact-map")) {
                await window.initContactPage();
            }
        }
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        console.error(error);

        mainContent.innerHTML = `
            <p class="text-danger">
                Грешка при вчитување на страницата. Обидете се повторно.
            </p>
        `;
    } finally {
        if (!currentRequest.signal.aborted) {
            mainContent.removeAttribute("aria-busy");
        }
    }
}

window.addEventListener("hashchange", loadPage);

loadPage();