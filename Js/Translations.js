(() => {
    const translations = {
        MK: {
            navigation: "Навигација",
            home: "Почетна",
            video: "Видео",
            gallery: "Галерија",
            contact: "Контакт",
            contactUs: "Контактирајте нè",
            openNavigation: "Отвори навигација",
            closeNavigation: "Затвори навигација",
            chooseLanguage: "Избери јазик",

            name: "Име",
            email: "Е-пошта",
            subject: "Тема",
            message: "Порака",
            send: "Прати",

            yourName: "Вашето име",
            yourEmail: "Вашата е-пошта",
            yourSubject: "Вашата тема",
            yourMessage: "Вашата порака",

            objectId: "OBJECT ID",
            objectName: "ИМЕ",
            address: "АДРЕСА",
            search: "Пребарај",
            searchHelp: "Внесете најмалку 3 знаци за пребарување.",
            rowsPerPage: "Редови по страница:",
            export: "Експортирај",

            noRecords: "Нема податоци за прикажување.",
            resultsFound: "Пронајдени {count} записи.",
            tableSummary: "Прикажани {first}–{last} од {count} записи",
            totalRecords: " (вкупно {total})",
            previousPage: "Претходна страница",
            nextPage: "Следна страница",
            pageNumber: "Страница {page}",
            showOnMap: "Прикажи на мапа: {name}",

            pageNotFound: "Страницата не е пронајдена.",
            pageLoadError:
                "Грешка при вчитување на страницата. Обидете се повторно."
        },

        EN: {
            navigation: "Navigation",
            home: "Home",
            video: "Video",
            gallery: "Gallery",
            contact: "Contact",
            contactUs: "Contact us",
            openNavigation: "Open navigation",
            closeNavigation: "Close navigation",
            chooseLanguage: "Choose language",

            name: "Name",
            email: "Email",
            subject: "Subject",
            message: "Message",
            send: "Send",

            yourName: "Your name",
            yourEmail: "Your email",
            yourSubject: "Your subject",
            yourMessage: "Your message",

            objectId: "OBJECT ID",
            objectName: "NAME",
            address: "ADDRESS",
            search: "Search",
            searchHelp: "Enter at least 3 characters to search.",
            rowsPerPage: "Rows per page:",
            export: "Export",

            noRecords: "No records to display.",
            resultsFound: "{count} records found.",
            tableSummary: "Showing {first}–{last} of {count} records",
            totalRecords: " ({total} total)",
            previousPage: "Previous page",
            nextPage: "Next page",
            pageNumber: "Page {page}",
            showOnMap: "Show on map: {name}",

            pageNotFound: "Page not found.",
            pageLoadError:
                "Failed to load the page. Please try again."
        },

        SQ: {
            navigation: "Navigimi",
            home: "Ballina",
            video: "Video",
            gallery: "Galeria",
            contact: "Kontakt",
            contactUs: "Na kontaktoni",
            openNavigation: "Hap navigimin",
            closeNavigation: "Mbyll navigimin",
            chooseLanguage: "Zgjidh gjuhën",

            name: "Emri",
            email: "Email",
            subject: "Tema",
            message: "Mesazhi",
            send: "Dërgo",

            yourName: "Emri juaj",
            yourEmail: "Email-i juaj",
            yourSubject: "Tema juaj",
            yourMessage: "Mesazhi juaj",

            objectId: "OBJECT ID",
            objectName: "EMRI",
            address: "ADRESA",
            search: "Kërko",
            searchHelp: "Shkruani të paktën 3 karaktere për të kërkuar.",
            rowsPerPage: "Rreshta për faqe:",
            export: "Eksporto",

            noRecords: "Nuk ka të dhëna për t’u shfaqur.",
            resultsFound: "U gjetën {count} regjistrime.",
            tableSummary: "Duke shfaqur {first}–{last} nga {count} regjistrime",
            totalRecords: " ({total} gjithsej)",
            previousPage: "Faqja e mëparshme",
            nextPage: "Faqja tjetër",
            pageNumber: "Faqja {page}",
            showOnMap: "Shfaq në hartë: {name}",

            pageNotFound: "Faqja nuk u gjet.",
            pageLoadError:
                "Gabim gjatë ngarkimit të faqes. Provoni përsëri."
        }
    };

    const languageSettings = {
        MK: {
            htmlLang: "mk",
            flag: "Images/Flags/Mk.webp"
        },
        EN: {
            htmlLang: "en",
            flag: "Images/Flags/Uk.webp"
        },
        SQ: {
            htmlLang: "sq",
            flag: "Images/Flags/Al.webp"
        }
    };

    let savedLanguage = "MK";

    try {
        savedLanguage = localStorage.getItem("site-language") || "MK";
    } catch {
        // The language switch still works if storage is unavailable.
    }

    let currentLanguage = Object.hasOwn(translations, savedLanguage)
        ? savedLanguage
        : "MK";

    window.t = function (key, values = {}) {
        const template =
            translations[currentLanguage][key] ??
            translations.MK[key] ??
            key;

        return template.replace(/\{(\w+)\}/g, (match, name) =>
            Object.hasOwn(values, name)
                ? String(values[name])
                : match
        );
    };

    window.applyTranslations = function (root = document) {
        root.querySelectorAll("[data-i18n]").forEach((element) => {
            element.textContent = window.t(element.dataset.i18n);
        });

        root.querySelectorAll("[data-i18n-placeholder]").forEach(
            (element) => {
                element.setAttribute(
                    "placeholder",
                    window.t(element.dataset.i18nPlaceholder)
                );
            }
        );

        root.querySelectorAll("[data-i18n-aria]").forEach((element) => {
            element.setAttribute(
                "aria-label",
                window.t(element.dataset.i18nAria)
            );
        });
    };

    window.setSiteLanguage = function (language) {
        if (!Object.hasOwn(translations, language)) {
            return;
        }

        currentLanguage = language;

        try {
            localStorage.setItem("site-language", language);
        } catch {
            // Ignore storage restrictions.
        }

        document.documentElement.lang =
            languageSettings[language].htmlLang;

        const flag = document.getElementById(
            "selected-language-flag"
        );

        const label = document.getElementById(
            "selected-language-label"
        );

        if (flag) {
            flag.src = languageSettings[language].flag;
        }

        if (label) {
            label.textContent = language;
        }

        window.applyTranslations();

        document.dispatchEvent(
            new CustomEvent("site-language-changed", {
                detail: { language }
            })
        );
    };

    // Uses the data-language attributes already present in your HTML.
    document.querySelectorAll("[data-language]").forEach((button) => {
        button.addEventListener("click", () => {
            window.setSiteLanguage(button.dataset.language);
        });
    });

    window.setSiteLanguage(currentLanguage);
})();