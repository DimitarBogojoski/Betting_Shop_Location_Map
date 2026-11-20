/* ====================================
   GDI COOKIE CONSENT
==================================== */

(function () {

    const STORAGE_KEY = "gdi_cookie_consent_v1";

    const CONSENT_REQUEST_INTERVAL = 20 * 60 * 1000;

    let consentRequestTimer = null;

    let consent = null;

    function translatePopup() {
        const elements = {
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
            "cookie-back": "cookieBack",
            "cookie-settings-shortcut": "cookieSettingsShortcut"
        };

        Object.entries(elements).forEach(([id, key]) => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = window.t(key);
            }
        });
    }

    function readConsent() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) return null;

            const parsed = JSON.parse(saved);

            if (
                parsed.version !== 1 ||
                typeof parsed.categories?.analytics !== "boolean"
            ) {
                return null;
            }

            return parsed;

        } catch (error) {

            console.warn("Could not read cookie preferences:", error);

            return null;

        }

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

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(consent)
            );

        } catch (error) {

            console.error("Could not save cookie preferences:", error);

        }

        // Notify other scripts about the user's choice.
        window.dispatchEvent(
            new CustomEvent("cookie-consent-updated", {
                detail: consent
            })
        );

        closePopup();

    }

    const banner = document.getElementById("cookie-consent");
    const actions = document.getElementById("cookie-actions");
    const preferences = document.getElementById("cookie-preferences");

    const analyticsCheckbox = document.getElementById("cookie-analytics");

    const settingsShortcut = document.getElementById(
        "cookie-settings-shortcut"
    );

    function openPopup(showPreferences = false) {

        banner.hidden = false;
        settingsShortcut.hidden = true;

        actions.hidden = showPreferences;
        preferences.hidden = !showPreferences;

        if (consent) {
            analyticsCheckbox.checked =
                consent.categories.analytics;
        } else {
            analyticsCheckbox.checked = false;
        }

    }

    function closePopup() {

        banner.hidden = true;
        settingsShortcut.hidden = true;

    }

    function initialize() {

        translatePopup();

        consent = readConsent();

        if (consent) {

            closePopup();

        } else {

            openPopup();

        }

        // Accept all cookies.
        document.getElementById("cookie-accept")
            .addEventListener("click", () => {
                saveConsent(true);
            });

        // Reject all optional cookies.
        document.getElementById("cookie-reject")
            .addEventListener("click", () => {
                saveConsent(false);
            });

        // Open custom settings.
        document.getElementById("cookie-customize")
            .addEventListener("click", () => {
                openPopup(true);
            });

        // Save custom preferences.
        document.getElementById("cookie-save")
            .addEventListener("click", () => {
                saveConsent(analyticsCheckbox.checked);
            });

        // Return to the main popup.
        document.getElementById("cookie-back")
            .addEventListener("click", () => {
                openPopup(false);
            });

        // Reopen settings after a previous decision.
        settingsShortcut.addEventListener("click", () => {
            openPopup(true);
        });

        // Support language changes.
        document.addEventListener(
            "site-language-changed",
            translatePopup
        );

        // Make the consent API available to other scripts.
        window.GDICookieConsent = {

            get() {
                return readConsent();
            },

            hasConsent(category) {

                if (category === "necessary") {
                    return true;
                }

                return Boolean(
                    readConsent()?.categories?.[category]
                );

            }

        };

        // Notify integrations about an existing saved choice.
        window.dispatchEvent(
            new CustomEvent("cookie-consent-updated", {
                detail: consent
            })
        );

    }


    consentRequestTimer = setInterval(() => {

        // Only reopen if the visitor has already made a choice.
        if (consent && banner.hidden) {

            console.log("Requesting cookie consent again.");

            openPopup(false);
        }

    }, CONSENT_REQUEST_INTERVAL);

    if (document.readyState === "loading") {

        document.addEventListener("DOMContentLoaded", initialize);

    } else {

        initialize();

    }

})();