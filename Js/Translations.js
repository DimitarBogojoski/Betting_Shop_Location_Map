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
            addressW: "Адреса",
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
                "Грешка при вчитување на страницата. Обидете се повторно.",

            searchW: "Пребарување",
            layers: "Слоеви",
            basemaps: "Основни карти",
            distance: "Мерење растојание",
            area: "Мерење површина",
            bookmarks: "Обележувачи",
            homeW: "Почетен приказ",
            legend: "Легенда",
            sketch: "Цртање",
            coordinates: "Конверзија на координати",
            compass: "Ресетирај ја ориентацијата на картата",
            print: "Печатење карта",
            elevation: "Висински профил",
            locate: "Најди ја мојата локација",
            scale: "Размер",
            closeTool: "Затвори: {tool}",

            bettingShops: "Кладилници во радиус од 400м",
            drawings: "Мои цртежи",
            city: "Град",

            mapError:
                "Мапата не може да се вчита. Проверете ја конзолата.",
            sortAscending: "Подреди растечки",
            sortDescending: "Подреди опаѓачки",
            zoomIn:"Зумирај",
            zoomOut:"Одзумирај",

            searchPlaceholder: "Пребарајте адреса или место",

            distanceNewMeasurement: "Ново мерење",
            distanceInstruction: "Започнете со мерење со кликнување на картата за да ја поставите првата точка.",
            distanceUnits: "Единици",
            distanceMetric: "Метрички",
            distanceResult: "Растојание",

            distanceUnitMetric: "Метрички",
            distanceUnitImperial: "Империјални",
            distanceUnitInches: "Инчи",
            distanceUnitFeet: "Стапки",
            distanceUnitYards: "Јарди",
            distanceUnitMiles: "Мили",
            distanceUnitNauticalMiles: "Наутички милји",
            distanceUnitUSFeet: "Стапки (САД)",
            distanceUnitMillimeters: "Милиметри",
            distanceUnitCentimeters: "Сантиметри",
            distanceUnitDecimeters: "Дециметри",
            distanceUnitKilometers: "Километри",

            areaResult: "Површина",
            perimeterResult: "Периметар",
            areaUnitSquareInches: "Квадратни инчи",
            areaUnitSquareFeet: "Квадратни стапки",
            areaUnitSquareYards: "Квадратни јарди",
            areaUnitSquareMiles: "Квадратни милји",
            areaUnitSquareNauticalMiles: "Квадратни наутички милји",
            areaUnitSquareUSFeet: "Квадратни стапки (САД)",
            areaUnitSquareMillimeters: "Квадратни милиметри",
            areaUnitSquareCentimeters: "Квадратни сантиметри",
            areaUnitSquareDecimeters: "Квадратни дециметри",
            areaUnitSquareMeters: "Квадратни метри",
            areaUnitSquareKilometers: "Квадратни километри",
            areaUnitAcres: "Акри",
            areaUnitAres: "Ари",
            areaUnitHectares: "Хектари",
            bookmarksNoBookmarks: "Нема обележувачи",
            bookmarksEmptyDescription: "Додајте обележувачи на картата и тие ќе се појават тука.",
            bookmarkAdd: "Додај обележувач",
            bookmarkDialogHeading: "Додај обележувач",
            bookmarkTitleLabel: "Наслов",
            bookmarkTitlePlaceholder: "Внесете наслов",
            bookmarkCancel: "Откажи",
            bookmarkSubmit: "Додај",
            bookmarkEditHeading: "Уреди",
            bookmarkThumbnail: "Сликичка",
            bookmarkScreenshot: "Снимка од екранот",
            bookmarkURL: "Веб-адреса",
            bookmarkNone: "Нема",
            bookmarkUpdate: "Ажурирај",
            bookmarkDelete: "Избриши",
            bookmarkSave: "Зачувај",
            elevationPrompt: "Нацртајте линија за да креирате профил на надморска височина.",
            elevationGround: "Терен",
            elevationLength: "Должина",
            elevationGain: "Покачување",
            elevationLoss: "Спуштање",
            elevationMin: "Минимум",
            elevationMax: "Максимум",
            elevationAvg: "Просек",
            elevationMaxSlope: "Максимален наклон",
            elevationAvgSlope: "Просечен наклон",
            elevationNewProfile: "Нов профил",
            elevationDone: "Готово",
            elevationDistanceUnits: "Единици за растојание",
            elevationUnits: "Единици за надморска височина",
            elevationUniformChartScaling: "Рамномерно скалирање на графиконот",
            elevationUnitDecimeter: "Дециметар",
            elevationUnitMeters: "Метри",
            sketchSelectFeature: "Избери објект",
            sketchDrawPoint: "Нацртај точка",
            sketchDrawPolyline: "Нацртај линија",
            sketchDrawPolygon: "Нацртај полигон",
            sketchDrawRectangle: "Нацртај правоаголник или квадрат",
            sketchDrawCircle: "Нацртај круг или елипса",
            sketchUndo: "Врати",
            sketchRedo: "Повтори",
            sketchSettings: "Поставки",
            sketchEnableTooltips: "Овозможи совети",
            sketchEnableSnapping: "Овозможи прилепување",
            sketchGeometryGuides: "Геометриски водилки",
            sketchFeatureToFeature: "Објект кон објект",
            sketchGrid: "Мрежа",
            sketchSnappingLayers: "Слоеви за прилепување",
            sketchGridOptions: "Опции за мрежа",
            coordinateAddConversion: "Додај конверзија",
            coordinateInputCoordinate: "Внеси координата",
            coordinateCaptureMode: "Режим на прибирање",
            coordinateFormatSettings: "Поставки за формат",
            coordinateChangeDisplay: "Промени го приказот на координатите",
            coordinatePreview: "Преглед",
            coordinateGoToLocation: "Оди до локацијата",
            coordinateConvert: "Конвертирај",
            printExportHeading: "Извоз",
            printLayout: "Распоред",
            printMapOnly: "Само карта",
            printExports: "Извезени датотеки",
            printTitle: "Наслов",
            printTitlePlaceholder: "Наслов на датотеката",
            printTemplate: "Шаблон",
            printLetterLandscape: "Letter ANSI A – хоризонтално",
            printLetterLandscapeSize: "11 × 8,5 инчи",
            printChooseTemplate: "Избери шаблон",
            printA3Landscape: "A3 – хоризонтално",
            printA3LandscapeSize: "42 × 29,7 сантиметри",
            printA3Portrait: "A3 – вертикално",
            printA3PortraitSize: "29,7 × 42 сантиметри",
            printA4Landscape: "A4 – хоризонтално",
            printA4LandscapeSize: "29,7 × 21 сантиметри",
            printA4Portrait: "A4 – вертикално",
            printA4PortraitSize: "21 × 29,7 сантиметри",
            printLetterPortrait: "Letter ANSI A – вертикално",
            printLetterPortraitSize: "8,5 × 11 инчи",
            printTabloidLandscape: "Tabloid ANSI B – хоризонтално",
            printTabloidLandscapeSize: "17 × 11 инчи",
            printTabloidPortrait: "Tabloid ANSI B – вертикално",
            printTabloidPortraitSize: "11 × 17 инчи",
            printDone: "Готово",
            printShowPrintArea: "Прикажи ја областа за печатење",
            printFileFormat: "Формат на датотека",
            printAdvancedOptions: "Напредни опции",
            printSetScale: "Постави размер",
            printCopyright: "Авторски права",
            printOutputSpatialReference: "Излезен просторен референтен систем",
            printIncludeLegend: "Вклучи легенда",
            printDynamicLegend: "Динамичка легенда",
            printIncludeNorthArrow: "Вклучи стрелка за север",
            printIncludeScaleBar: "Вклучи размерна линија",
            printMilesKilometers: "Милји и километри",
            printFeetMeters: "Стапки и метри",
            printExportButton: "Извези",
            printExportButtonAria: "Извези. Извезените датотеки ќе се појават подолу.",
            printAuthor: "Автор",
            printScaleBarUnit: "Единица на размерната линија",
            printFileName: "Име на датотеката",
            printFileNamePlaceholder: "Име на датотеката",
            printWidth: "Ширина",
            printHeight: "Висина",
            printNoExportedFiles: "Нема извезени датотеки",
            printExportedFilesDescription: "Кога ќе извезете датотека, таа ќе се прикаже тука. Извезените датотеки се чуваат само краток период. Преземете ја извезената датотека за да имате пристап до неа и понатаму.",
            contactPhone: "Телефон:",
            contactEmail: "Е-пошта:",
            contactLocation: "Локација:",
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
            addressW: "Address",
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
                "Failed to load the page. Please try again.",

            searchW: "Search",
            layers: "Layers",
            basemaps: "Basemap gallery",
            distance: "Measure distance",
            area: "Measure area",
            bookmarks: "Bookmarks",
            homeW: "Initial View",
            legend: "Legend",
            sketch: "Sketch",
            coordinates: "Coordinate conversion",
            compass: "Reset map orientation",
            print: "Print map",
            elevation: "Elevation profile",
            locate: "Find my location",
            scale: "Scale bar",
            closeTool: "Close: {tool}",

            bettingShops: "Betting shops within a 400m radius",
            drawings: "My drawings",
            city: "City",

            mapError:
                "The map could not be loaded. Check the console.",
            sortAscending: "Sort ascending",
            sortDescending: "Sort descending",
            zoomIn:"Zoom in",
            zoomOut:"Zoom out",

            searchPlaceholder: "Find address or place",

            distanceNewMeasurement: "New measurement",
            distanceInstruction: "Start measuring by clicking on the map to place your first point.",
            distanceUnits: "Units",
            distanceMetric: "Metric",
            distanceResult: "Distance",

            distanceUnitMetric: "Metric",
            distanceUnitImperial: "Imperial",
            distanceUnitInches: "Inches",
            distanceUnitFeet: "Feet",
            distanceUnitYards: "Yards",
            distanceUnitMiles: "Miles",
            distanceUnitNauticalMiles: "Nautical miles",
            distanceUnitUSFeet: "Feet (US)",
            distanceUnitMillimeters: "Millimeters",
            distanceUnitCentimeters: "Centimeters",
            distanceUnitDecimeters: "Decimeters",
            distanceUnitKilometers: "Kilometers",
            areaResult: "Area",
            perimeterResult: "Perimeter",
            areaUnitSquareInches: "Square inches",
            areaUnitSquareFeet: "Square feet",
            areaUnitSquareYards: "Square yards",
            areaUnitSquareMiles: "Square miles",
            areaUnitSquareNauticalMiles: "Square nautical miles",
            areaUnitSquareUSFeet: "Square feet (US)",
            areaUnitSquareMillimeters: "Square millimeters",
            areaUnitSquareCentimeters: "Square centimeters",
            areaUnitSquareDecimeters: "Square decimeters",
            areaUnitSquareMeters: "Square meters",
            areaUnitSquareKilometers: "Square kilometers",
            areaUnitAcres: "Acres",
            areaUnitAres: "Ares",
            areaUnitHectares: "Hectares",

            bookmarksNoBookmarks: "No bookmarks",
            bookmarksEmptyDescription: "Add bookmarks to your map and they will appear here.",
            bookmarkAdd: "Add bookmark",
            bookmarkDialogHeading: "Add bookmark",
            bookmarkTitleLabel: "Title",
            bookmarkTitlePlaceholder: "Enter a title",
            bookmarkCancel: "Cancel",
            bookmarkSubmit: "Add",
            bookmarkEditHeading: "Edit",
            bookmarkThumbnail: "Thumbnail",
            bookmarkScreenshot: "Screenshot",
            bookmarkURL: "URL",
            bookmarkNone: "None",
            bookmarkUpdate: "Update",
            bookmarkDelete: "Delete",
            bookmarkSave: "Save",
            elevationPrompt: "Draw line to generate an elevation profile.",
            elevationGround: "Ground",
            elevationLength: "Length",
            elevationGain: "Gain",
            elevationLoss: "Loss",
            elevationMin: "Min",
            elevationMax: "Max",
            elevationAvg: "Avg",
            elevationMaxSlope: "Max Slope",
            elevationAvgSlope: "Avg Slope",
            elevationNewProfile: "New profile",
            elevationDone: "Done",
            elevationDistanceUnits: "Distance Units",
            elevationUnits: "Elevation units",
            elevationUniformChartScaling: "Uniform chart scaling",
            elevationUnitDecimeter: "Decimeter",
            elevationUnitMeters: "Meters",
            sketchSelectFeature: "Select feature",
            sketchDrawPoint: "Draw a point",
            sketchDrawPolyline: "Draw a polyline",
            sketchDrawPolygon: "Draw a polygon",
            sketchDrawRectangle: "Draw a rectangle or square",
            sketchDrawCircle: "Draw a circle or ellipse",
            sketchUndo: "Undo",
            sketchRedo: "Redo",
            sketchSettings: "Settings",
            sketchEnableTooltips: "Enable tooltips",
            sketchEnableSnapping: "Enable snapping",
            sketchGeometryGuides: "Geometry guides",
            sketchFeatureToFeature: "Feature to feature",
            sketchGrid: "Grid",
            sketchSnappingLayers: "Snapping layers",
            sketchGridOptions: "Grid options",
            coordinateAddConversion: "Add conversion",
            coordinateInputCoordinate: "Input coordinate",
            coordinateCaptureMode: "Capture mode",
            coordinateFormatSettings: "Format settings",
            coordinateChangeDisplay: "Change coordinate display",
            coordinatePreview: "Preview",
            coordinateGoToLocation: "Go to location",
            coordinateConvert: "Convert",
            printExportHeading: "Export",
            printLayout: "Layout",
            printMapOnly: "Map only",
            printExports: "Exports",
            printTitle: "Title",
            printTitlePlaceholder: "Title of file",
            printTemplate: "Template",
            printLetterLandscape: "Letter ANSI A landscape",
            printLetterLandscapeSize: "11 × 8.5 inches",
            printChooseTemplate: "Choose template",
            printA3Landscape: "A3 landscape",
            printA3LandscapeSize: "42 × 29.7 centimeters",
            printA3Portrait: "A3 portrait",
            printA3PortraitSize: "29.7 × 42 centimeters",
            printA4Landscape: "A4 landscape",
            printA4LandscapeSize: "29.7 × 21 centimeters",
            printA4Portrait: "A4 portrait",
            printA4PortraitSize: "21 × 29.7 centimeters",
            printLetterPortrait: "Letter ANSI A portrait",
            printLetterPortraitSize: "8.5 × 11 inches",
            printTabloidLandscape: "Tabloid ANSI B landscape",
            printTabloidLandscapeSize: "17 × 11 inches",
            printTabloidPortrait: "Tabloid ANSI B portrait",
            printTabloidPortraitSize: "11 × 17 inches",
            printDone: "Done",
            printShowPrintArea: "Show print area",
            printFileFormat: "File format",
            printAdvancedOptions: "Advanced options",
            printSetScale: "Set scale",
            printCopyright: "Copyright",
            printOutputSpatialReference: "Output spatial reference",
            printIncludeLegend: "Include legend",
            printDynamicLegend: "Dynamic legend",
            printIncludeNorthArrow: "Include north arrow",
            printIncludeScaleBar: "Include scale bar",
            printMilesKilometers: "Miles and Kilometers",
            printFeetMeters: "Feet and Meters",
            printExportButton: "Export",
            printExportButtonAria: "Export. Exported files will appear below.",
            printAuthor: "Author",
            printScaleBarUnit: "Scale bar unit",
            printFileName: "File name",
            printFileNamePlaceholder: "File name",
            printWidth: "Width",
            printHeight: "Height",
            printNoExportedFiles: "No exported files",
            printExportedFilesDescription: "When you export a file, it will be shown here. Exports are only stored for a short period of time. Download your export to ensure continued access.",
            contactPhone: "Phone:",
            contactEmail: "Email:",
            contactLocation: "Location:",
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
            addressW: "Adresa",
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
                "Gabim gjatë ngarkimit të faqes. Provoni përsëri.",

            searchW: "Kërkim",
            layers: "Shtresat",
            basemaps: "Hartat bazë",
            distance: "Mat distancën",
            area: "Mat sipërfaqen",
            bookmarks: "Faqeshënuesit",
            homeW: "Pamja fillestare",
            legend: "Legjenda",
            sketch: "Vizatim",
            coordinates: "Konvertimi i koordinatave",
            compass: "Rivendos orientimin e hartës",
            print: "Printo hartën",
            elevation: "Profili i lartësisë",
            locate: "Gjej vendndodhjen time",
            scale: "Shkalla",
            closeTool: "Mbyll: {tool}",

            bettingShops: "Pika bastesh brenda një rrezeje prej 400 metrash",
            drawings: "Vizatimet e mia",
            city: "Qyteti",

            mapError:
                "Harta nuk mund të ngarkohet. Kontrolloni konsolën.",
            sortAscending: "Rendit rritës",
            sortDescending: "Rendit zbritës",
            zoomIn:"Zmadho",
            zoomOut:"Zvogëlo pamjen",

            searchPlaceholder: "Kërko adresë ose vend",

            distanceNewMeasurement: "Matje e re",
            distanceInstruction: "Filloni matjen duke klikuar në hartë për të vendosur pikën e parë.",
            distanceUnits: "Njësitë",
            distanceMetric: "Metrike",
            distanceResult: "Distanca",

            distanceUnitMetric: "Metrike",
            distanceUnitImperial: "Perandorake",
            distanceUnitInches: "Inç",
            distanceUnitFeet: "Këmbë",
            distanceUnitYards: "Jardë",
            distanceUnitMiles: "Milje",
            distanceUnitNauticalMiles: "Milje detare",
            distanceUnitUSFeet: "Këmbë (SHBA)",
            distanceUnitMillimeters: "Milimetra",
            distanceUnitCentimeters: "Centimetra",
            distanceUnitDecimeters: "Decimetra",
            distanceUnitKilometers: "Kilometra",
            areaResult: "Sipërfaqja",
            perimeterResult: "Perimetri",
            areaUnitSquareInches: "Inç katrorë",
            areaUnitSquareFeet: "Këmbë katrorë",
            areaUnitSquareYards: "Jardë katrorë",
            areaUnitSquareMiles: "Milje katrorë",
            areaUnitSquareNauticalMiles: "Milje detare katrorë",
            areaUnitSquareUSFeet: "Këmbë katrorë (SHBA)",
            areaUnitSquareMillimeters: "Milimetra katrorë",
            areaUnitSquareCentimeters: "Centimetra katrorë",
            areaUnitSquareDecimeters: "Decimetra katrorë",
            areaUnitSquareMeters: "Metra katrorë",
            areaUnitSquareKilometers: "Kilometra katrorë",
            areaUnitAcres: "Akre",
            areaUnitAres: "Are",
            areaUnitHectares: "Hektarë",

            bookmarksNoBookmarks: "Nuk ka faqeshënues",
            bookmarksEmptyDescription: "Shtoni faqeshënues në hartën tuaj dhe ata do të shfaqen këtu.",
            bookmarkAdd: "Shto faqeshënues",
            bookmarkDialogHeading: "Shto faqeshënues",
            bookmarkTitleLabel: "Titulli",
            bookmarkTitlePlaceholder: "Shkruani një titull",
            bookmarkCancel: "Anulo",
            bookmarkSubmit: "Shto",
            bookmarkEditHeading: "Ndrysho",
            bookmarkThumbnail: "Miniaturë",
            bookmarkScreenshot: "Pamje e ekranit",
            bookmarkURL: "URL",
            bookmarkNone: "Asnjë",
            bookmarkUpdate: "Përditëso",
            bookmarkDelete: "Fshi",
            bookmarkSave: "Ruaj",
            elevationPrompt: "Vizatoni një vijë për të krijuar profilin e lartësisë.",
            elevationGround: "Terreni",
            elevationLength: "Gjatësia",
            elevationGain: "Ngjitja",
            elevationLoss: "Zbritja",
            elevationMin: "Minimumi",
            elevationMax: "Maksimumi",
            elevationAvg: "Mesatarja",
            elevationMaxSlope: "Pjerrësia maksimale",
            elevationAvgSlope: "Pjerrësia mesatare",
            elevationNewProfile: "Profil i ri",
            elevationDone: "U krye",
            elevationDistanceUnits: "Njësitë e distancës",
            elevationUnits: "Njësitë e lartësisë",
            elevationUniformChartScaling: "Shkallëzim uniform i grafikut",
            elevationUnitDecimeter: "Decimetër",
            elevationUnitMeters: "Metra",
            sketchSelectFeature: "Zgjidh objektin",
            sketchDrawPoint: "Vizato një pikë",
            sketchDrawPolyline: "Vizato një vijë",
            sketchDrawPolygon: "Vizato një poligon",
            sketchDrawRectangle: "Vizato një drejtkëndësh ose katror",
            sketchDrawCircle: "Vizato një rreth ose elipsë",
            sketchUndo: "Zhbëj",
            sketchRedo: "Ribëj",
            sketchSettings: "Cilësimet",
            sketchEnableTooltips: "Aktivizo sugjerimet",
            sketchEnableSnapping: "Aktivizo kapjen",
            sketchGeometryGuides: "Udhëzuesit e gjeometrisë",
            sketchFeatureToFeature: "Objekt në objekt",
            sketchGrid: "Rrjeta",
            sketchSnappingLayers: "Shtresat e kapjes",
            sketchGridOptions: "Opsionet e rrjetës",
            coordinateAddConversion: "Shto konvertim",
            coordinateInputCoordinate: "Fut koordinatën",
            coordinateCaptureMode: "Modaliteti i kapjes",
            coordinateFormatSettings: "Cilësimet e formatit",
            coordinateChangeDisplay: "Ndrysho paraqitjen e koordinatave",
            coordinatePreview: "Parapamje",
            coordinateGoToLocation: "Shko te vendndodhja",
            coordinateConvert: "Konverto",
            printExportHeading: "Eksporti",
            printLayout: "Paraqitja",
            printMapOnly: "Vetëm harta",
            printExports: "Skedarët e eksportuar",
            printTitle: "Titulli",
            printTitlePlaceholder: "Titulli i skedarit",
            printTemplate: "Modeli",
            printLetterLandscape: "Letter ANSI A – horizontal",
            printLetterLandscapeSize: "11 × 8,5 inç",
            printChooseTemplate: "Zgjidhni modelin",
            printA3Landscape: "A3 – horizontal",
            printA3LandscapeSize: "42 × 29,7 centimetra",
            printA3Portrait: "A3 – vertikal",
            printA3PortraitSize: "29,7 × 42 centimetra",
            printA4Landscape: "A4 – horizontal",
            printA4LandscapeSize: "29,7 × 21 centimetra",
            printA4Portrait: "A4 – vertikal",
            printA4PortraitSize: "21 × 29,7 centimetra",
            printLetterPortrait: "Letter ANSI A – vertikal",
            printLetterPortraitSize: "8,5 × 11 inç",
            printTabloidLandscape: "Tabloid ANSI B – horizontal",
            printTabloidLandscapeSize: "17 × 11 inç",
            printTabloidPortrait: "Tabloid ANSI B – vertikal",
            printTabloidPortraitSize: "11 × 17 inç",
            printDone: "U krye",
            printShowPrintArea: "Shfaq zonën e printimit",
            printFileFormat: "Formati i skedarit",
            printAdvancedOptions: "Opsionet e avancuara",
            printSetScale: "Vendos shkallën",
            printCopyright: "Të drejtat e autorit",
            printOutputSpatialReference: "Sistemi referues hapësinor i daljes",
            printIncludeLegend: "Përfshi legjendën",
            printDynamicLegend: "Legjendë dinamike",
            printIncludeNorthArrow: "Përfshi shigjetën e veriut",
            printIncludeScaleBar: "Përfshi shkallën grafike",
            printMilesKilometers: "Milje dhe kilometra",
            printFeetMeters: "Këmbë dhe metra",
            printExportButton: "Eksporto",
            printExportButtonAria: "Eksporto. Skedarët e eksportuar do të shfaqen më poshtë.",
            printAuthor: "Autori",
            printScaleBarUnit: "Njësia e shiritit të shkallës",
            printFileName: "Emri i skedarit",
            printFileNamePlaceholder: "Emri i skedarit",
            printWidth: "Gjerësia",
            printHeight: "Lartësia",
            printNoExportedFiles: "Nuk ka skedarë të eksportuar",
            printExportedFilesDescription: "Kur eksportoni një skedar, ai do të shfaqet këtu. Eksportet ruhen vetëm për një periudhë të shkurtër. Shkarkoni eksportin për të siguruar qasje të vazhdueshme.",
            contactPhone: "Telefon:",
            contactEmail: "E-mail:",
            contactLocation: "Vendndodhja:",
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
    } catch {}

    let currentLanguage = Object.hasOwn(translations, savedLanguage)
        ? savedLanguage
        : "MK";

    window.t = function (key, values = {}) {
        const template =
            translations[currentLanguage]?.[key] ??
            translations.MK?.[key] ??
            "";

        return String(template).replace(/\{(\w+)\}/g, (match, name) =>
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
        } catch {}

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

    document.querySelectorAll("[data-language]").forEach((button) => {
        button.addEventListener("click", () => {
            window.setSiteLanguage(button.dataset.language);
        });
    });

    window.setSiteLanguage(currentLanguage);
})();