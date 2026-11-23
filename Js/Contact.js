let contactView = null;
let initializationId = 0;

window.destroyContactPage = function () {
    initializationId++;

    if (contactView) {
        contactView.destroy();
        contactView = null;
    }
};

window.initContactPage = async function () {
    window.destroyContactPage();

    const currentId = initializationId;
    const container = document.getElementById("contact-map");

    if (!container) return;

    try {
        const [ArcGISMap, MapView, Graphic] = await $arcgis.import([
            "@arcgis/core/Map.js",
            "@arcgis/core/views/MapView.js",
            "@arcgis/core/Graphic.js"
        ]);

        if (currentId !== initializationId || !container.isConnected) {
            return;
        }

        const longitude = 21.424359106722342;
        const latitude = 41.995979788148965;

        const map = new ArcGISMap({
            basemap: "streets-3d"
        });

        const view = new MapView({
            container,
            map,
            center: [longitude, latitude],
            zoom: 16
        });

        contactView = view;

        view.graphics.add(new Graphic({
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
        }));

        await view.when();

        if (currentId !== initializationId || !container.isConnected) {
            view.destroy();

            if (contactView === view) {
                contactView = null;
            }
        }

    } catch (error) {
        if (currentId !== initializationId || !container.isConnected) {
            return;
        }

        console.error("Contact map initialization failed:", error);
    }
};