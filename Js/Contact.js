let contactView = null;
let initializationId = 0;

window.destroyContactPage = function () {
    initializationId++;

    if (contactView) {
        if (window.objectsMapView === contactView) {
            window.objectsMapView = null;
        }

        contactView.destroy();
        contactView = null;
    }
};

window.initContactPage = async function () {
    window.destroyContactPage();

    const thisInitialization = initializationId;
    const container = document.getElementById("contact-map");
    const form = document.getElementById("contact-form");

    if (!container || !form) {
        return;
    }

    try {
        const [ArcGISMap, MapView, Graphic] = await $arcgis.import([
            "@arcgis/core/Map.js",
            "@arcgis/core/views/MapView.js",
            "@arcgis/core/Graphic.js"
        ]);


        const longitude = 21.424359106722342;
        const latitude = 41.995979788148965;

        const map = new ArcGISMap({
            basemap: "streets-3d",
        });

        contactView = new MapView({
            container,
            map,
            center: [longitude, latitude],
            zoom: 16
        });

        const marker = new Graphic({
            geometry: {
                type: "point",
                longitude,
                latitude
            },
            symbol: {
                type: "simple-marker",
                color: "#f28c28",
                size: 14,
                outline: {
                    color: "#ffffff",
                    width: 2
                }
            }
        });

        contactView.graphics.add(marker);

        await contactView.when();
    } catch (error) {
        if (
            thisInitialization !== initializationId ||
            !container.isConnected
        ) {
            return;
        }

        console.error("Contact map failed to load:", error);

        container.textContent =
            "Мапата не може да се вчита. Проверете ја конзолата.";
    }
};