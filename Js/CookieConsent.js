
(function () {
    const STORAGE_KEY = "gdi_cookie_consent_v8";

    let consent = null;

    const banner = document.getElementById("cookie-consent");
    const actions = document.getElementById("cookie-actions");
    const preferences = document.getElementById("cookie-preferences");
    const analyticsCheckbox = document.getElementById("cookie-analytics");

    const translations = {
        "cookie-title": "cookieTitle",
        "cookie-description": "cookieDescription",
        "cookie-settings-title": "cookieSettingsTitle",
        "cookie-necessary-title": "cookieNecessaryTitle",
        "cookie-necessary-description": "cookieNecessaryDescription",
        "cookie-always-active": "cookieAlwaysActive",
        "cookie-analytics-title": "cookieAnalyticsTitle",
        "cookie-analytics-description": "cookieAnalyticsDescription",
        "cookie-accept": "cookieAccept",
        "cookie-reject": "cookieReject",
        "cookie-customize": "cookieCustomize",
        "cookie-save": "cookieSave",
        "cookie-back": "cookieBack"
    };

    function translatePopup() {
        Object.entries(translations).forEach(([id, key]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = window.t(key);
        });
    }

    function readConsent() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            return saved?.version === 1 &&
            typeof saved.categories?.analytics === "boolean"
                ? saved
                : null;
        } catch (error) {
            console.warn("Could not read cookie preferences:", error);
            return null;
        }
    }

    function openPopup(showPreferences = false) {
        banner.hidden = false;
        actions.hidden = showPreferences;
        preferences.hidden = !showPreferences;

        analyticsCheckbox.checked = Boolean(
            consent?.categories?.analytics
        );
    }

    function closePopup() {
        banner.hidden = true;
    }

    function saveConsent(analytics) {
        consent = {
            version: 1,
            updatedAt: new Date().toISOString(),
            categories: {
                necessary: true,
                analytics: Boolean(analytics)
            }
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch (error) {
            console.error("Could not save cookie preferences:", error);
        }

        window.dispatchEvent(new CustomEvent("cookie-consent-updated", {
            detail: consent
        }));

        closePopup();
    }

    function initialize() {
        translatePopup();

        consent = readConsent();

        if (consent) {
            closePopup();
        } else {
            openPopup();
        }

        document.getElementById("cookie-accept")
            .addEventListener("click", () => saveConsent(true));

        document.getElementById("cookie-reject")
            .addEventListener("click", () => saveConsent(false));

        document.getElementById("cookie-customize")
            .addEventListener("click", () => openPopup(true));

        document.getElementById("cookie-save")
            .addEventListener("click", () => {
                saveConsent(analyticsCheckbox.checked);
            });

        document.getElementById("cookie-back")
            .addEventListener("click", () => openPopup());

        document.addEventListener("site-language-changed", translatePopup);

        window.GDICookieConsent = {
            get: () => readConsent(),

            hasConsent: category =>
                category === "necessary" ||
                Boolean(readConsent()?.categories?.[category])
        };

        window.dispatchEvent(new CustomEvent("cookie-consent-updated", {
            detail: consent
        }));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
