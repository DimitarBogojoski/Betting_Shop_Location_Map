
(function () {
    const initialDpr = window.devicePixelRatio || 1;

    const fixedElements = [
        {
            selector: "#site-header",
            container: ".zoom-fixed-header-shell"
        },
        {
            selector: "#site-footer",
            container: ".zoom-fixed-footer-shell"
        },
        {
            selector: "#contact-page",
            container: ".zoom-fixed-contact-shell"
        },
        {
            selector: "#map-content",
            container: ".zoom-fixed-map-shell"
        },
        {
            selector: "#gallery-page",
            container: ".zoom-fixed-gallery-shell"
        }
    ];

    let animationFrame = null;

    const clamp = (value, min, max) =>
        Math.min(Math.max(value, min), max);

    // CONTACT RESPONSIVE LAYOUT
    function updateContactLayout(element, referenceWidth) {
        const mobile = referenceWidth <= 575.98;
        const tablet = referenceWidth > 575.98 &&
            referenceWidth <= 991.98;

        const padding = mobile
            ? 15
            : clamp(referenceWidth * 0.025, 16, 35);

        const mapHeight = mobile
            ? 280
            : tablet
                ? clamp(referenceWidth * 0.45, 260, 380)
                : clamp(referenceWidth * 0.32, 260, 430);

        const detailsFont = mobile
            ? 15
            : clamp(referenceWidth * 0.012, 14, 17);

        element.style.setProperty("--contact-padding-top", `${padding}px`);

        element.style.setProperty(
            "--contact-padding-bottom",
            `${mobile ? 25 : padding}px`
        );

        element.style.setProperty(
            "--contact-title-size",
            `${clamp(referenceWidth * 0.025, 24, 36)}px`
        );

        element.style.setProperty(
            "--contact-map-height",
            `${mapHeight}px`
        );

        element.style.setProperty(
            "--contact-details-font",
            `${detailsFont}px`
        );

        element.style.setProperty(
            "--contact-container-width",
            mobile ? "92%" : tablet ? "94%" : "95%"
        );
    }

    // GALLERY RESPONSIVE LAYOUT
    function updateGalleryLayout(element, referenceWidth) {
        const mobile = referenceWidth <= 575.98;
        const tablet = referenceWidth > 575.98 &&
            referenceWidth <= 992;

        let carouselWidth;
        let carouselHeight;
        let radius;
        let controlSize;

        if (mobile) {
            carouselWidth = "100%";
            carouselHeight = clamp(referenceWidth * 0.65, 200, 350);
            radius = 10;
            controlSize = 32;
        } else if (tablet) {
            carouselWidth = "96%";
            carouselHeight = clamp(referenceWidth * 0.60, 220, 500);
            radius = 16;
            controlSize = 42;
        } else {
            carouselWidth = "70%";
            carouselHeight = clamp(referenceWidth * 0.55, 200, 650);
            radius = 16;
            controlSize = 42;
        }

        element.style.setProperty(
            "--gallery-carousel-width",
            carouselWidth
        );

        element.style.setProperty(
            "--gallery-carousel-height",
            `${carouselHeight}px`
        );

        element.style.setProperty(
            "--gallery-carousel-radius",
            `${radius}px`
        );

        element.style.setProperty(
            "--gallery-control-size",
            `${controlSize}px`
        );
    }

    // UPDATE ALL FIXED ELEMENTS
    function updateZoomCompensation() {
        const currentDpr = window.devicePixelRatio || initialDpr;

        const zoomFactor = currentDpr / initialDpr;
        const compensation = 1 / zoomFactor;

        const referenceWidth = window.innerWidth * zoomFactor;

        const mobile = referenceWidth <= 575.98;
        const tablet = referenceWidth > 575.98 &&
            referenceWidth <= 991.98;

        document.body.classList.toggle("zoom-layout-mobile", mobile);
        document.body.classList.toggle("zoom-layout-tablet", tablet);

        document.body.classList.toggle(
            "zoom-layout-desktop",
            referenceWidth > 575.98
        );

        fixedElements.forEach(({ selector, container: containerSelector }) => {
            const element = document.querySelector(selector);
            const container = document.querySelector(containerSelector);

            if (!element || !container) return;

            // Update Contact layout
            if (selector === "#contact-page") {
                updateContactLayout(element, referenceWidth);
            }

            // Update Gallery layout
            if (selector === "#gallery-page") {
                updateGalleryLayout(element, referenceWidth);
            }

            // Compensate for browser zoom
            element.style.width = `${zoomFactor * 100}%`;

            const originalHeight = element.offsetHeight;

            element.style.transform = `scale(${compensation})`;

            // Preserve the correct space in the document layout
            container.style.height =
                `${originalHeight * compensation}px`;
        });
    }

    // SCHEDULE UPDATE
    function scheduleUpdate() {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
        }

        animationFrame = requestAnimationFrame(() => {
            animationFrame = null;
            updateZoomCompensation();
        });
    }

    // Browser zoom and window resizing
    window.addEventListener("resize", scheduleUpdate);

    window.visualViewport?.addEventListener(
        "resize",
        scheduleUpdate
    );

    // Detect dynamically loaded pages
    const mainContent = document.getElementById("main-content");

    if (mainContent) {
        const pageObserver = new MutationObserver(scheduleUpdate);

        pageObserver.observe(mainContent, {
            childList: true
        });
    }

    // Recalculate after language changes
    document.addEventListener(
        "site-language-changed",
        scheduleUpdate
    );

    // Recalculate after fonts load
    document.fonts?.ready?.then(scheduleUpdate);

    // Initial setup
    scheduleUpdate();
})();
