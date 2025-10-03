        const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

        const defaultAppearance = {
            background: '#f5f5f5',
            header: '#2d4a2b',
            primary: '#6b8e68',
            accent: '#8fa68c',
            text: '#2d4a2b',
            backgroundImage: '',
            headerImage: '',
            footerImage: ''
        };

        const APPEARANCE_FIELDS = [
            { id: 'appearanceBackground', key: 'background' },
            { id: 'appearanceHeader', key: 'header' },
            { id: 'appearancePrimary', key: 'primary' },
            { id: 'appearanceAccent', key: 'accent' },
            { id: 'appearanceText', key: 'text' }
        ];

        const APPEARANCE_COLOR_KEYS = APPEARANCE_FIELDS.map(field => field.key);

        const APPEARANCE_IMAGE_FIELDS = [
            { id: 'appearanceBackgroundImage', key: 'backgroundImage' },
            { id: 'appearanceHeaderImage', key: 'headerImage' },
            { id: 'appearanceFooterImage', key: 'footerImage' }
        ];

        const APPEARANCE_IMAGE_KEYS = APPEARANCE_IMAGE_FIELDS.map(field => field.key);

        const APPEARANCE_FIELD_MAP = new Map(APPEARANCE_FIELDS.map(field => [field.id, field]));

        // Default data structure
        const defaultConfig = {
            whatsapp: '573000000000',
            email: 'info@amazoniaconcrete.com',
            phone: '+57 300 000 0000',
            address: '',
            instagram: '',
            facebook: '',
            tiktok: '',
            companyName: 'AMAZONIA CONCRETE',
            tagline: 'Naturaleza y Modernidad en Perfecta Armonía',
            footerMessage: 'Creando espacios únicos con concreto sostenible',
            logoData: '',
            appearance: { ...defaultAppearance }
        };

        const defaultCategories = [
            {
                id: 'macetas',
                name: 'Macetas de Concreto',
                icon: '🪴',
                description: 'Diseños únicos inspirados en la naturaleza amazónica'
            },
            {
                id: 'pisos',
                name: 'Pisos de Concreto',
                icon: '⬜',
                description: 'Resistencia y elegancia para tus espacios'
            },
            {
                id: 'revestimientos',
                name: 'Revestimientos',
                icon: '🗿',
                description: 'Transforma tus paredes con texturas naturales'
            },
            {
                id: 'mobiliario',
                name: 'Mobiliario de Concreto',
                icon: '🪑',
                description: 'Piezas únicas y duraderas para tu hogar'
            },
            {
                id: 'decoracion',
                name: 'Decoración',
                icon: '🎨',
                description: 'Detalles que marcan la diferencia'
            }
        ];

        function createDefaultProductsMap(categories) {
            return categories.reduce((acc, category) => {
                const idSource = category && category.id ? category.id : generateCategoryId(category && category.name ? category.name : 'categoria');
                acc[idSource] = [];
                return acc;
            }, {});
        }

        function normalizeColorValue(value, fallback) {
            if (typeof value !== 'string') {
                return fallback;
            }

            const trimmed = value.trim();

            if (!HEX_COLOR_PATTERN.test(trimmed)) {
                return fallback;
            }

            if (trimmed.length === 4) {
                const r = trimmed.charAt(1);
                const g = trimmed.charAt(2);
                const b = trimmed.charAt(3);
                return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
            }

            return trimmed.length === 7 ? trimmed.toLowerCase() : fallback;
        }

        function normalizeAppearance(candidate) {
            const normalized = { ...defaultAppearance };

            if (isPlainObject(candidate)) {
                APPEARANCE_COLOR_KEYS.forEach(key => {
                    normalized[key] = normalizeColorValue(candidate[key], normalized[key]);
                });

                APPEARANCE_IMAGE_KEYS.forEach(key => {
                    const value = candidate[key];
                    normalized[key] = typeof value === 'string'
                        ? value.trim()
                        : defaultAppearance[key];
                });
            }

            return normalized;
        }

        function getNormalizedConfig(rawConfig) {
            const base = isPlainObject(rawConfig)
                ? { ...defaultConfig, ...rawConfig }
                : { ...defaultConfig };

            base.appearance = normalizeAppearance(base.appearance);
            return base;
        }

        function clampColorComponent(value) {
            return Math.min(255, Math.max(0, Math.round(value)));
        }

        function adjustColorBrightness(hex, percent) {
            const normalized = normalizeColorValue(hex, '#000000').slice(1);
            const value = parseInt(normalized, 16);
            const r = (value >> 16) & 255;
            const g = (value >> 8) & 255;
            const b = value & 255;
            const factor = percent / 100;

            const adjustChannel = (channel) => {
                if (factor >= 0) {
                    return clampColorComponent(channel + (255 - channel) * factor);
                }

                return clampColorComponent(channel + channel * factor);
            };

            const adjustedR = adjustChannel(r);
            const adjustedG = adjustChannel(g);
            const adjustedB = adjustChannel(b);

            const hexString = ((1 << 24) + (adjustedR << 16) + (adjustedG << 8) + adjustedB).toString(16).slice(1);
            return `#${hexString}`;
        }

        function hexToRgba(hex, alpha) {
            const normalized = normalizeColorValue(hex, '#000000').slice(1);
            const value = parseInt(normalized, 16);
            const r = (value >> 16) & 255;
            const g = (value >> 8) & 255;
            const b = value & 255;
            const clampedAlpha = Math.min(1, Math.max(0, Number(alpha)));

            return `rgba(${r}, ${g}, ${b}, ${clampedAlpha.toFixed(2)})`;
        }

        function getReadableTextColor(backgroundHex, lightColor = '#ffffff', darkColor = '#1a1a1a') {
            const normalized = normalizeColorValue(backgroundHex, '#000000').slice(1);
            const value = parseInt(normalized, 16);
            const r = (value >> 16) & 255;
            const g = (value >> 8) & 255;
            const b = value & 255;
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            return luminance > 0.6 ? darkColor : lightColor;
        }

        function buildThemeTokens(appearance) {
            const normalized = normalizeAppearance(appearance);

            const backgroundEnd = adjustColorBrightness(normalized.background, -10);
            const backgroundImage = typeof normalized.backgroundImage === 'string' ? normalized.backgroundImage : '';
            const headerStart = adjustColorBrightness(normalized.header, -8);
            const headerEnd = adjustColorBrightness(normalized.header, 12);
            const headerImage = typeof normalized.headerImage === 'string' ? normalized.headerImage : '';
            const footerImage = typeof normalized.footerImage === 'string' ? normalized.footerImage : '';
            const loaderPrimary = adjustColorBrightness(normalized.header, 10);
            const loaderSecondary = adjustColorBrightness(normalized.accent, 10);
            const navButtonStart = adjustColorBrightness(normalized.primary, 8);
            const navButtonEnd = adjustColorBrightness(normalized.primary, -8);
            const navButtonActiveStart = adjustColorBrightness(normalized.header, -5);
            const navButtonActiveEnd = adjustColorBrightness(normalized.header, 15);
            const categoryUnderline = adjustColorBrightness(normalized.accent, -15);
            const featureBackground = hexToRgba(normalized.accent, 0.18);
            const featureText = adjustColorBrightness(normalized.accent, -25);
            const ctaBackgroundStart = adjustColorBrightness(normalized.primary, 6);
            const ctaBackgroundEnd = adjustColorBrightness(normalized.primary, -6);
            const ctaShadow = hexToRgba(normalized.primary, 0.3);
            const ctaSectionBackground = hexToRgba(normalized.accent, 0.12);
            const modalAccent = adjustColorBrightness(normalized.primary, -12);
            const cardShadow = hexToRgba(normalized.text, 0.12);
            const cardHoverShadow = hexToRgba(normalized.text, 0.18);
            const borderColor = hexToRgba(normalized.text, 0.08);
            const indicatorActive = adjustColorBrightness(normalized.primary, -10);
            const textSecondary = adjustColorBrightness(normalized.text, 35);
            const cardOverlayStart = hexToRgba(normalized.primary, 0.12);
            const cardOverlayEnd = hexToRgba(normalized.header, 0.12);
            const imagePlaceholderStart = adjustColorBrightness(normalized.background, -6);
            const imagePlaceholderEnd = adjustColorBrightness(normalized.background, -16);
            const priceColor = adjustColorBrightness(normalized.primary, -5);
            const specBorderColor = hexToRgba(normalized.text, 0.12);
            const textOnDark = '#ffffff';
            const headerText = getReadableTextColor(normalized.header, textOnDark, normalized.text);
            const footerText = getReadableTextColor(normalized.header, textOnDark, normalized.text);
            const backgroundOverlayStart = hexToRgba(normalized.background, 0.85);
            const backgroundOverlayEnd = hexToRgba(backgroundEnd, 0.85);
            const headerImageOverlayStart = hexToRgba(headerStart, 0.85);
            const headerImageOverlayEnd = hexToRgba(headerEnd, 0.85);
            const footerImageOverlayStart = hexToRgba(headerStart, 0.85);
            const footerImageOverlayEnd = hexToRgba(headerEnd, 0.85);

            return {
                appearance: normalized,
                backgroundStart: normalized.background,
                backgroundEnd,
                backgroundImage,
                backgroundOverlayStart,
                backgroundOverlayEnd,
                headerStart,
                headerEnd,
                headerImage,
                headerImageOverlayStart,
                headerImageOverlayEnd,
                headerOverlay: hexToRgba(normalized.header, 0.1),
                headerText,
                footerImage,
                footerImageOverlayStart,
                footerImageOverlayEnd,
                footerText,
                loaderPrimary,
                loaderSecondary,
                navButtonStart,
                navButtonEnd,
                navButtonActiveStart,
                navButtonActiveEnd,
                navButtonShadow: hexToRgba(normalized.primary, 0.28),
                categoryTitle: normalized.text,
                categoryDescription: textSecondary,
                categoryUnderline,
                featureBackground,
                featureText,
                ctaBackgroundStart,
                ctaBackgroundEnd,
                ctaShadow,
                ctaSectionBackground,
                modalAccent,
                modalHeaderStart: headerStart,
                modalHeaderEnd: headerEnd,
                cardShadow,
                cardHoverShadow,
                borderColor,
                indicatorActive,
                textSecondary,
                textOnDark,
                accentSoft: hexToRgba(normalized.accent, 0.15),
                accentStrong: normalized.accent,
                cardOverlayStart,
                cardOverlayEnd,
                imagePlaceholderStart,
                imagePlaceholderEnd,
                priceColor,
                specBorderColor
            };
        }

        let catalogData = {
            config: getNormalizedConfig(),
            categories: defaultCategories.map(category => ({ ...category })),
            products: createDefaultProductsMap(defaultCategories),
            categoryInfo: {}
        };

        let currentCategory = defaultCategories[0] ? defaultCategories[0].id : '';
        let editingProductId = null;
        let currentImageUrl = '';
        let currentIconFallback = '';
        let lastFocusedElement = null;
        let modalKeydownHandler = null;
        const processStatusEntries = new Map();
        let processStatusCounter = 0;
        let processStatusListElement = null;
        let processStatusEmptyElement = null;
        let processStatusPanelElement = null;
        let processStatusClearButton = null;
        const PROCESS_LABELS = {
            'generate-catalog': 'Generar catálogo',
            'export-data': 'Exportar datos'
        };
        const PROCESS_STATE_CLASSES = [
            'process-panel__item--running',
            'process-panel__item--success',
            'process-panel__item--error'
        ];
        const MODAL_FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        function resolveProcessStatusElements() {
            if (!processStatusPanelElement || !processStatusPanelElement.isConnected) {
                processStatusPanelElement = document.getElementById('exportStatusPanel');
            }

            if (!processStatusListElement || !processStatusListElement.isConnected) {
                processStatusListElement = document.getElementById('exportStatusList');
            }

            if (!processStatusEmptyElement || !processStatusEmptyElement.isConnected) {
                processStatusEmptyElement = document.getElementById('exportStatusEmpty');
            }

            if (!processStatusClearButton || !processStatusClearButton.isConnected) {
                processStatusClearButton = document.getElementById('clearProcessStatusButton');
            }

            if (!processStatusPanelElement || !processStatusListElement) {
                return null;
            }

            return {
                panel: processStatusPanelElement,
                list: processStatusListElement,
                empty: processStatusEmptyElement,
                clearButton: processStatusClearButton
            };
        }

        function toggleProcessStatusEmptyState() {
            const elements = resolveProcessStatusElements();

            if (!elements) {
                return;
            }

            const hasItems = elements.list.children.length > 0;

            if (elements.empty) {
                elements.empty.hidden = hasItems;
            }

            if (elements.clearButton) {
                elements.clearButton.disabled = !hasItems;
            }
        }

        function formatProcessTime(date) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        function createProcessStatusEntry(operation, initialDetail = 'Iniciando…') {
            const elements = resolveProcessStatusElements();

            if (!elements) {
                return null;
            }

            const label = PROCESS_LABELS[operation] || 'Proceso';
            const now = new Date();
            processStatusCounter += 1;
            const entryId = `${operation}-${now.getTime()}-${processStatusCounter}`;

            const item = document.createElement('li');
            item.className = 'process-panel__item process-panel__item--running';
            item.setAttribute('data-operation', operation);
            item.setAttribute('data-entry-id', entryId);
            item.setAttribute('role', 'status');

            const icon = document.createElement('span');
            icon.className = 'process-panel__icon';
            icon.setAttribute('aria-hidden', 'true');

            const content = document.createElement('div');
            content.className = 'process-panel__content';

            const row = document.createElement('div');
            row.className = 'process-panel__row';

            const labelElement = document.createElement('span');
            labelElement.className = 'process-panel__label';
            labelElement.textContent = label;

            const timeElement = document.createElement('time');
            timeElement.className = 'process-panel__time';
            timeElement.setAttribute('datetime', now.toISOString());
            timeElement.textContent = formatProcessTime(now);

            row.appendChild(labelElement);
            row.appendChild(timeElement);

            const detailElement = document.createElement('p');
            detailElement.className = 'process-panel__detail';
            detailElement.textContent = initialDetail;

            content.appendChild(row);
            content.appendChild(detailElement);

            item.appendChild(icon);
            item.appendChild(content);

            elements.list.prepend(item);
            processStatusEntries.set(entryId, {
                element: item,
                detail: detailElement,
                icon
            });

            toggleProcessStatusEmptyState();

            return entryId;
        }

        function updateProcessStatusEntry(entryId, options = {}) {
            if (!entryId || !processStatusEntries.has(entryId)) {
                return;
            }

            const entry = processStatusEntries.get(entryId);
            const { element, detail, icon } = entry;
            const { state, detail: detailText } = options;

            if (typeof detailText === 'string') {
                detail.textContent = detailText;
            }

            if (state) {
                PROCESS_STATE_CLASSES.forEach(className => {
                    element.classList.remove(className);
                });

                const targetClass = `process-panel__item--${state}`;
                element.classList.add(targetClass);

                if (state === 'success') {
                    icon.textContent = '✓';
                } else if (state === 'error') {
                    icon.textContent = '!';
                } else {
                    icon.textContent = '';
                }
            }
        }

        function clearProcessStatusEntries() {
            const elements = resolveProcessStatusElements();

            processStatusEntries.forEach(entry => {
                if (entry.element && entry.element.parentNode) {
                    entry.element.parentNode.removeChild(entry.element);
                }
            });

            processStatusEntries.clear();

            if (elements && elements.list) {
                elements.list.innerHTML = '';
            }

            toggleProcessStatusEmptyState();
        }

        function setElementBusyState(element, isBusy) {
            if (!element) {
                return;
            }

            element.disabled = !!isBusy;

            if (isBusy) {
                element.setAttribute('aria-busy', 'true');
            } else {
                element.removeAttribute('aria-busy');
            }
        }

        function setGenerateButtonsDisabled(isDisabled) {
            const generateButtons = document.querySelectorAll('button[data-action="generate-catalog"]');
            generateButtons.forEach(button => {
                setElementBusyState(button, isDisabled);
            });
        }

        function setExportButtonDisabled(isDisabled) {
            const exportButton = document.getElementById('exportDataButton');
            setElementBusyState(exportButton, isDisabled);
        }

        function generateCategoryId(value) {
            if (!value) {
                return 'categoria';
            }

            const normalized = value
                .toString()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            return normalized || 'categoria';
        }

        function ensureUniqueCategoryId(baseId, existingIds) {
            const fallback = baseId || 'categoria';
            let candidate = fallback;
            let counter = 1;

            while (existingIds.has(candidate)) {
                candidate = `${fallback}-${counter}`;
                counter += 1;
            }

            return candidate;
        }

        function formatCategoryLabel(id) {
            if (!id) {
                return 'Categoría';
            }

            return id
                .replace(/[-_]+/g, ' ')
                .replace(/^(.)/, (match, char) => char.toUpperCase());
        }

        function isPlainObject(value) {
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        }

        function createLegacyCategoryResolver(rawInfo) {
            if (!isPlainObject(rawInfo)) {
                return {
                    lookup: () => null,
                    fallbackCategories: []
                };
            }

            const lookupMap = new Map();
            const fallbackCategories = [];
            const usedFallbackIds = new Set();

            Object.entries(rawInfo).forEach(([key, value]) => {
                if (value === null || typeof value === 'undefined') {
                    return;
                }

                const normalizedEntry = isPlainObject(value) ? { ...value } : { title: value };
                const rawTitle = (normalizedEntry.title || normalizedEntry.name || (typeof key === 'string' ? key : '') || '').toString().trim();
                const rawDescription = (normalizedEntry.description || normalizedEntry.desc || '').toString();
                const rawIcon = (normalizedEntry.icon || normalizedEntry.emoji || '').toString().trim();

                const baseIdSource = typeof key === 'string' && key ? key : rawTitle;
                let sanitizedId = generateCategoryId(baseIdSource || rawTitle || 'categoria');
                sanitizedId = ensureUniqueCategoryId(sanitizedId, usedFallbackIds);
                usedFallbackIds.add(sanitizedId);

                const displayTitle = rawTitle || formatCategoryLabel(sanitizedId);
                const displayIcon = rawIcon || '📦';

                const metadata = {
                    icon: displayIcon,
                    title: displayTitle,
                    description: rawDescription
                };

                const candidateKeys = new Set([
                    typeof key === 'string' ? key : '',
                    rawTitle,
                    sanitizedId
                ].filter(Boolean));

                candidateKeys.forEach(candidate => {
                    lookupMap.set(candidate, metadata);
                    lookupMap.set(candidate.toLowerCase(), metadata);
                });

                fallbackCategories.push({
                    id: sanitizedId,
                    name: displayTitle,
                    icon: displayIcon,
                    description: rawDescription
                });
            });

            return {
                lookup: values => {
                    const candidates = Array.isArray(values) ? values : [values];
                    for (const candidate of candidates) {
                        if (typeof candidate !== 'string' || !candidate) {
                            continue;
                        }

                        if (lookupMap.has(candidate)) {
                            return lookupMap.get(candidate);
                        }

                        const lowerCandidate = candidate.toLowerCase();
                        if (lookupMap.has(lowerCandidate)) {
                            return lookupMap.get(lowerCandidate);
                        }

                        const sanitizedCandidate = generateCategoryId(candidate);
                        if (sanitizedCandidate) {
                            if (lookupMap.has(sanitizedCandidate)) {
                                return lookupMap.get(sanitizedCandidate);
                            }

                            const sanitizedLower = sanitizedCandidate.toLowerCase();
                            if (lookupMap.has(sanitizedLower)) {
                                return lookupMap.get(sanitizedLower);
                            }
                        }
                    }

                    return null;
                },
                fallbackCategories
            };
        }

        function escapeHtml(value) {
            if (typeof value !== 'string') {
                return '';
            }
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function escapeCssUrl(value) {
            if (typeof value !== 'string') {
                return '';
            }

            return value
                .trim()
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n|\r|\f|\0/g, '')
                .replace(/\)/g, '\\)');
        }

        const SOCIAL_ICON_SVGS = {
            whatsapp: `<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
            instagram: `<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>`,
            facebook: `<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>`,
            tiktok: `<svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
        };

        function getSocialIconSvg(name) {
            return SOCIAL_ICON_SVGS[name] || '';
        }

        const COP_CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            currencyDisplay: 'code',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        function formatCurrencyCOP(value) {
            if (value === null || typeof value === 'undefined') {
                return '';
            }

            if (typeof value === 'number' && !Number.isFinite(value)) {
                return '';
            }

            const stringValue = typeof value === 'number' ? String(value) : String(value);
            if (!stringValue) {
                return '';
            }

            const match = stringValue.match(/[\d][\d.,]*/);
            if (!match) {
                return '';
            }

            const numericChunk = match[0];
            const digitsOnly = numericChunk.replace(/[^\d]/g, '');
            if (!digitsOnly) {
                return '';
            }

            const parsedValue = parseInt(digitsOnly, 10);
            if (Number.isNaN(parsedValue)) {
                return '';
            }

            const formatted = COP_CURRENCY_FORMATTER.format(parsedValue);
            let prefix = stringValue.slice(0, match.index);
            let suffix = stringValue.slice(match.index + numericChunk.length);

            const prefixWithoutCop = prefix.replace(/\s*COP\s*$/i, '');
            if (prefixWithoutCop !== prefix) {
                prefix = prefixWithoutCop;
                if (prefix && !/\s$/.test(prefix)) {
                    prefix += ' ';
                }
            }

            const suffixWithoutCop = suffix.replace(/^\s*COP\s*/i, '');
            if (suffixWithoutCop !== suffix) {
                suffix = suffixWithoutCop;
                if (suffix && !/^\s/.test(suffix)) {
                    suffix = ` ${suffix}`;
                }
            }

            return `${prefix}${formatted}${suffix}`;
        }

        const PRODUCT_FIELD_LIMITS = {
            shortDesc: 140,
            longDesc: 400,
            specs: 800
        };

        const productFormAssistantRefreshers = [];
        let productFormAssistantsInitialized = false;

        function setHintState(element, state) {
            if (!element) {
                return;
            }

            element.classList.remove('field-hint--muted', 'field-hint--success', 'field-hint--error');

            if (state) {
                element.classList.add(`field-hint--${state}`);
            }
        }

        function setupCharacterCounter(inputId, counterId, limit) {
            const input = document.getElementById(inputId);
            const counter = document.getElementById(counterId);

            if (!input || !counter) {
                return null;
            }

            if (limit) {
                input.setAttribute('maxlength', limit);
            }

            const update = () => {
                const valueLength = input.value.length;
                if (limit) {
                    counter.textContent = `${valueLength} / ${limit} caracteres`;
                    counter.classList.toggle('over-limit', valueLength > limit);
                } else {
                    counter.textContent = `${valueLength} caracteres`;
                    counter.classList.remove('over-limit');
                }
            };

            input.addEventListener('input', update);
            input.addEventListener('change', update);

            update();
            return update;
        }

        function getLastPriceForCategory(categoryId) {
            if (!categoryId || !catalogData || !catalogData.products) {
                return '';
            }

            const products = catalogData.products[categoryId];
            if (!Array.isArray(products) || products.length === 0) {
                return '';
            }

            for (let index = products.length - 1; index >= 0; index -= 1) {
                const product = products[index];
                if (!product) {
                    continue;
                }

                const formatted = formatCurrencyCOP(product.price);
                if (formatted) {
                    return formatted;
                }
            }

            return '';
        }

        function updatePricePreview() {
            const priceInput = document.getElementById('productPrice');
            const previewElement = document.getElementById('pricePreview');

            if (!priceInput || !previewElement) {
                return;
            }

            const rawValue = priceInput.value.trim();

            if (!rawValue) {
                previewElement.textContent = 'Vista previa: —';
                setHintState(previewElement, 'muted');
                return;
            }

            const formatted = formatCurrencyCOP(rawValue);
            if (formatted) {
                let suffixText = '';
                const slashIndex = rawValue.indexOf('/');
                if (slashIndex !== -1) {
                    const suffixPart = rawValue.slice(slashIndex + 1).trim();
                    if (suffixPart) {
                        suffixText = ` / ${suffixPart}`;
                    }
                }

                previewElement.textContent = `Vista previa: ${formatted}${suffixText}`;
                setHintState(previewElement, 'success');
                return;
            }

            previewElement.textContent = 'Vista previa: introduce un número para calcular el precio.';
            setHintState(previewElement, 'error');
        }

        function updatePriceAssistantsState() {
            const priceInput = document.getElementById('productPrice');
            const priceHint = document.getElementById('priceHint');
            const categorySelect = document.getElementById('productCategory');

            if (!priceInput) {
                return;
            }

            const defaultPlaceholder = '$45.000 o $85.000/m²';
            const categoryId = categorySelect ? categorySelect.value : '';
            const suggestedPrice = getLastPriceForCategory(categoryId);

            priceInput.placeholder = suggestedPrice
                ? `${suggestedPrice} (sugerido)`
                : defaultPlaceholder;

            if (priceHint) {
                if (suggestedPrice) {
                    priceHint.innerHTML = `Último precio registrado en esta categoría: <strong>${suggestedPrice}</strong>. `
                        + 'Puedes añadir sufijos como <strong>/m²</strong> o <strong>/unidad</strong>.';
                    setHintState(priceHint, 'success');
                } else {
                    priceHint.textContent = 'Ejemplos válidos: $45.000, 125000 o 85.000/m².';
                    setHintState(priceHint, 'muted');
                }
            }

            updatePricePreview();
        }

        function validateSpecsHint() {
            const specsInput = document.getElementById('productSpecs');
            const specsHint = document.getElementById('specsHint');

            if (!specsInput || !specsHint) {
                return;
            }

            const lines = specsInput.value
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean);

            if (lines.length === 0) {
                specsHint.innerHTML = 'Añade cada especificación en el formato <strong>Nombre: Valor</strong> '
                    + 'para que se muestre correctamente.';
                setHintState(specsHint, 'muted');
                return;
            }

            const invalidLines = lines.filter(line => {
                if (!line.includes(':')) {
                    return true;
                }
                const [label, value] = line.split(':');
                return !label || !label.trim() || !value || !value.trim();
            });

            if (invalidLines.length === 0) {
                const pluralSuffix = lines.length === 1 ? '' : 'es';
                specsHint.textContent = `¡Perfecto! ${lines.length} especificación${pluralSuffix} con formato válido.`;
                setHintState(specsHint, 'success');
                return;
            }

            const pluralError = invalidLines.length === 1 ? '' : 's';
            specsHint.textContent = `Revisa ${invalidLines.length} línea${pluralError}: usa el formato Nombre: Valor.`;
            setHintState(specsHint, 'error');
        }

        function setupPriceAssistants() {
            const priceInput = document.getElementById('productPrice');
            const categorySelect = document.getElementById('productCategory');

            if (!priceInput) {
                return null;
            }

            priceInput.addEventListener('input', updatePricePreview);
            priceInput.addEventListener('blur', updatePricePreview);

            if (categorySelect) {
                categorySelect.addEventListener('change', updatePriceAssistantsState);
            }

            updatePriceAssistantsState();
            return updatePriceAssistantsState;
        }

        function setupSpecsAssistant() {
            const specsInput = document.getElementById('productSpecs');

            if (!specsInput) {
                return null;
            }

            specsInput.addEventListener('input', validateSpecsHint);
            specsInput.addEventListener('blur', validateSpecsHint);

            validateSpecsHint();
            return () => {
                validateSpecsHint();
            };
        }

        function setupProductFormAssistants() {
            if (productFormAssistantsInitialized) {
                refreshProductFormAssistants();
                return;
            }

            productFormAssistantsInitialized = true;
            productFormAssistantRefreshers.length = 0;

            const shortDescCounter = setupCharacterCounter(
                'productShortDesc',
                'shortDescCounter',
                PRODUCT_FIELD_LIMITS.shortDesc
            );
            if (shortDescCounter) {
                productFormAssistantRefreshers.push(shortDescCounter);
            }

            const longDescCounter = setupCharacterCounter(
                'productLongDesc',
                'longDescCounter',
                PRODUCT_FIELD_LIMITS.longDesc
            );
            if (longDescCounter) {
                productFormAssistantRefreshers.push(longDescCounter);
            }

            const specsCounter = setupCharacterCounter(
                'productSpecs',
                'specsCounter',
                PRODUCT_FIELD_LIMITS.specs
            );
            if (specsCounter) {
                productFormAssistantRefreshers.push(specsCounter);
            }

            const priceAssistant = setupPriceAssistants();
            if (priceAssistant) {
                productFormAssistantRefreshers.push(priceAssistant);
            }

            const specsAssistant = setupSpecsAssistant();
            if (specsAssistant) {
                productFormAssistantRefreshers.push(specsAssistant);
            }
        }

        function refreshProductFormAssistants() {
            if (productFormAssistantRefreshers.length === 0) {
                if (!productFormAssistantsInitialized) {
                    setupProductFormAssistants();
                }
                return;
            }

            productFormAssistantRefreshers.forEach(refreshFn => {
                if (typeof refreshFn === 'function') {
                    refreshFn();
                }
            });
        }

        function escapeForSvg(value) {
            if (typeof value !== 'string') {
                return '';
            }
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function createIconPlaceholder(icon, name) {
            const displayIcon = escapeForSvg(icon || '🛠️');
            const displayName = escapeForSvg(name || 'Producto Amazonia');
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
                <defs>
                    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stop-color="#f0f0f0" />
                        <stop offset="100%" stop-color="#e0e0e0" />
                    </linearGradient>
                </defs>
                <rect width="600" height="400" fill="url(#bg)" />
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="140">${displayIcon}</text>
                <text x="50%" y="78%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#4d4d4d">${displayName}</text>
            </svg>`;
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        }

        function getNormalizedProductImages(product) {
            if (!product || typeof product !== 'object') {
                return [];
            }

            const fromArray = Array.isArray(product.images) ? product.images : [];
            const fallback = typeof product.image === 'string' ? product.image : '';

            const combined = fromArray.slice();

            if (fallback && combined.length === 0) {
                combined.push(fallback);
            }

            return combined
                .map(sanitizeImageValue)
                .filter(url => url.length > 0);
        }

        function getProductImageSource(product, fallbackIcon = '🛠️') {
            if (!product) {
                return createIconPlaceholder(fallbackIcon, 'Producto Amazonia');
            }

            const normalizedImages = getNormalizedProductImages(product);

            if (normalizedImages.length > 0) {
                return normalizedImages[0];
            }

            const iconValue = product.icon || fallbackIcon;
            const nameValue = product.name || 'Producto Amazonia';

            if (!iconValue) {
                return createIconPlaceholder('🛠️', nameValue);
            }

            return createIconPlaceholder(iconValue, nameValue);
        }

        function normalizeProductImages(product) {
            if (!product || typeof product !== 'object') {
                return;
            }

            const normalized = getNormalizedProductImages(product);

            if (normalized.length > 0) {
                product.images = normalized;
                product.image = normalized[0];
            } else {
                product.images = [];
                delete product.image;
            }
        }

        function stripLegacyImageData(productsByCategory) {
            if (!productsByCategory || typeof productsByCategory !== 'object') {
                return;
            }

            Object.values(productsByCategory).forEach(productList => {
                if (!Array.isArray(productList)) {
                    return;
                }

                productList.forEach(product => {
                    if (product && typeof product === 'object') {
                        if (Object.prototype.hasOwnProperty.call(product, 'imageData')) {
                            delete product.imageData;
                        }

                        normalizeProductImages(product);
                    }
                });
            });
        }

        function ensureCategoryStructure() {
            if (!catalogData || typeof catalogData !== 'object') {
                catalogData = {
                    config: getNormalizedConfig(),
                    categories: defaultCategories.map(category => ({ ...category })),
                    products: createDefaultProductsMap(defaultCategories),
                    categoryInfo: {}
                };
            }

            if (!isPlainObject(catalogData.categoryInfo)) {
                catalogData.categoryInfo = {};
            }

            const legacyCategoryResolver = createLegacyCategoryResolver(catalogData.categoryInfo);

            let rawCategories = Array.isArray(catalogData.categories) ? catalogData.categories : [];
            if (rawCategories.length === 0) {
                if (legacyCategoryResolver.fallbackCategories.length > 0) {
                    rawCategories = legacyCategoryResolver.fallbackCategories.map(category => ({ ...category }));
                } else {
                    rawCategories = defaultCategories.map(category => ({ ...category }));
                }
            }

            const categoryMappings = [];

            catalogData.categories = rawCategories.map((category, index) => {
                let normalized;
                const candidateValues = [];

                if (typeof category === 'string') {
                    normalized = { name: category };
                    candidateValues.push(category);
                } else if (isPlainObject(category)) {
                    normalized = { ...category };
                    ['id', 'name', 'title', 'label', 'category'].forEach(key => {
                        if (typeof normalized[key] === 'string' && normalized[key]) {
                            candidateValues.push(normalized[key]);
                        }
                    });
                } else {
                    normalized = {};
                }

                const originalId = typeof normalized.id === 'string' ? normalized.id : null;
                if (originalId) {
                    candidateValues.push(originalId);
                }

                const legacyMeta = legacyCategoryResolver.lookup(candidateValues);

                const nameCandidates = [
                    typeof normalized.name === 'string' ? normalized.name.trim() : '',
                    typeof normalized.title === 'string' ? normalized.title.trim() : '',
                    typeof normalized.label === 'string' ? normalized.label.trim() : '',
                    typeof normalized.category === 'string' ? normalized.category.trim() : '',
                    legacyMeta && legacyMeta.title ? legacyMeta.title : ''
                ].filter(Boolean);

                let resolvedName = nameCandidates.length > 0 ? nameCandidates[0] : '';
                if (!resolvedName && originalId) {
                    resolvedName = formatCategoryLabel(originalId);
                }
                if (!resolvedName && candidateValues.length > 0) {
                    const fallbackCandidate = candidateValues.find(value => typeof value === 'string' && value);
                    if (fallbackCandidate) {
                        resolvedName = formatCategoryLabel(fallbackCandidate);
                    }
                }
                if (!resolvedName) {
                    resolvedName = 'Nueva categoría';
                }

                const idCandidates = [
                    originalId,
                    typeof normalized.id === 'string' ? normalized.id : '',
                    typeof normalized.category === 'string' ? normalized.category : '',
                    resolvedName,
                    legacyMeta && legacyMeta.title ? legacyMeta.title : ''
                ];

                let sanitizedId = null;
                for (const candidate of idCandidates) {
                    if (typeof candidate !== 'string' || !candidate) {
                        continue;
                    }

                    const possible = generateCategoryId(candidate);
                    if (possible) {
                        sanitizedId = possible;
                        break;
                    }
                }

                if (!sanitizedId) {
                    sanitizedId = generateCategoryId('categoria');
                }

                const iconCandidates = [
                    typeof normalized.icon === 'string' ? normalized.icon.trim() : '',
                    typeof normalized.emoji === 'string' ? normalized.emoji.trim() : '',
                    legacyMeta && legacyMeta.icon ? legacyMeta.icon : ''
                ].filter(Boolean);
                const resolvedIcon = iconCandidates.length > 0 ? iconCandidates[0] : '📦';

                const descriptionCandidates = [
                    typeof normalized.description === 'string' ? normalized.description : '',
                    typeof normalized.desc === 'string' ? normalized.desc : '',
                    legacyMeta && legacyMeta.description ? legacyMeta.description : ''
                ];
                const resolvedDescription = descriptionCandidates.find(value => typeof value === 'string' && value.trim().length > 0) || '';

                const mappingCandidates = new Set(candidateValues.filter(value => typeof value === 'string' && value));
                mappingCandidates.add(resolvedName);
                mappingCandidates.add(sanitizedId);
                if (legacyMeta && legacyMeta.title) {
                    mappingCandidates.add(legacyMeta.title);
                }

                categoryMappings[index] = {
                    index,
                    originalId,
                    sanitizedId,
                    finalId: sanitizedId,
                    candidates: Array.from(mappingCandidates)
                };

                normalized.id = sanitizedId;
                normalized.name = resolvedName;
                normalized.icon = resolvedIcon;
                normalized.description = resolvedDescription;

                return normalized;
            });

            const existingIds = new Set();
            catalogData.categories.forEach((category, index) => {
                const uniqueId = ensureUniqueCategoryId(category.id, existingIds);
                if (uniqueId !== category.id) {
                    category.id = uniqueId;
                }
                categoryMappings[index].finalId = category.id;
                existingIds.add(category.id);
            });

            if (!catalogData.products || typeof catalogData.products !== 'object') {
                catalogData.products = {};
            }

            const currentProducts = catalogData.products;
            const remappedProducts = {};

            catalogData.categories.forEach((category, index) => {
                const mapping = categoryMappings[index];
                const candidateIds = [];

                if (mapping.finalId) {
                    candidateIds.push(mapping.finalId);
                }

                if (Array.isArray(mapping.candidates)) {
                    mapping.candidates.forEach(value => {
                        if (value && !candidateIds.includes(value)) {
                            candidateIds.push(value);
                        }
                    });
                }

                if (mapping.originalId && !candidateIds.includes(mapping.originalId)) {
                    candidateIds.push(mapping.originalId);
                }

                let assignedProducts = null;
                candidateIds.some(id => {
                    if (Array.isArray(currentProducts[id])) {
                        assignedProducts = currentProducts[id];
                        return true;
                    }
                    return false;
                });

                remappedProducts[category.id] = Array.isArray(assignedProducts) ? assignedProducts : [];
            });

            catalogData.products = remappedProducts;
            stripLegacyImageData(catalogData.products);

            const validIds = new Set(catalogData.categories.map(category => category.id));

            if (!currentCategory || !validIds.has(currentCategory)) {
                currentCategory = catalogData.categories[0] ? catalogData.categories[0].id : '';
            }
        }

        function renderCategoryTabs() {
            const tabsContainer = document.getElementById('categoryTabs');
            if (!tabsContainer) {
                return;
            }

            tabsContainer.innerHTML = '';

            if (!Array.isArray(catalogData.categories) || catalogData.categories.length === 0) {
                const message = document.createElement('p');
                message.className = 'category-empty-message';
                message.textContent = 'Crea una categoría para comenzar a añadir productos.';
                tabsContainer.appendChild(message);
                return;
            }

            catalogData.categories.forEach(category => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'tab' + (category.id === currentCategory ? ' active' : '');
                button.dataset.category = category.id;
                const label = `${category.icon || '📦'} ${category.name || formatCategoryLabel(category.id)}`;
                button.textContent = label;
                button.addEventListener('click', () => {
                    setCurrentCategory(category.id);
                });
                tabsContainer.appendChild(button);
            });
        }

        function renderCategoryOptions(selectedId) {
            const select = document.getElementById('productCategory');
            if (!select) {
                return;
            }

            const previousValue = typeof selectedId !== 'undefined' ? selectedId : select.value;
            select.innerHTML = '';

            if (!Array.isArray(catalogData.categories) || catalogData.categories.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Sin categorías disponibles';
                select.appendChild(option);
                select.disabled = true;
                return;
            }

            select.disabled = false;

            catalogData.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = `${category.icon || '📦'} ${category.name || formatCategoryLabel(category.id)}`;
                select.appendChild(option);
            });

            const availableIds = catalogData.categories.map(category => category.id);
            const targetValue = availableIds.includes(previousValue) ? previousValue : (availableIds[0] || '');
            select.value = targetValue;
        }

        function refreshCategoriesUI(options = {}) {
            const { preserveCurrent = true, load = false } = options;

            ensureCategoryStructure();

            const availableIds = catalogData.categories.map(category => category.id);
            if (!preserveCurrent || !availableIds.includes(currentCategory)) {
                currentCategory = availableIds[0] || '';
            }

            renderCategoryTabs();
            renderCategoryOptions(currentCategory);

            const openProductButton = document.getElementById('openProductModalButton');
            if (openProductButton) {
                openProductButton.disabled = availableIds.length === 0;
            }

            if (load) {
                loadProducts();
            }
        }

        function setCurrentCategory(categoryId) {
            ensureCategoryStructure();
            const availableIds = catalogData.categories.map(category => category.id);
            if (!availableIds.includes(categoryId)) {
                categoryId = availableIds[0] || '';
            }

            currentCategory = categoryId;
            renderCategoryTabs();
            renderCategoryOptions(currentCategory);
            loadProducts();
        }

        function resetNewCategoryForm() {
            const nameInput = document.getElementById('newCategoryName');
            const iconInput = document.getElementById('newCategoryIcon');
            const descriptionInput = document.getElementById('newCategoryDescription');

            if (nameInput) {
                nameInput.value = '';
            }

            if (iconInput) {
                iconInput.value = '';
            }

            if (descriptionInput) {
                descriptionInput.value = '';
            }
        }

        function renderCategoryManagerList() {
            const list = document.getElementById('categoryManagerList');
            if (!list) {
                return;
            }

            list.innerHTML = '';

            if (!Array.isArray(catalogData.categories) || catalogData.categories.length === 0) {
                const message = document.createElement('p');
                message.className = 'category-empty-message';
                message.textContent = 'No hay categorías disponibles. Añade una nueva para comenzar.';
                list.appendChild(message);
                return;
            }

            const totalCategories = catalogData.categories.length;

            catalogData.categories.forEach((category, index) => {
                const item = document.createElement('div');
                item.className = 'category-manager-item';
                item.dataset.categoryId = category.id;

                const grid = document.createElement('div');
                grid.className = 'category-manager-grid';

                const nameGroup = document.createElement('div');
                nameGroup.className = 'form-group';
                const nameLabel = document.createElement('label');
                nameLabel.textContent = 'Nombre';
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.value = category.name || '';
                nameInput.setAttribute('data-field', 'name');
                nameGroup.appendChild(nameLabel);
                nameGroup.appendChild(nameInput);

                const iconGroup = document.createElement('div');
                iconGroup.className = 'form-group';
                const iconLabel = document.createElement('label');
                iconLabel.textContent = 'Icono';
                const iconInput = document.createElement('input');
                iconInput.type = 'text';
                iconInput.value = category.icon || '';
                iconInput.setAttribute('data-field', 'icon');
                iconGroup.appendChild(iconLabel);
                iconGroup.appendChild(iconInput);

                grid.appendChild(nameGroup);
                grid.appendChild(iconGroup);

                const descriptionGroup = document.createElement('div');
                descriptionGroup.className = 'form-group';
                const descriptionLabel = document.createElement('label');
                descriptionLabel.textContent = 'Descripción';
                const descriptionInput = document.createElement('textarea');
                descriptionInput.rows = 3;
                descriptionInput.value = category.description || '';
                descriptionInput.setAttribute('data-field', 'description');
                descriptionGroup.appendChild(descriptionLabel);
                descriptionGroup.appendChild(descriptionInput);

                const actions = document.createElement('div');
                actions.className = 'category-manager-item-actions';

                const moveUpButton = document.createElement('button');
                moveUpButton.type = 'button';
                moveUpButton.className = 'btn btn-secondary';
                moveUpButton.textContent = '⬆️ Subir';
                moveUpButton.title = 'Mover categoría hacia arriba';
                moveUpButton.disabled = index === 0;
                moveUpButton.addEventListener('click', () => moveCategory(category.id, -1));

                const moveDownButton = document.createElement('button');
                moveDownButton.type = 'button';
                moveDownButton.className = 'btn btn-secondary';
                moveDownButton.textContent = '⬇️ Bajar';
                moveDownButton.title = 'Mover categoría hacia abajo';
                moveDownButton.disabled = index === totalCategories - 1;
                moveDownButton.addEventListener('click', () => moveCategory(category.id, 1));

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'btn btn-danger';
                deleteButton.textContent = 'Eliminar';
                deleteButton.disabled = totalCategories <= 1;
                if (deleteButton.disabled) {
                    deleteButton.title = 'Debe existir al menos una categoría activa.';
                }
                deleteButton.addEventListener('click', () => deleteCategory(category.id));

                actions.appendChild(moveUpButton);
                actions.appendChild(moveDownButton);
                actions.appendChild(deleteButton);

                item.appendChild(grid);
                item.appendChild(descriptionGroup);
                item.appendChild(actions);

                list.appendChild(item);
            });
        }

        function captureCategoryManagerValues() {
            const list = document.getElementById('categoryManagerList');
            if (!list) {
                return;
            }

            const items = Array.from(list.querySelectorAll('.category-manager-item'));
            if (items.length === 0) {
                return;
            }

            const updatedCategories = [];
            const seenIds = new Set();

            items.forEach(item => {
                const categoryId = item.dataset.categoryId;
                if (!categoryId) {
                    return;
                }

                const category = catalogData.categories.find(cat => cat.id === categoryId);
                if (!category) {
                    return;
                }

                const nameInput = item.querySelector('[data-field="name"]');
                const iconInput = item.querySelector('[data-field="icon"]');
                const descriptionInput = item.querySelector('[data-field="description"]');

                category.name = (nameInput && nameInput.value.trim()) || 'Nueva categoría';
                category.icon = (iconInput && iconInput.value.trim()) || '📦';
                category.description = descriptionInput ? descriptionInput.value : '';

                updatedCategories.push(category);
                seenIds.add(categoryId);
            });

            if (updatedCategories.length > 0) {
                const remainingCategories = catalogData.categories.filter(category => !seenIds.has(category.id));
                catalogData.categories = [...updatedCategories, ...remainingCategories];
            }
        }

        function moveCategory(categoryId, direction) {
            ensureCategoryStructure();
            captureCategoryManagerValues();

            const currentIndex = catalogData.categories.findIndex(category => category.id === categoryId);
            if (currentIndex === -1) {
                return;
            }

            const targetIndex = currentIndex + direction;
            if (targetIndex < 0 || targetIndex >= catalogData.categories.length) {
                return;
            }

            const [movedCategory] = catalogData.categories.splice(currentIndex, 1);
            catalogData.categories.splice(targetIndex, 0, movedCategory);

            refreshCategoriesUI({ preserveCurrent: true, load: true });
            saveData({ silent: true });
            renderCategoryManagerList();
            showMessage('Orden de categorías actualizado', 'success');
        }

        function openCategoryModal() {
            ensureCategoryStructure();
            renderCategoryManagerList();
            resetNewCategoryForm();

            const modal = document.getElementById('categoryModal');
            if (modal) {
                modal.classList.add('active');
            }
        }

        function closeCategoryModal() {
            const modal = document.getElementById('categoryModal');
            if (modal) {
                modal.classList.remove('active');
            }
        }

        function handleAddCategory() {
            ensureCategoryStructure();
            captureCategoryManagerValues();

            const nameInput = document.getElementById('newCategoryName');
            const iconInput = document.getElementById('newCategoryIcon');
            const descriptionInput = document.getElementById('newCategoryDescription');

            if (!nameInput) {
                return;
            }

            const nameValue = nameInput.value.trim();
            if (!nameValue) {
                alert('Ingresa un nombre para la nueva categoría.');
                return;
            }

            const iconValue = iconInput ? iconInput.value.trim() : '';
            const descriptionValue = descriptionInput ? descriptionInput.value.trim() : '';

            const existingIds = new Set(catalogData.categories.map(category => category.id));
            const baseId = generateCategoryId(nameValue);
            const newId = ensureUniqueCategoryId(baseId, existingIds);

            const newCategory = {
                id: newId,
                name: nameValue,
                icon: iconValue || '📦',
                description: descriptionValue
            };

            catalogData.categories.push(newCategory);
            catalogData.products[newCategory.id] = [];

            currentCategory = newCategory.id;
            refreshCategoriesUI({ preserveCurrent: true, load: true });
            saveData();
            showMessage('Categoría añadida correctamente', 'success');
            renderCategoryManagerList();
            resetNewCategoryForm();
        }

        function saveCategoryEdits() {
            captureCategoryManagerValues();

            refreshCategoriesUI({ preserveCurrent: true, load: true });
            saveData();
            showMessage('Categorías actualizadas correctamente', 'success');
            renderCategoryManagerList();
        }

        function deleteCategory(categoryId) {
            ensureCategoryStructure();
            captureCategoryManagerValues();

            if (!Array.isArray(catalogData.categories) || catalogData.categories.length <= 1) {
                alert('Debe existir al menos una categoría en el catálogo.');
                return;
            }

            const category = catalogData.categories.find(cat => cat.id === categoryId);
            if (!category) {
                return;
            }

            const productCount = (catalogData.products[categoryId] || []).length;
            const confirmationMessage = productCount > 0
                ? `¿Eliminar la categoría "${category.name}" y sus ${productCount} productos?`
                : `¿Eliminar la categoría "${category.name}"?`;

            if (!confirm(confirmationMessage)) {
                return;
            }

            catalogData.categories = catalogData.categories.filter(cat => cat.id !== categoryId);
            delete catalogData.products[categoryId];

            refreshCategoriesUI({ preserveCurrent: false, load: true });
            saveData();
            showMessage('Categoría eliminada correctamente', 'success');
            renderCategoryManagerList();
        }

        function updateProductImagePreview(src, altText) {
            const previewImg = document.getElementById('productImagePreview');
            const placeholderEl = document.getElementById('productImagePlaceholder');

            if (!previewImg || !placeholderEl) {
                return;
            }

            if (src) {
                previewImg.src = src;
                previewImg.alt = altText || 'Vista previa del producto';
                previewImg.style.display = 'block';
                placeholderEl.style.display = 'none';
            } else {
                previewImg.removeAttribute('src');
                previewImg.alt = 'Vista previa del producto';
                previewImg.style.display = 'none';
                placeholderEl.textContent = 'Sin imagen seleccionada';
                placeholderEl.style.display = 'block';
            }
        }

        function getProductImagesContainer() {
            return document.getElementById('productImagesList');
        }

        function getProductImageInputs() {
            const container = getProductImagesContainer();
            if (!container) {
                return [];
            }

            return Array.from(container.querySelectorAll('.product-image-url-input'));
        }

        function sanitizeImageValue(value) {
            return typeof value === 'string' ? value.trim() : '';
        }

        function collectProductImageValues() {
            return getProductImageInputs()
                .map(input => sanitizeImageValue(input.value))
                .filter(url => url.length > 0);
        }

        function updateProductImageInputsRemoveState() {
            const inputs = getProductImageInputs();
            const total = inputs.length;

            inputs.forEach((input, index) => {
                if (index === 0) {
                    input.id = 'productImageUrl';
                } else {
                    input.removeAttribute('id');
                }

                const item = input.closest('.image-url-item');
                if (!item) {
                    return;
                }

                const removeButton = item.querySelector('.remove-image-button');
                if (!removeButton) {
                    return;
                }

                const shouldDisable = total <= 1;
                removeButton.disabled = shouldDisable;
                removeButton.hidden = shouldDisable;
            });
        }

        function createProductImageInput(value = '') {
            const item = document.createElement('div');
            item.className = 'image-url-item';

            const input = document.createElement('input');
            input.type = 'url';
            input.placeholder = 'https://raw.githubusercontent.com/...';
            input.className = 'product-image-url-input';
            input.value = value || '';
            input.addEventListener('input', handleProductImageInputsChange);

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'icon-btn remove-image-button';
            removeButton.setAttribute('aria-label', 'Eliminar imagen');
            removeButton.title = 'Eliminar imagen';
            removeButton.textContent = '✕';
            removeButton.addEventListener('click', () => removeProductImageInput(item));

            item.appendChild(input);
            item.appendChild(removeButton);

            return item;
        }

        function addProductImageInput(value = '') {
            const container = getProductImagesContainer();

            if (!container) {
                return null;
            }

            const item = createProductImageInput(value);
            const input = item.querySelector('input');

            if (input) {
                input.removeAttribute('id');
            }

            container.appendChild(item);
            updateProductImageInputsRemoveState();

            if (input && typeof input.focus === 'function') {
                input.focus();
            }

            return input;
        }

        function renderProductImageInputs(values = []) {
            const container = getProductImagesContainer();

            if (!container) {
                return;
            }

            const sanitizedValues = Array.isArray(values)
                ? values.map(sanitizeImageValue).filter(url => url.length > 0)
                : [];

            container.innerHTML = '';

            const valuesToRender = sanitizedValues.length > 0 ? sanitizedValues : [''];

            valuesToRender.forEach(value => {
                const item = createProductImageInput(value);
                container.appendChild(item);
            });

            updateProductImageInputsRemoveState();
            syncProductImagePreviewFromInputs();
        }

        function removeProductImageInput(item) {
            const container = getProductImagesContainer();

            if (!container || !item) {
                return;
            }

            const items = Array.from(container.querySelectorAll('.image-url-item'));

            if (items.length <= 1) {
                const input = item.querySelector('input');
                if (input) {
                    input.value = '';
                }
            } else {
                container.removeChild(item);
            }

            updateProductImageInputsRemoveState();
            syncProductImagePreviewFromInputs();
        }

        function syncProductImagePreviewFromInputs() {
            const imageValues = collectProductImageValues();
            currentImageUrl = imageValues.length > 0 ? imageValues[0] : '';

            const nameInput = document.getElementById('productName');
            const displayName = nameInput && nameInput.value ? nameInput.value : 'Producto Amazonia';

            if (currentImageUrl) {
                updateProductImagePreview(currentImageUrl, displayName);
                return;
            }

            if (currentIconFallback) {
                const placeholder = createIconPlaceholder(currentIconFallback, displayName);
                updateProductImagePreview(placeholder, displayName);
                return;
            }

            updateProductImagePreview(null);
        }

        function handleProductImageInputsChange() {
            syncProductImagePreviewFromInputs();
        }

        function updateLogoPreview(src) {
            const previewImg = document.getElementById('companyLogoPreview');
            const placeholderEl = document.getElementById('companyLogoPlaceholder');

            if (!previewImg || !placeholderEl) {
                return;
            }

            if (src) {
                previewImg.src = src;
                previewImg.style.display = 'block';
                placeholderEl.style.display = 'none';
            } else {
                previewImg.removeAttribute('src');
                previewImg.style.display = 'none';
                placeholderEl.textContent = 'Sin logo seleccionado';
                placeholderEl.style.display = 'block';
            }
        }

        function resetImagePreview() {
            currentImageUrl = '';
            currentIconFallback = '';
            renderProductImageInputs([]);
            const logoData = catalogData && catalogData.config ? catalogData.config.logoData : '';
            updateLogoPreview(logoData || null);
            const logoUrlInput = document.getElementById('companyLogoUrl');
            if (logoUrlInput) {
                logoUrlInput.value = logoData || '';
            }
        }

        function setupImageInput() {
            renderProductImageInputs([]);

            const addImageButton = document.getElementById('addProductImageButton');
            if (addImageButton) {
                addImageButton.addEventListener('click', () => {
                    addProductImageInput('');
                    updateProductImageInputsRemoveState();
                });
            }
        }

        function setupLogoInput() {
            const logoUrlInput = document.getElementById('companyLogoUrl');
            if (!logoUrlInput) {
                return;
            }

            logoUrlInput.addEventListener('input', handleCompanyLogoUrlChange);
        }

        function handleCompanyLogoUrlChange(event) {
            const urlValue = event && event.target ? event.target.value.trim() : '';
            catalogData.config = catalogData.config || {};
            catalogData.config.logoData = urlValue;
            updateLogoPreview(urlValue || null);
            updateCatalogPreview();
        }

        function handleRemoveLogoClick() {
            catalogData.config = catalogData.config || {};
            catalogData.config.logoData = '';
            updateLogoPreview(null);
            updateCatalogPreview();

            const logoInput = document.getElementById('companyLogoUrl');
            if (logoInput) {
                logoInput.value = '';
            }

            saveData();
            showMessage('Logo eliminado correctamente', 'success');
        }

        function registerAdminEventHandlers() {
            const sectionButtons = document.querySelectorAll('button[data-section]');
            sectionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const section = button.getAttribute('data-section');
                    if (section) {
                        showSection(section);
                    }
                });
            });

            const generateButtons = document.querySelectorAll('button[data-action="generate-catalog"]');
            generateButtons.forEach(button => {
                button.addEventListener('click', generateCatalog);
            });

            const updatePreviewButton = document.getElementById('updatePreviewButton');
            if (updatePreviewButton) {
                updatePreviewButton.addEventListener('click', updateCatalogPreview);
            }

            const saveDataButton = document.getElementById('saveDataButton');
            if (saveDataButton) {
                saveDataButton.addEventListener('click', saveData);
            }

            const loadDataButton = document.getElementById('loadDataButton');
            if (loadDataButton) {
                loadDataButton.addEventListener('click', loadData);
            }

            const exportDataButton = document.getElementById('exportDataButton');
            if (exportDataButton) {
                exportDataButton.addEventListener('click', exportData);
            }

            const importDataButton = document.getElementById('importDataButton');
            if (importDataButton) {
                importDataButton.addEventListener('click', importData);
            }

            const clearProcessStatusButton = document.getElementById('clearProcessStatusButton');
            if (clearProcessStatusButton) {
                clearProcessStatusButton.addEventListener('click', () => {
                    clearProcessStatusEntries();
                    showMessage('Historial de exportaciones limpiado.', 'info');
                });
            }

            const saveConfigButton = document.getElementById('saveConfigButton');
            if (saveConfigButton) {
                saveConfigButton.addEventListener('click', saveConfig);
            }

            const removeLogoButton = document.getElementById('removeLogoButton');
            if (removeLogoButton) {
                removeLogoButton.addEventListener('click', handleRemoveLogoClick);
            }

            setupAppearanceControls();

            const openProductModalButton = document.getElementById('openProductModalButton');
            if (openProductModalButton) {
                openProductModalButton.addEventListener('click', () => openProductModal());
            }

            const closeProductModalButton = document.getElementById('closeProductModalButton');
            if (closeProductModalButton) {
                closeProductModalButton.addEventListener('click', closeProductModal);
            }

            const cancelProductButton = document.getElementById('cancelProductButton');
            if (cancelProductButton) {
                cancelProductButton.addEventListener('click', closeProductModal);
            }

            const addFeatureButton = document.getElementById('addFeatureButton');
            if (addFeatureButton) {
                addFeatureButton.addEventListener('click', addFeature);
            }

            const manageCategoriesButton = document.getElementById('manageCategoriesButton');
            if (manageCategoriesButton) {
                manageCategoriesButton.addEventListener('click', openCategoryModal);
            }

            const closeCategoryModalButton = document.getElementById('closeCategoryModalButton');
            if (closeCategoryModalButton) {
                closeCategoryModalButton.addEventListener('click', closeCategoryModal);
            }

            const cancelCategoryButton = document.getElementById('cancelCategoryButton');
            if (cancelCategoryButton) {
                cancelCategoryButton.addEventListener('click', closeCategoryModal);
            }

            const addCategoryButton = document.getElementById('addCategoryButton');
            if (addCategoryButton) {
                addCategoryButton.addEventListener('click', handleAddCategory);
            }

            const saveCategoryChangesButton = document.getElementById('saveCategoryChangesButton');
            if (saveCategoryChangesButton) {
                saveCategoryChangesButton.addEventListener('click', saveCategoryEdits);
            }

            const categoryModal = document.getElementById('categoryModal');
            if (categoryModal) {
                categoryModal.addEventListener('click', event => {
                    if (event.target === categoryModal) {
                        closeCategoryModal();
                    }
                });
            }

            const productsList = document.getElementById('productsList');
            if (productsList) {
                productsList.addEventListener('click', event => {
                    const actionButton = event.target.closest('button[data-action]');
                    if (!actionButton) {
                        return;
                    }

                    const action = actionButton.getAttribute('data-action');
                    const productId = actionButton.getAttribute('data-product-id');

                    if (!productId) {
                        return;
                    }

                    if (action === 'move') {
                        const direction = actionButton.getAttribute('data-direction');
                        if (direction) {
                            moveProduct(productId, direction);
                        }
                    } else if (action === 'edit') {
                        editProduct(productId);
                    } else if (action === 'delete') {
                        deleteProduct(productId);
                    }
                });
            }
        }

        // Initialize on page load
        window.addEventListener('DOMContentLoaded', function() {
            resolveProcessStatusElements();
            toggleProcessStatusEmptyState();
            registerAdminEventHandlers();
            loadData();
            setupProductFormAssistants();
            renderFeatureInputs();
            setupImageInput();
            setupLogoInput();
            resetImagePreview();
            updateCatalogPreview();
        });

        // Load saved data from localStorage
        function loadData() {
            const saved = localStorage.getItem('amazoniaData');

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    console.log('Datos cargados correctamente');

                    if (parsed && typeof parsed === 'object') {
                        catalogData.config = getNormalizedConfig(parsed.config);
                        if (catalogData.config.logoUrl && !catalogData.config.logoData) {
                            catalogData.config.logoData = catalogData.config.logoUrl;
                        }
                        catalogData.categories = Array.isArray(parsed.categories)
                            ? parsed.categories
                            : defaultCategories.map(category => ({ ...category }));
                        catalogData.products = parsed.products && typeof parsed.products === 'object'
                            ? parsed.products
                            : createDefaultProductsMap(catalogData.categories);
                        stripLegacyImageData(catalogData.products);
                        catalogData.categoryInfo = isPlainObject(parsed.categoryInfo) ? parsed.categoryInfo : {};
                    }
                } catch (error) {
                    console.error('No se pudieron leer los datos guardados', error);
                    catalogData = {
                        config: getNormalizedConfig(),
                        categories: defaultCategories.map(category => ({ ...category })),
                        products: createDefaultProductsMap(defaultCategories),
                        categoryInfo: {}
                    };
                }
            } else {
                catalogData = {
                    config: getNormalizedConfig(),
                    categories: defaultCategories.map(category => ({ ...category })),
                    products: createDefaultProductsMap(defaultCategories),
                    categoryInfo: {}
                };
            }

            refreshCategoriesUI({ preserveCurrent: false });
            renderCategoryManagerList();
            loadConfig();
            loadProducts();
        }

        // Save data to localStorage
        function saveData(options = {}) {
            const { silent = false } = options;
            ensureCategoryStructure();
            catalogData.config = getNormalizedConfig(catalogData.config);
            stripLegacyImageData(catalogData.products);
            localStorage.setItem('amazoniaData', JSON.stringify(catalogData));
            if (!silent) {
                showMessage('Datos guardados correctamente', 'success');
            }
            updateCatalogPreview();
        }

        const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function setFieldValidationState(input, isValid) {
            if (!input) {
                return;
            }

            if (isValid) {
                input.classList.remove('input-error');
                input.removeAttribute('aria-invalid');
            } else {
                input.classList.add('input-error');
                input.setAttribute('aria-invalid', 'true');
            }
        }

        function isValidUrl(value) {
            if (typeof value !== 'string') {
                return false;
            }

            const trimmed = value.trim();
            if (!trimmed) {
                return false;
            }

            try {
                const parsed = new URL(trimmed);
                return parsed.protocol === 'https:' || parsed.protocol === 'http:';
            } catch (error) {
                return false;
            }
        }

        function collectConfigValues() {
            const readValue = (id) => {
                const element = document.getElementById(id);
                if (!element || typeof element.value !== 'string') {
                    return '';
                }
                return element.value.trim();
            };

            const readColor = (id) => {
                const element = document.getElementById(id);
                if (!element || typeof element.value !== 'string') {
                    return '';
                }

                return element.value;
            };

            return {
                whatsapp: readValue('whatsapp'),
                email: readValue('email'),
                phone: readValue('phone'),
                address: readValue('address'),
                instagram: readValue('instagram'),
                facebook: readValue('facebook'),
                tiktok: readValue('tiktok'),
                companyName: readValue('companyName'),
                tagline: readValue('tagline'),
                footerMessage: readValue('footerMessage'),
                logoData: readValue('companyLogoUrl'),
                appearance: normalizeAppearance({
                    background: readColor('appearanceBackground'),
                    header: readColor('appearanceHeader'),
                    primary: readColor('appearancePrimary'),
                    accent: readColor('appearanceAccent'),
                    text: readColor('appearanceText'),
                    backgroundImage: readValue('appearanceBackgroundImage'),
                    headerImage: readValue('appearanceHeaderImage'),
                    footerImage: readValue('appearanceFooterImage')
                })
            };
        }

        function getAppearanceDefaultValue(fieldId) {
            const field = APPEARANCE_FIELD_MAP.get(fieldId);
            if (!field) {
                return '#000000';
            }

            return defaultAppearance[field.key];
        }

        function updateAppearanceValueDisplay(fieldId, value) {
            const field = APPEARANCE_FIELD_MAP.get(fieldId);
            if (!field) {
                return;
            }

            const normalizedValue = normalizeColorValue(value, defaultAppearance[field.key]);
            const displayElement = document.querySelector(`.color-value[data-color-for="${fieldId}"]`);
            if (displayElement) {
                displayElement.textContent = normalizedValue.toUpperCase();
            }
        }

        function applyAppearanceToInputs(appearance) {
            const normalized = normalizeAppearance(appearance);

            APPEARANCE_FIELDS.forEach(({ id, key }) => {
                const input = document.getElementById(id);
                if (!input) {
                    return;
                }

                const value = normalized[key] || getAppearanceDefaultValue(id);
                input.value = value;
                updateAppearanceValueDisplay(id, value);
            });

            APPEARANCE_IMAGE_FIELDS.forEach(({ id, key }) => {
                const input = document.getElementById(id);
                if (!input) {
                    return;
                }

                input.value = normalized[key] || '';
            });
        }

        function setupAppearanceControls() {
            APPEARANCE_FIELDS.forEach(({ id }) => {
                const input = document.getElementById(id);
                if (!input) {
                    return;
                }

                input.addEventListener('input', () => {
                    updateAppearanceValueDisplay(id, input.value);
                    updateCatalogPreview();
                });
            });

            APPEARANCE_IMAGE_FIELDS.forEach(({ id }) => {
                const input = document.getElementById(id);
                if (!input) {
                    return;
                }

                input.addEventListener('input', () => {
                    updateCatalogPreview();
                });
            });

            const resetButton = document.getElementById('resetAppearanceButton');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    applyAppearanceToInputs(defaultAppearance);
                    updateCatalogPreview();
                });
            }
        }

        function validateConfiguration({ values, forExport = false } = {}) {
            const configValues = values || collectConfigValues();
            const errors = [];

            const whatsappDigits = (configValues.whatsapp || '').replace(/\D/g, '');
            const whatsappValid = whatsappDigits.length >= 10 && whatsappDigits.length <= 15;
            setFieldValidationState(document.getElementById('whatsapp'), whatsappValid);
            if (!whatsappValid) {
                errors.push('Ingresa un número de WhatsApp válido (entre 10 y 15 dígitos).');
            }

            const emailValid = EMAIL_VALIDATION_REGEX.test(configValues.email || '');
            setFieldValidationState(document.getElementById('email'), emailValid);
            if (!emailValid) {
                errors.push('Ingresa un correo electrónico válido.');
            }

            const hasCompanyName = Boolean(configValues.companyName);
            setFieldValidationState(document.getElementById('companyName'), hasCompanyName);
            if (!hasCompanyName) {
                errors.push('Indica el nombre de la empresa para tu catálogo.');
            }

            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                const phoneValue = configValues.phone || '';
                if (phoneValue) {
                    const phoneDigits = phoneValue.replace(/\D/g, '');
                    const phoneValid = phoneDigits.length >= 7;
                    setFieldValidationState(phoneInput, phoneValid);
                    if (!phoneValid) {
                        errors.push('Verifica que el teléfono de contacto tenga al menos 7 dígitos.');
                    }
                } else {
                    setFieldValidationState(phoneInput, true);
                }
            }

            const socialFields = [
                { id: 'instagram', label: 'Instagram' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'tiktok', label: 'TikTok' }
            ];

            socialFields.forEach(({ id, label }) => {
                const fieldValue = configValues[id] || '';
                const input = document.getElementById(id);

                if (!fieldValue) {
                    setFieldValidationState(input, true);
                    return;
                }

                const isValid = isValidUrl(fieldValue);
                setFieldValidationState(input, isValid);

                if (!isValid) {
                    errors.push(`Ingresa un enlace válido para ${label} (asegúrate de incluir http:// o https://).`);
                }
            });

            const appearanceValues = isPlainObject(configValues.appearance)
                ? configValues.appearance
                : {};

            const appearanceImageFields = [
                { id: 'appearanceBackgroundImage', key: 'backgroundImage', label: 'la imagen de fondo del catálogo' },
                { id: 'appearanceHeaderImage', key: 'headerImage', label: 'la imagen del encabezado' },
                { id: 'appearanceFooterImage', key: 'footerImage', label: 'la imagen del pie de página' }
            ];

            appearanceImageFields.forEach(({ id, key, label }) => {
                const rawValue = appearanceValues[key] || '';
                const input = document.getElementById(id);

                if (!rawValue) {
                    setFieldValidationState(input, true);
                    return;
                }

                const valid = isValidUrl(rawValue);
                setFieldValidationState(input, valid);

                if (!valid) {
                    errors.push(`Ingresa un enlace válido para ${label} (asegúrate de incluir http:// o https://).`);
                }
            });

            if (forExport) {
                ensureCategoryStructure();
                const productsWithoutImage = [];

                if (catalogData && catalogData.products && typeof catalogData.products === 'object') {
                    Object.values(catalogData.products).forEach(productList => {
                        if (!Array.isArray(productList)) {
                            return;
                        }

                        productList.forEach(product => {
                            if (!product) {
                                return;
                            }

                            const imageValues = getNormalizedProductImages(product);
                            const hasImageUrl = imageValues.length > 0;

                            if (!hasImageUrl) {
                                const displayName = typeof product.name === 'string' && product.name.trim().length > 0
                                    ? product.name.trim()
                                    : 'Producto sin nombre';
                                productsWithoutImage.push(displayName);
                            }
                        });
                    });
                }

                if (productsWithoutImage.length > 0) {
                    const previewList = productsWithoutImage.slice(0, 3).join(', ');
                    const remainingCount = productsWithoutImage.length - Math.min(productsWithoutImage.length, 3);
                    const suffix = remainingCount > 0 ? ` y ${remainingCount} producto(s) más` : '';
                    errors.push(`Agrega una imagen o URL válida para los productos: ${previewList}${suffix}.`);
                }
            }

            configValues.appearance = normalizeAppearance(configValues.appearance);

            return {
                valid: errors.length === 0,
                errors,
                values: configValues
            };
        }

        function showValidationErrors(errors) {
            if (!Array.isArray(errors) || errors.length === 0) {
                return;
            }

            const uniqueErrors = Array.from(new Set(errors));
            showMessage(uniqueErrors[0], 'error');

            const statusMessage = document.getElementById('statusMessage');
            if (statusMessage) {
                statusMessage.textContent = uniqueErrors.join(' • ');
            }
        }

        // Load configuration
        function loadConfig() {
            catalogData.config = getNormalizedConfig(catalogData.config);
            document.getElementById('whatsapp').value = catalogData.config.whatsapp || '';
            document.getElementById('email').value = catalogData.config.email || '';
            document.getElementById('phone').value = catalogData.config.phone || '';
            document.getElementById('address').value = catalogData.config.address || '';
            document.getElementById('instagram').value = catalogData.config.instagram || '';
            document.getElementById('facebook').value = catalogData.config.facebook || '';
            document.getElementById('tiktok').value = catalogData.config.tiktok || '';
            document.getElementById('companyName').value = catalogData.config.companyName || '';
            document.getElementById('tagline').value = catalogData.config.tagline || '';
            document.getElementById('footerMessage').value = catalogData.config.footerMessage || '';
            const logoValue = catalogData.config.logoData || '';
            const logoUrlInput = document.getElementById('companyLogoUrl');
            if (logoUrlInput) {
                logoUrlInput.value = logoValue;
            }
            applyAppearanceToInputs(catalogData.config.appearance);
            updateLogoPreview(logoValue || null);
            updateCatalogPreview();
        }

        // Save configuration
        function saveConfig(event) {
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            const configValues = collectConfigValues();
            const validation = validateConfiguration({ values: configValues });

            if (!validation.valid) {
                showValidationErrors(validation.errors);
                return;
            }

            catalogData.config = getNormalizedConfig(validation.values);
            saveData();
        }

        function isElementFocusable(element) {
            if (!element) {
                return false;
            }

            if (element.hasAttribute('disabled')) {
                return false;
            }

            const ariaHidden = element.getAttribute('aria-hidden');
            if (ariaHidden === 'true') {
                return false;
            }

            const tabIndexAttribute = element.getAttribute('tabindex');
            if (tabIndexAttribute !== null && parseInt(tabIndexAttribute, 10) < 0) {
                return false;
            }

            if (element.offsetParent === null && element !== document.activeElement) {
                if (element.getClientRects().length === 0) {
                    return false;
                }
            }

            return true;
        }

        function getModalFocusableElements(modal) {
            if (!modal) {
                return [];
            }

            const focusableElements = Array.from(modal.querySelectorAll(MODAL_FOCUSABLE_SELECTOR));
            return focusableElements.filter(isElementFocusable);
        }

        function createModalKeydownHandler(modal) {
            return function handleModalKeydown(event) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeProductModal();
                    return;
                }

                if (event.key !== 'Tab') {
                    return;
                }

                const focusableElements = getModalFocusableElements(modal);

                if (focusableElements.length === 0) {
                    event.preventDefault();
                    return;
                }

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (!modal.contains(document.activeElement)) {
                    event.preventDefault();
                    firstElement.focus();
                    return;
                }

                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            };
        }

        // Show section
        function getNavigationSections() {
            return {
                config: {
                    element: document.getElementById('configSection'),
                    button: document.querySelector('button[data-section="config"]'),
                    label: 'Configuración general'
                },
                products: {
                    element: document.getElementById('productsSection'),
                    button: document.querySelector('button[data-section="products"]'),
                    label: 'Gestión de productos'
                }
            };
        }

        function announceSectionChange(sectionKey, sectionConfig) {
            const liveRegion = document.getElementById('navigationStatus');
            if (!liveRegion || !sectionConfig) {
                return;
            }

            const announcement = `Sección "${sectionConfig.label}" activa.`;
            if (liveRegion.textContent === announcement) {
                liveRegion.textContent = '';
            }

            const updateLiveRegion = () => {
                liveRegion.textContent = announcement;
            };

            if (typeof window.requestAnimationFrame === 'function') {
                window.requestAnimationFrame(updateLiveRegion);
            } else {
                setTimeout(updateLiveRegion, 0);
            }
        }

        function showSection(section) {
            const sections = getNavigationSections();
            const targetSection = sections[section] ? section : 'config';

            Object.keys(sections).forEach(sectionKey => {
                const { element, button } = sections[sectionKey];
                const isActive = sectionKey === targetSection;

                if (element) {
                    if (isActive) {
                        element.removeAttribute('hidden');
                        element.setAttribute('aria-hidden', 'false');
                        element.style.removeProperty('display');
                    } else {
                        element.setAttribute('hidden', '');
                        element.setAttribute('aria-hidden', 'true');
                        element.style.display = 'none';
                    }
                }

                if (button) {
                    button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                }
            });

            announceSectionChange(targetSection, sections[targetSection]);

            if (targetSection === 'products') {
                loadProducts();
            }
        }

        // Show category (backward compatibility)
        function showCategory(event, category) {
            setCurrentCategory(category);
        }

        function createFeatureRow(value = '', placeholder = 'Ej: 30cm x 25cm') {
            const wrapper = document.createElement('div');
            wrapper.className = 'feature-input-group';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            if (!value) {
                input.placeholder = placeholder;
            }

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'remove-feature';
            removeButton.textContent = '✕';
            removeButton.addEventListener('click', () => removeFeature(removeButton));

            wrapper.appendChild(input);
            wrapper.appendChild(removeButton);

            return wrapper;
        }

        function renderFeatureInputs(features = []) {
            const featuresList = document.getElementById('featuresList');
            if (!featuresList) return;

            featuresList.innerHTML = '';

            if (!Array.isArray(features) || features.length === 0) {
                featuresList.appendChild(createFeatureRow());
                return;
            }

            features.forEach(feature => {
                featuresList.appendChild(createFeatureRow(feature));
            });
        }

        // Load products
        function loadProducts() {
            const container = document.getElementById('productsList');
            ensureCategoryStructure();

            if (!container) {
                return;
            }

            if (!currentCategory) {
                container.innerHTML = '<p style="text-align: center; color: #999">Crea una categoría para comenzar a añadir productos.</p>';
                updateCatalogPreview();
                return;
            }

            const products = catalogData.products[currentCategory] || [];

            if (products.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999">No hay productos en esta categoría. Haz clic en "Añadir Producto" para comenzar.</p>';
                updateCatalogPreview();
                return;
            }

            container.innerHTML = products
                .map((product, index) => {
                    const disableUp = index === 0 ? 'disabled' : '';
                    const disableDown = index === products.length - 1 ? 'disabled' : '';
                    const rawName = typeof product.name === 'string' && product.name.trim()
                        ? product.name
                        : 'Producto sin nombre';
                    const productNameHtml = escapeHtml(rawName);
                    const rawShortDesc = typeof product.shortDesc === 'string' ? product.shortDesc : '';
                    const shortDescHtml = escapeHtml(rawShortDesc);
                    const formattedPrice = formatCurrencyCOP(product.price);
                    const priceHtml = escapeHtml(formattedPrice);
                    const actionLabelSource = rawName.trim() ? rawName.trim() : 'este producto';
                    const actionLabelAttr = escapeHtml(actionLabelSource);
                    const sanitizedFeatures = Array.isArray(product.features)
                        ? product.features
                            .map(feature => (typeof feature === 'string' ? feature : ''))
                            .filter(feature => feature.length > 0)
                            .map(feature => escapeHtml(feature))
                        : [];
                    const featuresAttr = sanitizedFeatures.join('||');
                    const imageSrc = getProductImageSource(product);
                    const imageAlt = escapeHtml(`Vista previa de ${rawName}`);
                    return `
                <div class="product-item" data-product-id="${product.id}" data-short-desc="${shortDescHtml}" data-features="${featuresAttr}">
                    <div class="order-controls">
                        <button type="button" class="icon-btn move-btn" data-action="move" data-direction="up" data-product-id="${product.id}" aria-label="Mover ${actionLabelAttr} hacia arriba" title="Mover ${actionLabelAttr} hacia arriba" ${disableUp}>↑</button>
                        <button type="button" class="icon-btn move-btn" data-action="move" data-direction="down" data-product-id="${product.id}" aria-label="Mover ${actionLabelAttr} hacia abajo" title="Mover ${actionLabelAttr} hacia abajo" ${disableDown}>↓</button>
                    </div>
                    <div class="product-thumb">
                        <img src="${imageSrc}" alt="${imageAlt}">
                    </div>
                    <div class="product-info">
                        <div class="product-name">${productNameHtml}</div>
                        <div class="product-price">${priceHtml}</div>
                    </div>
                    <div class="product-actions">
                        <button type="button" class="icon-btn edit-btn" data-action="edit" data-product-id="${product.id}" aria-label="Editar ${actionLabelAttr}" title="Editar ${actionLabelAttr}">✏️</button>
                        <button type="button" class="icon-btn delete-btn" data-action="delete" data-product-id="${product.id}" aria-label="Eliminar ${actionLabelAttr}" title="Eliminar ${actionLabelAttr}">🗑️</button>
                    </div>
                </div>`;
                })
                .join('');

            updateCatalogPreview();
        }

        function moveProduct(productId, direction) {
            ensureCategoryStructure();
            const products = catalogData.products[currentCategory] || [];
            const currentIndex = products.findIndex(product => product.id === productId);

            if (currentIndex === -1) {
                return;
            }

            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

            if (targetIndex < 0 || targetIndex >= products.length) {
                return;
            }

            const temp = products[currentIndex];
            products[currentIndex] = products[targetIndex];
            products[targetIndex] = temp;

            catalogData.products[currentCategory] = products;
            saveData();
            loadProducts();
        }

        // Open product modal
        function openProductModal(productId = null) {
            ensureCategoryStructure();
            const modal = document.getElementById('productModal');
            const form = document.getElementById('productForm');

            if (!modal || !form) {
                return;
            }

            editingProductId = productId;
            lastFocusedElement = document.activeElement;

            if (modalKeydownHandler) {
                modal.removeEventListener('keydown', modalKeydownHandler);
                modalKeydownHandler = null;
            }

            if (!Array.isArray(catalogData.categories) || catalogData.categories.length === 0) {
                alert('Crea al menos una categoría antes de añadir productos.');
                return;
            }

            if (productId) {
                // Find product
                let product = null;
                let productCategory = null;
                for (let cat in catalogData.products) {
                    product = catalogData.products[cat].find(p => p.id === productId);
                    if (product) {
                        productCategory = cat;
                        break;
                    }
                }

                if (product) {
                    document.getElementById('modalTitle').textContent = 'Editar Producto';
                    renderCategoryOptions(productCategory || currentCategory);
                    document.getElementById('productCategory').value = productCategory || currentCategory;
                    document.getElementById('productName').value = product.name;
                    document.getElementById('productShortDesc').value = product.shortDesc;
                    document.getElementById('productLongDesc').value = product.longDesc || '';
                    const productPriceInput = document.getElementById('productPrice');
                    if (productPriceInput) {
                        productPriceInput.value = formatCurrencyCOP(product.price);
                    }
                    document.getElementById('productSpecs').value = product.specs || '';
                    document.getElementById('productId').value = productId;

                    currentIconFallback = product.icon || '';
                    const imageValues = getNormalizedProductImages(product);
                    renderProductImageInputs(imageValues);
                    currentImageUrl = imageValues.length > 0 ? imageValues[0] : '';
                    renderFeatureInputs(product.features);
                }
            } else {
                document.getElementById('modalTitle').textContent = 'Añadir Producto';
                form.reset();
                renderCategoryOptions(currentCategory);
                document.getElementById('productCategory').value = currentCategory;
                document.getElementById('productId').value = '';
                currentImageUrl = '';
                currentIconFallback = '';
                renderProductImageInputs([]);
                updateProductImagePreview(null);
                renderFeatureInputs();
            }

            refreshProductFormAssistants();

            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');

            const focusTarget = (() => {
                const nameInput = document.getElementById('productName');
                if (isElementFocusable(nameInput)) {
                    return nameInput;
                }

                const focusableElements = getModalFocusableElements(modal);
                if (focusableElements.length > 0) {
                    return focusableElements[0];
                }

                return modal;
            })();

            if (focusTarget && typeof focusTarget.focus === 'function') {
                focusTarget.focus();
            }

            modalKeydownHandler = createModalKeydownHandler(modal);
            modal.addEventListener('keydown', modalKeydownHandler);
        }

        // Close modal
        function closeProductModal() {
            const modal = document.getElementById('productModal');
            const form = document.getElementById('productForm');

            if (!modal || !form) {
                return;
            }

            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');

            if (modalKeydownHandler) {
                modal.removeEventListener('keydown', modalKeydownHandler);
                modalKeydownHandler = null;
            }

            form.reset();
            editingProductId = null;
            currentImageUrl = '';
            currentIconFallback = '';
            renderProductImageInputs([]);
            updateProductImagePreview(null);
            renderFeatureInputs();
            refreshProductFormAssistants();

            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
            lastFocusedElement = null;
        }

        // Add feature input
        function addFeature() {
            const featuresList = document.getElementById('featuresList');
            if (!featuresList) return;

            featuresList.appendChild(createFeatureRow('', 'Nueva característica'));
        }

        // Remove feature input
        function removeFeature(button) {
            const featuresList = document.getElementById('featuresList');
            if (!featuresList) return;

            if (featuresList.children.length > 1) {
                featuresList.removeChild(button.parentElement);
            } else {
                const input = button.parentElement.querySelector('input');
                if (input) {
                    input.value = '';
                    input.placeholder = 'Ej: 30cm x 25cm';
                }
            }
        }

        // Edit product
        function editProduct(productId) {
            openProductModal(productId);
        }

        // Delete product
        function deleteProduct(productId) {
            ensureCategoryStructure();

            if (!currentCategory) {
                alert('No hay una categoría seleccionada para eliminar productos.');
                return;
            }

            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                catalogData.products[currentCategory] = catalogData.products[currentCategory].filter(p => p.id !== productId);
                saveData();
                loadProducts();
            }
        }

        // Handle product form submission
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();

            ensureCategoryStructure();
            const category = document.getElementById('productCategory').value;
            if (!category) {
                alert('Selecciona una categoría válida para el producto.');
                return;
            }
            const features = Array.from(document.querySelectorAll('#featuresList input'))
                .map(input => input.value)
                .filter(value => value.trim() !== '');

            const imageValues = collectProductImageValues();
            const priceInput = document.getElementById('productPrice');
            const normalizedPrice = formatCurrencyCOP(priceInput ? priceInput.value : '');

            const productData = {
                id: editingProductId || 'product_' + Date.now(),
                name: document.getElementById('productName').value,
                shortDesc: document.getElementById('productShortDesc').value,
                longDesc: document.getElementById('productLongDesc').value,
                price: normalizedPrice,
                features: features,
                specs: document.getElementById('productSpecs').value
            };

            if (Array.isArray(imageValues) && imageValues.length > 0) {
                productData.images = imageValues;
                productData.image = imageValues[0];
            } else {
                productData.images = [];
            }

            normalizeProductImages(productData);

            if (currentIconFallback) {
                productData.icon = currentIconFallback;
            }
            
            if (!catalogData.products[category]) {
                catalogData.products[category] = [];
            }
            
            let oldCategoryId = null;
            let oldIndex = -1;

            if (editingProductId) {
                // Preserve original position before removing the product
                for (const [catId, products] of Object.entries(catalogData.products)) {
                    const foundIndex = products.findIndex(p => p.id === editingProductId);
                    if (foundIndex !== -1) {
                        oldCategoryId = catId;
                        oldIndex = foundIndex;
                        break;
                    }
                }

                // Remove from all categories
                for (let cat in catalogData.products) {
                    catalogData.products[cat] = catalogData.products[cat].filter(p => p.id !== editingProductId);
                }
            }

            const stayingInSameCategory = editingProductId && oldCategoryId === category;

            // Add to new/current category
            if (stayingInSameCategory && oldIndex > -1 && oldIndex <= catalogData.products[category].length) {
                catalogData.products[category].splice(oldIndex, 0, productData);
            } else {
                catalogData.products[category].push(productData);
            }

            saveData();
            currentCategory = category;
            loadProducts();
            closeProductModal();
            showMessage('Producto guardado correctamente', 'success');
            updateCatalogPreview();
        });

        // Show message
        function showMessage(message, type = 'success') {
            const statusMessage = document.getElementById('statusMessage');
            if (statusMessage) {
                statusMessage.textContent = message;
                statusMessage.className = type ? `status-message ${type}` : 'status-message';
            }

            const notificationContainer = document.getElementById('notificationContainer');
            if (!notificationContainer) {
                return;
            }

            const notification = document.createElement('div');
            notification.className = 'notification ' + type;
            notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
            notification.textContent = message;

            notificationContainer.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('hide');
            }, 2500);

            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Export data
        function exportData() {
            const processEntryId = createProcessStatusEntry('export-data', 'Preparando datos para exportar…');
            setExportButtonDisabled(true);
            showMessage('Preparando archivo de exportación...', 'info');

            try {
                updateProcessStatusEntry(processEntryId, {
                    detail: 'Serializando catálogo y configuraciones…'
                });
                const dataStr = JSON.stringify(catalogData, null, 2);

                updateProcessStatusEntry(processEntryId, {
                    detail: 'Generando archivo descargable…'
                });
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

                const exportFileDefaultName = 'amazonia_datos_' + new Date().toISOString().split('T')[0] + '.json';

                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                updateProcessStatusEntry(processEntryId, {
                    state: 'success',
                    detail: 'Archivo JSON exportado correctamente.'
                });
                showMessage('Datos exportados correctamente', 'success');
            } catch (error) {
                console.error('No se pudieron exportar los datos', error);
                updateProcessStatusEntry(processEntryId, {
                    state: 'error',
                    detail: 'No se pudo completar la exportación. Revisa la información y vuelve a intentarlo.'
                });
                showMessage('Error al exportar los datos', 'error');
            } finally {
                setExportButtonDisabled(false);
            }
        }

        // Import data
        function importData() {
            document.getElementById('importFile').click();
        }

        // Handle file import
        document.getElementById('importFile').addEventListener('change', function(e) {
            const inputElement = e.target;
            const file = inputElement.files && inputElement.files[0];

            if (!file) {
                inputElement.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const parsed = JSON.parse(event.target.result);

                    if (parsed && typeof parsed === 'object') {
                        catalogData.config = getNormalizedConfig(parsed.config);
                        catalogData.categories = Array.isArray(parsed.categories)
                            ? parsed.categories
                            : defaultCategories.map(category => ({ ...category }));
                        catalogData.products = parsed.products && typeof parsed.products === 'object'
                            ? parsed.products
                            : createDefaultProductsMap(catalogData.categories);
                        catalogData.categoryInfo = isPlainObject(parsed.categoryInfo) ? parsed.categoryInfo : {};

                        refreshCategoriesUI({ preserveCurrent: false });
                        renderCategoryManagerList();
                        loadConfig();
                        loadProducts();
                        saveData();
                        showMessage('Datos importados correctamente', 'success');
                    } else {
                        throw new Error('Formato de datos no válido');
                    }
                } catch (error) {
                    showMessage('Error al importar los datos', 'error');
                } finally {
                    inputElement.value = '';
                }
            };
            reader.onerror = function() {
                showMessage('Error al importar los datos', 'error');
                inputElement.value = '';
            };
            reader.readAsText(file);
        });

        // Generate Catalog
        function generateCatalog() {
            const processEntryId = createProcessStatusEntry('generate-catalog', 'Validando configuración antes de generar…');
            setGenerateButtonsDisabled(true);
            showMessage('Validando información del catálogo...', 'info');

            try {
                const validation = validateConfiguration({ forExport: true });

                if (!validation.valid) {
                    updateProcessStatusEntry(processEntryId, {
                        state: 'error',
                        detail: 'Faltan datos obligatorios. Revisa la configuración y vuelve a intentarlo.'
                    });
                    showValidationErrors(validation.errors);
                    showMessage('Corrige los campos obligatorios antes de generar el catálogo.', 'error');
                    return;
                }

                updateProcessStatusEntry(processEntryId, {
                    detail: 'Guardando configuración y preparando datos…'
                });
                catalogData.config = getNormalizedConfig(validation.values);

                // First save current data
                saveData();

                updateProcessStatusEntry(processEntryId, {
                    detail: 'Compilando catálogo con tus productos…'
                });
                // Generate the HTML content
                const htmlContent = generateCatalogHTML(catalogData.config);

                updateProcessStatusEntry(processEntryId, {
                    detail: 'Generando archivo para la descarga…'
                });
                // Create download link
                const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'catalogo_amazonia_' + new Date().toISOString().split('T')[0] + '.html';
                link.click();

                // Clean up
                URL.revokeObjectURL(url);

                updateProcessStatusEntry(processEntryId, {
                    state: 'success',
                    detail: 'Descarga completada. El catálogo está listo.'
                });
                showMessage('¡Catálogo generado correctamente! Revisa tu carpeta de descargas.', 'success');
            } catch (error) {
                console.error('No se pudo generar el catálogo', error);
                updateProcessStatusEntry(processEntryId, {
                    state: 'error',
                    detail: 'Ocurrió un error inesperado al generar el catálogo. Inténtalo nuevamente.'
                });
                showMessage('Error al generar el catálogo. Inténtalo de nuevo.', 'error');
            } finally {
                setGenerateButtonsDisabled(false);
            }
        }

        function updateCatalogPreview() {
            const previewFrame = document.getElementById('catalogPreview');
            if (!previewFrame) {
                return;
            }

            try {
                const hasConfigForm = Boolean(document.getElementById('companyName'));
                const previewSource = hasConfigForm
                    ? { ...catalogData.config, ...collectConfigValues() }
                    : catalogData.config;
                const previewConfig = getNormalizedConfig(previewSource);
                const htmlContent = generateCatalogHTML(previewConfig);
                if ('srcdoc' in previewFrame) {
                    previewFrame.srcdoc = htmlContent;
                } else {
                    previewFrame.innerHTML = htmlContent;
                }
            } catch (error) {
                console.error('No se pudo actualizar la vista previa del catálogo', error);
            }
        }

        // Expose functions for inline handlers (backward compatibility)
        window.showSection = showSection;
        window.generateCatalog = generateCatalog;
        window.updateCatalogPreview = updateCatalogPreview;
        window.saveData = saveData;
        window.loadData = loadData;
        window.exportData = exportData;
        window.importData = importData;
        window.saveConfig = saveConfig;
        window.showCategory = showCategory;
        window.setCurrentCategory = setCurrentCategory;
        window.openProductModal = openProductModal;
        window.closeProductModal = closeProductModal;
        window.closeModal = closeProductModal;
        window.openCategoryModal = openCategoryModal;
        window.closeCategoryModal = closeCategoryModal;
        window.addFeature = addFeature;
        window.moveProduct = moveProduct;
        window.editProduct = editProduct;
        window.deleteProduct = deleteProduct;

        // Generate catalog HTML
        function generateCatalogHTML(configOverride) {
            ensureCategoryStructure();
            const config = getNormalizedConfig(configOverride || catalogData.config);
            const products = catalogData.products;
            const categories = Array.isArray(catalogData.categories) ? catalogData.categories : [];
            const serializeForScript = (value) => {
                const jsonString = JSON.stringify(value);

                if (typeof jsonString !== 'string') {
                    return 'null';
                }

                return jsonString
                    .replace(/</g, '\\u003C')
                    .replace(/>/g, '\\u003E')
                    .replace(/&/g, '\\u0026')
                    .replace(/\u2028/g, '\\u2028')
                    .replace(/\u2029/g, '\\u2029');
            };
            const legacyCategoryResolver = createLegacyCategoryResolver(catalogData.categoryInfo);
            const resolvedCategories = categories.map((category, index) => {
                const normalized = isPlainObject(category)
                    ? category
                    : (typeof category === 'string'
                        ? { id: generateCategoryId(category), name: category }
                        : {});

                const candidateValues = [
                    typeof category === 'string' ? category : '',
                    typeof normalized.id === 'string' ? normalized.id : '',
                    typeof normalized.name === 'string' ? normalized.name : '',
                    typeof normalized.title === 'string' ? normalized.title : '',
                    typeof normalized.label === 'string' ? normalized.label : ''
                ].filter(Boolean);

                const metadata = legacyCategoryResolver.lookup(candidateValues) || {};

                let categoryId = typeof normalized.id === 'string' && normalized.id
                    ? normalized.id
                    : '';

                if (!categoryId) {
                    const fallbackSource = metadata.title || normalized.name || candidateValues[0] || `categoria-${index + 1}`;
                    categoryId = generateCategoryId(fallbackSource) || `categoria-${index + 1}`;
                }

                const titleCandidates = [
                    typeof normalized.name === 'string' ? normalized.name.trim() : '',
                    typeof normalized.title === 'string' ? normalized.title.trim() : '',
                    metadata.title || ''
                ].filter(Boolean);
                const title = titleCandidates.length > 0 ? titleCandidates[0] : formatCategoryLabel(categoryId);

                const iconCandidates = [
                    typeof normalized.icon === 'string' ? normalized.icon.trim() : '',
                    typeof normalized.emoji === 'string' ? normalized.emoji.trim() : '',
                    metadata.icon || ''
                ].filter(Boolean);
                const icon = iconCandidates.length > 0 ? iconCandidates[0] : '📦';

                const descriptionCandidates = [
                    typeof normalized.description === 'string' ? normalized.description.trim() : '',
                    typeof normalized.desc === 'string' ? normalized.desc.trim() : '',
                    metadata.description || ''
                ].filter(value => typeof value === 'string');
                const description = descriptionCandidates.find(value => value.trim().length > 0) || '';

                return {
                    id: categoryId,
                    title,
                    icon,
                    description
                };
            });

            const theme = buildThemeTokens(config.appearance);

            const trimmedConfig = {
                whatsapp: (config.whatsapp || '').trim(),
                email: (config.email || '').trim(),
                phone: (config.phone || '').trim(),
                address: (config.address || '').trim(),
                instagram: (config.instagram || '').trim(),
                facebook: (config.facebook || '').trim(),
                tiktok: (config.tiktok || '').trim(),
                companyName: config.companyName || '',
                tagline: config.tagline || '',
                footerMessage: config.footerMessage || '',
                logoData: typeof config.logoData === 'string' ? config.logoData.trim() : ''
            };

            const companyNameHtml = escapeHtml(trimmedConfig.companyName);
            const taglineHtml = escapeHtml(trimmedConfig.tagline);
            const footerMessageHtml = escapeHtml(trimmedConfig.footerMessage);
            const logoAltName = companyNameHtml || 'la empresa';
            const sanitizedLogoData = trimmedConfig.logoData ? escapeHtml(trimmedConfig.logoData) : '';
            const logoContainerStyle = trimmedConfig.logoData ? '' : 'display: none;';
            const headerLogoMarkup = `
        <div class="logo-container" id="headerLogoContainer" style="${logoContainerStyle}">
            <img id="headerLogo" src="${sanitizedLogoData}" alt="Logo de ${logoAltName}">
        </div>`;
            const taglineMarkup = trimmedConfig.tagline
                ? `<p class="tagline" id="headerTagline">${taglineHtml}</p>`
                : `<p class="tagline" id="headerTagline" style="display: none;"></p>`;

            const categoriesWithProducts = resolvedCategories.filter(category => {
                const list = products && products[category.id];
                return Array.isArray(list) && list.length > 0;
            });

            const firstCategoryWithProducts = categoriesWithProducts[0] ? categoriesWithProducts[0].id : null;

            // Generate products HTML for each category
            let productsHTML = '';
            let productDataJS = {};

            resolvedCategories.forEach(category => {
                const categoryProducts = products && products[category.id] ? products[category.id] : [];
                if (categoryProducts.length > 0) {
                    const categoryTitle = escapeHtml(category.title || formatCategoryLabel(category.id));
                    const categoryDescription = escapeHtml(category.description || '');
                    const categoryIcon = category.icon || '🛠️';
                    const descriptionMarkup = categoryDescription ? `<p class="category-description">${categoryDescription}</p>` : '';

                    productsHTML += `
        <!-- ${categoryTitle} Category -->
        <div class="category${category.id === firstCategoryWithProducts ? ' active' : ''}" id="${category.id}">
            <h2 class="category-title">${categoryTitle}</h2>
            ${descriptionMarkup}
            <div class="products-grid">`;

                    categoryProducts.forEach(product => {
                        const rawName = typeof product.name === 'string' && product.name.trim()
                            ? product.name
                            : 'Producto Amazonia';
                        const productNameHtml = escapeHtml(rawName);
                        const rawShortDesc = typeof product.shortDesc === 'string' && product.shortDesc.trim()
                            ? product.shortDesc
                            : 'Información disponible próximamente.';
                        const productShortDescHtml = escapeHtml(rawShortDesc);
                        const sanitizedFeatures = Array.isArray(product.features)
                            ? product.features
                                .map(feature => (typeof feature === 'string' ? feature : ''))
                                .filter(feature => feature.length > 0)
                                .map(feature => `<span class="feature-tag">${escapeHtml(feature)}</span>`)
                            : [];
                        const featuresHtml = sanitizedFeatures.join('');
                        const imageList = getNormalizedProductImages(product);
                        const imageSrc = imageList.length > 0
                            ? imageList[0]
                            : getProductImageSource(product, categoryIcon);
                        const imageAlt = escapeHtml(`Imagen de ${rawName}`);
                        const formattedPrice = formatCurrencyCOP(product.price);
                        const productPriceHtml = escapeHtml(formattedPrice);
                        productsHTML += `
                <div class="product-card" onclick="openModal('${product.id}')">
                    <div class="product-image">
                        <img src="${imageSrc}" alt="${imageAlt}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${productNameHtml}</h3>
                        <p class="product-description">${productShortDescHtml}</p>
                        <div class="product-features">${featuresHtml}</div>
                        <p class="product-price">${productPriceHtml}</p>
                    </div>
                </div>`;

                        // Add to product data for modal
                        const specs = product.specs ? product.specs.split('\n').map(s => {
                            const separatorIndex = typeof s === 'string' ? s.indexOf(':') : -1;
                            if (separatorIndex === -1) {
                                return ['', ''];
                            }

                            const label = s.slice(0, separatorIndex).trim();
                            const value = s.slice(separatorIndex + 1).trim();
                            return label ? [label, value] : ['', ''];
                        }).filter(s => s[0]) : [];
                        const sanitizedSpecs = specs.map(spec => [
                            escapeHtml(spec[0]),
                            escapeHtml(spec[1])
                        ]);

                        productDataJS[product.id] = {
                            title: rawName,
                            image: imageSrc,
                            images: imageList,
                            alt: `Imagen de ${rawName}`,
                            description: typeof product.longDesc === 'string' && product.longDesc.trim()
                                ? product.longDesc
                                : rawShortDesc,
                            specs: sanitizedSpecs
                        };
                    });

                    productsHTML += `
            </div>
        </div>`;
                }
            });

            const navButtonsHTML = categoriesWithProducts
                .map(category => {
                    const isActive = category.id === firstCategoryWithProducts;
                    const label = `${category.icon || '📦'} ${category.title || formatCategoryLabel(category.id)}`;
                    return `<button class="nav-btn${isActive ? ' active' : ''}" data-category="${category.id}" onclick="showCategory(event, '${category.id}')">${escapeHtml(label)}</button>`;
                })
                .join('');

            const modalCTAButtons = [
                trimmedConfig.whatsapp ? `<button class="cta-button" id="modalWhatsAppButton" onclick="contactWhatsApp()">💬 WhatsApp</button>` : '',
                trimmedConfig.email ? `<button class="cta-button" id="modalQuoteButton" onclick="requestQuote()">📋 Solicitar Cotización</button>` : ''
            ].filter(Boolean).join('');

            const defaultCompanyNameHtml = escapeHtml(defaultConfig.companyName || 'Amazonia Concrete');
            const headerTitleText = companyNameHtml || defaultCompanyNameHtml;
            const footerCompanyName = companyNameHtml || defaultCompanyNameHtml;

            const sanitizedWhatsappNumber = trimmedConfig.whatsapp.replace(/\D/g, '');
            const instagramUrlRaw = trimmedConfig.instagram;
            const facebookUrlRaw = trimmedConfig.facebook;
            const tiktokUrlRaw = trimmedConfig.tiktok;

            const whatsappLinkHref = sanitizedWhatsappNumber ? `https://wa.me/${sanitizedWhatsappNumber}` : '#';
            const whatsappLinkStyle = sanitizedWhatsappNumber ? '' : 'display: none;';
            const instagramLinkHref = instagramUrlRaw ? escapeHtml(instagramUrlRaw) : '#';
            const instagramLinkStyle = instagramUrlRaw ? '' : 'display: none;';
            const facebookLinkHref = facebookUrlRaw ? escapeHtml(facebookUrlRaw) : '#';
            const facebookLinkStyle = facebookUrlRaw ? '' : 'display: none;';
            const tiktokLinkHref = tiktokUrlRaw ? escapeHtml(tiktokUrlRaw) : '#';
            const tiktokLinkStyle = tiktokUrlRaw ? '' : 'display: none;';

            const hasSocialLinks = Boolean(sanitizedWhatsappNumber || instagramUrlRaw || facebookUrlRaw || tiktokUrlRaw);
            const socialLinksContainerStyle = hasSocialLinks ? '' : 'display: none;';

            const socialLinksMarkup = `
                <div class="social-links" id="footerSocialLinks" aria-label="Redes sociales" style="${socialLinksContainerStyle}">
                    <a id="footerSocialWhatsApp" class="social-link social-link--whatsapp" href="${whatsappLinkHref}" target="_blank" rel="noopener noreferrer" style="${whatsappLinkStyle}">
                        ${getSocialIconSvg('whatsapp')}
                        <span class="sr-only">WhatsApp</span>
                    </a>
                    <a id="footerSocialInstagram" class="social-link social-link--instagram" href="${instagramLinkHref}" target="_blank" rel="noopener noreferrer" style="${instagramLinkStyle}">
                        ${getSocialIconSvg('instagram')}
                        <span class="sr-only">Instagram</span>
                    </a>
                    <a id="footerSocialFacebook" class="social-link social-link--facebook" href="${facebookLinkHref}" target="_blank" rel="noopener noreferrer" style="${facebookLinkStyle}">
                        ${getSocialIconSvg('facebook')}
                        <span class="sr-only">Facebook</span>
                    </a>
                    <a id="footerSocialTiktok" class="social-link social-link--tiktok" href="${tiktokLinkHref}" target="_blank" rel="noopener noreferrer" style="${tiktokLinkStyle}">
                        ${getSocialIconSvg('tiktok')}
                        <span class="sr-only">TikTok</span>
                    </a>
                </div>`;

            // Generate the complete HTML
            return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyNameHtml || defaultCompanyNameHtml} - Catálogo Digital</title>
    <style>
        ${getCatalogStyles(theme)}
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div class="loader" id="loader">
        <svg class="leaf-spinner" viewBox="0 0 100 100">
            <path d="M50 20 Q30 40 50 60 Q70 40 50 20" fill="${theme.loaderPrimary}"/>
            <path d="M50 40 Q30 60 50 80 Q70 60 50 40" fill="${theme.loaderSecondary}"/>
        </svg>
    </div>

    <!-- Header -->
    <header>
        <div class="header-inner">
            ${headerLogoMarkup}
            <div class="header-content">
                <h1 id="headerTitle">${headerTitleText}</h1>
                ${taglineMarkup}
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <div class="nav-container">
        <nav>
            <div class="nav-buttons" id="navButtons">
                ${navButtonsHTML}
            </div>
        </nav>
    </div>

    <!-- Main Container -->
    <div class="container">
        ${productsHTML}
        <p class="category-description" id="emptyCatalogMessage" style="display: none; text-align: center;">No hay productos disponibles en este momento. Vuelve pronto para descubrir las novedades.</p>
    </div>

    <!-- Modal -->
    <div class="modal" id="productModal">
        <div class="modal-content">
            <button class="close-modal" onclick="closeModal()">✕</button>
            <div class="modal-header">
                <h2 id="modalTitle">Título del Producto</h2>
            </div>
            <div class="modal-body">
                <div class="modal-grid">
                    <div class="modal-image">
                        <button class="carousel-button carousel-button--prev" id="modalPrevButton" aria-label="Imagen anterior">‹</button>
                        <div class="modal-image-frame">
                            <img id="modalImage" src="" alt="Imagen del producto seleccionado">
                        </div>
                        <button class="carousel-button carousel-button--next" id="modalNextButton" aria-label="Imagen siguiente">›</button>
                        <div class="carousel-indicators" id="modalIndicators" role="tablist" aria-label="Selector de imagen del producto"></div>
                    </div>
                    <div class="modal-details">
                        <h3>Descripción Detallada</h3>
                        <p id="modalDescription">Descripción del producto.</p>
                        <h3>Especificaciones</h3>
                        <ul class="specs-list" id="modalSpecs">
                            <li><span>Material:</span><span>Concreto reforzado</span></li>
                        </ul>
                    </div>
                </div>
                <div class="cta-section">
                    <h3>¿Interesado en este producto?</h3>
                    <p>Contáctanos para más información o para realizar tu pedido</p>
                    ${modalCTAButtons}
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <div class="contact-info">
                <h3>${footerCompanyName}</h3>
                ${socialLinksMarkup}
                <p>${footerMessageHtml}</p>
            </div>
            <p style="margin-top: 2rem; opacity: 0.7;">© 2025 ${footerCompanyName} - Todos los derechos reservados</p>
        </div>
    </footer>

    <script>
        ${getCatalogScript(productDataJS, config, serializeForScript)}
    <\/script>
</body>
</html>`;
        }

        // Get catalog styles
        function getCatalogStyles(themeTokens) {
            const theme = themeTokens || buildThemeTokens(defaultAppearance);
            const formatCssBlock = (value) => {
                if (typeof value !== 'string' || value.length === 0) {
                    return '';
                }

                return value
                    .split('\n')
                    .map(line => line ? `            ${line}` : '')
                    .join('\n');
            };

            const bodyBackground = theme.backgroundImage
                ? [
                    `background-color: ${theme.backgroundStart};`,
                    'background-image:',
                    `    linear-gradient(135deg, ${theme.backgroundOverlayStart} 0%, ${theme.backgroundOverlayEnd} 100%),`,
                    `    url("${escapeCssUrl(theme.backgroundImage)}");`,
                    'background-size: cover;',
                    'background-position: center;',
                    'background-repeat: no-repeat;',
                    'background-attachment: fixed;'
                ].join('\n')
                : `background: linear-gradient(135deg, ${theme.backgroundStart} 0%, ${theme.backgroundEnd} 100%);`;

            const headerBackground = theme.headerImage
                ? [
                    `background-color: ${theme.headerStart};`,
                    'background-image:',
                    `    linear-gradient(135deg, ${theme.headerImageOverlayStart} 0%, ${theme.headerImageOverlayEnd} 100%),`,
                    `    url("${escapeCssUrl(theme.headerImage)}");`,
                    'background-size: cover;',
                    'background-position: center;',
                    'background-repeat: no-repeat;'
                ].join('\n')
                : `background: linear-gradient(135deg, ${theme.headerStart} 0%, ${theme.headerEnd} 100%);`;

            const footerBackground = theme.footerImage
                ? [
                    `background-color: ${theme.headerStart};`,
                    'background-image:',
                    `    linear-gradient(135deg, ${theme.footerImageOverlayStart} 0%, ${theme.footerImageOverlayEnd} 100%),`,
                    `    url("${escapeCssUrl(theme.footerImage)}");`,
                    'background-size: cover;',
                    'background-position: center;',
                    'background-repeat: no-repeat;'
                ].join('\n')
                : `background: linear-gradient(135deg, ${theme.headerStart} 0%, ${theme.headerEnd} 100%);`;

            return `

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
${formatCssBlock(bodyBackground)}
            overflow-x: hidden;
        }

        /* Loading Screen */
        .loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: ${theme.headerStart};
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            transition: opacity 1s, visibility 1s;
        }

        .loader.hidden {
            opacity: 0;
            visibility: hidden;
        }

        .leaf-spinner {
            width: 80px;
            height: 80px;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Header */
        header {
${formatCssBlock(headerBackground)}
            color: ${theme.headerText};
            padding: 2rem 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }

        header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, ${theme.headerOverlay} 0%, transparent 70%);
            animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        .header-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
        }

        .header-content {
            text-align: center;
        }

        .logo-container {
            max-width: 140px;
            max-height: 140px;
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            letter-spacing: 3px;
            animation: fadeInDown 1s ease-out;
        }

        .tagline {
            font-size: 1.2rem;
            opacity: 0.9;
            animation: fadeInUp 1s ease-out 0.3s both;
        }

        /* Navigation */
        .nav-container {
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
            animation: slideDown 0.5s ease-out 0.5s both;
        }

        nav {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
        }

        .nav-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .nav-btn {
            padding: 0.7rem 1.5rem;
            background: linear-gradient(135deg, ${theme.navButtonStart} 0%, ${theme.navButtonEnd} 100%);
            color: ${theme.textOnDark};
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .nav-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .nav-btn:hover::before {
            width: 300px;
            height: 300px;
        }

        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px ${theme.navButtonShadow};
        }

        .nav-btn.active {
            background: linear-gradient(135deg, ${theme.navButtonActiveStart} 0%, ${theme.navButtonActiveEnd} 100%);
        }

        /* Main Container */
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }

        /* Category Sections */
        .category {
            display: none;
            animation: fadeIn 0.5s ease-out;
        }

        .category.active {
            display: block;
        }

        .category-title {
            font-size: 2.5rem;
            color: ${theme.categoryTitle};
            margin-bottom: 1rem;
            text-align: center;
            position: relative;
            padding-bottom: 1rem;
        }

        .category-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, transparent, ${theme.accentStrong}, transparent);
        }

        .category-description {
            text-align: center;
            color: ${theme.categoryDescription};
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }

        /* Product Grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }

        .product-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px ${theme.cardShadow};
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        }

        .product-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, ${theme.cardOverlayStart} 0%, ${theme.cardOverlayEnd} 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .product-card:hover::before {
            opacity: 1;
        }

        .product-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 15px 40px ${theme.cardHoverShadow};
        }

        .product-image {
            width: 100%;
            height: 250px;
            background: linear-gradient(135deg, ${theme.imagePlaceholderStart} 0%, ${theme.imagePlaceholderEnd} 100%);
            position: relative;
            overflow: hidden;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .product-image::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
            animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
            0% { transform: rotate(0deg) translateX(-100%); }
            100% { transform: rotate(0deg) translateX(100%); }
        }

        .product-info {
            padding: 1.5rem;
        }

        .product-name {
            font-size: 1.3rem;
            color: ${theme.categoryTitle};
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        .product-description {
            color: ${theme.categoryDescription};
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1rem;
        }

        .product-features {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .feature-tag {
            background: ${theme.featureBackground};
            color: ${theme.featureText};
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.85rem;
        }

        .product-price {
            font-size: 1.5rem;
            color: ${theme.priceColor};
            font-weight: bold;
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .modal.active {
            display: flex;
            animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
            background: white;
            border-radius: 20px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: slideUp 0.3s ease-out;
        }

        .close-modal {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
            background: rgba(0,0,0,0.1);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10;
        }

        .close-modal:hover {
            background: rgba(0,0,0,0.2);
            transform: rotate(90deg);
        }

        .modal-header {
            background: linear-gradient(135deg, ${theme.modalHeaderStart} 0%, ${theme.modalHeaderEnd} 100%);
            color: ${theme.textOnDark};
            padding: 2rem;
            border-radius: 20px 20px 0 0;
        }

        .modal-body {
            padding: 2rem;
        }

        .modal-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
            .modal-grid {
                grid-template-columns: 1fr;
            }
        }

        .modal-image {
            position: relative;
            width: 100%;
            max-height: 320px;
            background: linear-gradient(135deg, ${theme.imagePlaceholderStart} 0%, ${theme.imagePlaceholderEnd} 100%);
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-image-frame {
            width: 100%;
            height: 100%;
        }

        .modal-image-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .carousel-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: rgba(0, 0, 0, 0.35);
            color: #fff;
            font-size: 1.6rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
        }

        .carousel-button:hover {
            background: rgba(0, 0, 0, 0.55);
            transform: translateY(-50%) scale(1.05);
        }

        .carousel-button:disabled {
            background: rgba(0, 0, 0, 0.2);
            cursor: default;
            transform: translateY(-50%);
        }

        .carousel-button--prev {
            left: 12px;
        }

        .carousel-button--next {
            right: 12px;
        }

        .carousel-indicators {
            position: absolute;
            bottom: 14px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.4rem;
        }

        .carousel-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0;
            transition: background 0.2s, transform 0.2s;
        }

        .carousel-indicator:hover,
        .carousel-indicator:focus {
            background: rgba(255, 255, 255, 0.85);
            outline: none;
            transform: scale(1.05);
        }

        .carousel-indicator.active {
            background: ${theme.indicatorActive};
        }

        .modal-details h3 {
            color: ${theme.modalAccent};
            margin-bottom: 1rem;
        }

        .modal-details p {
            color: ${theme.categoryDescription};
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .specs-list {
            list-style: none;
            margin: 1rem 0;
        }

        .specs-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid ${theme.specBorderColor};
            display: flex;
            justify-content: space-between;
        }

        .cta-section {
            background: ${theme.ctaSectionBackground};
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }

        .cta-button {
            background: linear-gradient(135deg, ${theme.ctaBackgroundStart} 0%, ${theme.ctaBackgroundEnd} 100%);
            color: ${theme.textOnDark};
            padding: 1rem 2rem;
            border: none;
            border-radius: 25px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 0.5rem;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px ${theme.ctaShadow};
        }

        /* Footer */
        footer {
${formatCssBlock(footerBackground)}
            color: ${theme.footerText};
            padding: 3rem 0 2rem;
            margin-top: 4rem;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            text-align: center;
        }

        .contact-info {
            margin-bottom: 2rem;
        }

        .contact-info h3 {
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin: 1.5rem 0 1rem;
        }

        .social-link {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: #fff;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .social-link svg {
            width: 1.5rem;
            height: 1.5rem;
        }

        .social-link svg path {
            fill: currentColor;
        }

        .social-link:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
        }

        .social-link--whatsapp {
            background: #25d366;
        }

        .social-link--instagram {
            background: linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%);
        }

        .social-link--facebook {
            background: #1877f2;
        }

        .social-link--tiktok {
            background: #010101;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 1px, 1px);
            white-space: nowrap;
            border: 0;
        }

        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-100%);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            
            .header-inner {
                gap: 1.5rem;
            }

            .logo-container {
                max-width: 110px;
                max-height: 110px;
                padding: 0;
                background: transparent;
                border: none;
                box-shadow: none;
            }

            .category-title {
                font-size: 1.8rem;
            }
            
            .products-grid {
                grid-template-columns: 1fr;
            }
        }`;
        }

        // Get catalog script
        function getCatalogScript(productData, config, serializer) {
            const nonDigitPatternLiteral = String.raw`/\D+/g`;
            const serialize = typeof serializer === 'function'
                ? serializer
                : (value) => {
                    const jsonString = JSON.stringify(value);

                    if (typeof jsonString !== 'string') {
                        return 'null';
                    }

                    return jsonString
                        .replace(/</g, '\\u003C')
                        .replace(/>/g, '\\u003E')
                        .replace(/&/g, '\\u0026')
                        .replace(/\u2028/g, '\\u2028')
                        .replace(/\u2029/g, '\\u2029');
                };

            return `
        let currentProduct = null;
        let modalProduct = null;
        let modalImages = [];
        let currentImageIndex = 0;
        const productData = ${serialize(productData)};
        const catalogConfig = ${serialize(config || {})};

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        window.addEventListener('load', function() {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if (loader) {
                    loader.classList.add('hidden');
                }
            }, 1500);
        });

        document.addEventListener('DOMContentLoaded', function() {
            applyConfig();
            initializeCatalogState();

            const cards = document.querySelectorAll('.product-card');
            cards.forEach(card => {
                card.style.opacity = '0';
                observer.observe(card);
            });

            const modalElement = document.getElementById('productModal');
            if (modalElement) {
                modalElement.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal();
                    }
                });
            }

            const prevButton = document.getElementById('modalPrevButton');
            if (prevButton) {
                prevButton.addEventListener('click', showPrevModalImage);
            }

            const nextButton = document.getElementById('modalNextButton');
            if (nextButton) {
                nextButton.addEventListener('click', showNextModalImage);
            }

            const indicators = document.getElementById('modalIndicators');
            if (indicators) {
                indicators.addEventListener('click', function(event) {
                    const button = event.target.closest('.carousel-indicator');
                    if (!button) {
                        return;
                    }

                    const index = parseInt(button.getAttribute('data-index'), 10);
                    if (!Number.isNaN(index)) {
                        showModalImage(index);
                    }
                });
            }

            updateModalCarouselControls();
        });

        function updateModalImage() {
            const imageElement = document.getElementById('modalImage');

            if (!imageElement) {
                return;
            }

            const product = modalProduct;
            if (!product) {
                imageElement.removeAttribute('src');
                imageElement.alt = 'Imagen del producto seleccionado';
                return;
            }

            const images = Array.isArray(modalImages) ? modalImages : [];
            const hasImages = images.length > 0;

            if (hasImages) {
                const boundedIndex = Math.max(0, Math.min(currentImageIndex, images.length - 1));
                currentImageIndex = boundedIndex;
                imageElement.src = images[currentImageIndex] || '';
            } else {
                currentImageIndex = 0;
                imageElement.src = product.image || '';
            }

            const baseAlt = product.alt || \`Imagen de \${product.title}\`;
            const altSuffix = hasImages && images.length > 1
                ? \` (\${currentImageIndex + 1} de \${images.length})\`
                : '';
            imageElement.alt = baseAlt + altSuffix;
        }

        function updateModalCarouselControls() {
            const prevButton = document.getElementById('modalPrevButton');
            const nextButton = document.getElementById('modalNextButton');
            const indicators = document.getElementById('modalIndicators');

            const images = Array.isArray(modalImages) ? modalImages : [];
            const total = images.length;
            const hasMultiple = total > 1;

            if (prevButton) {
                prevButton.style.display = hasMultiple ? 'flex' : 'none';
                prevButton.disabled = currentImageIndex <= 0;
            }

            if (nextButton) {
                nextButton.style.display = hasMultiple ? 'flex' : 'none';
                nextButton.disabled = total === 0 || currentImageIndex >= total - 1;
            }

            if (indicators) {
                if (!hasMultiple) {
                    indicators.innerHTML = '';
                    indicators.style.display = 'none';
                } else {
                    indicators.style.display = 'flex';
                    indicators.innerHTML = images.map((_, index) => {
                        const isActive = index === currentImageIndex;
                        const ariaCurrent = isActive ? ' aria-current="true"' : '';
                        return \`<button type="button" class="carousel-indicator\${isActive ? ' active' : ''}" data-index="\${index}" aria-label="Ver imagen \${index + 1} de \${total}"\${ariaCurrent}></button>\`;
                    }).join('');
                }
            }
        }

        function showModalImage(index) {
            const images = Array.isArray(modalImages) ? modalImages : [];

            if (!images.length) {
                return;
            }

            const boundedIndex = Math.max(0, Math.min(index, images.length - 1));
            currentImageIndex = boundedIndex;
            updateModalImage();
            updateModalCarouselControls();
        }

        function showPrevModalImage() {
            if (currentImageIndex <= 0) {
                return;
            }

            showModalImage(currentImageIndex - 1);
        }

        function showNextModalImage() {
            const images = Array.isArray(modalImages) ? modalImages : [];

            if (!images.length || currentImageIndex >= images.length - 1) {
                return;
            }

            showModalImage(currentImageIndex + 1);
        }

        function configureFooterLink(element, url) {
            if (!element) {
                return false;
            }

            const normalizedUrl = typeof url === 'string' ? url.trim() : '';
            if (normalizedUrl) {
                element.href = normalizedUrl;
                element.style.display = 'inline-flex';
                return true;
            }

            element.style.display = 'none';
            return false;
        }

        function applyConfig() {
            const config = catalogConfig || {};
            const companyName = config.companyName || '';
            const taglineValue = config.tagline || '';
            const logoData = config.logoData || '';
            const whatsappNumber = (config.whatsapp || '').replace(${nonDigitPatternLiteral}, '');
            const emailValue = (config.email || '').trim();
            const instagramValue = (config.instagram || '').trim();
            const facebookValue = (config.facebook || '').trim();
            const tiktokValue = (config.tiktok || '').trim();

            document.title = companyName ? \`${companyName} - Catálogo Digital\` : 'Catálogo Digital';

            const headerTitle = document.getElementById('headerTitle');
            if (headerTitle) {
                headerTitle.textContent = companyName || 'Catálogo Digital';
            }

            const headerTagline = document.getElementById('headerTagline');
            if (headerTagline) {
                if (taglineValue) {
                    headerTagline.textContent = taglineValue;
                    headerTagline.style.display = 'block';
                } else {
                    headerTagline.textContent = '';
                    headerTagline.style.display = 'none';
                }
            }

            const logoContainer = document.getElementById('headerLogoContainer');
            const logoImage = document.getElementById('headerLogo');
            if (logoContainer && logoImage) {
                if (logoData) {
                    logoImage.src = logoData;
                    logoImage.alt = \`Logo de ${companyName || 'la empresa'}\`;
                    logoContainer.style.display = 'flex';
                } else {
                    logoImage.removeAttribute('src');
                    logoImage.alt = 'Logo de la empresa';
                    logoContainer.style.display = 'none';
                }
            }

            const whatsappButton = document.getElementById('modalWhatsAppButton');
            if (whatsappButton) {
                whatsappButton.style.display = whatsappNumber ? 'inline-block' : 'none';
            }

            const quoteButton = document.getElementById('modalQuoteButton');
            if (quoteButton) {
                quoteButton.style.display = emailValue ? 'inline-block' : 'none';
            }

            const footerSocialContainer = document.getElementById('footerSocialLinks');
            const footerWhatsApp = document.getElementById('footerSocialWhatsApp');
            const footerInstagram = document.getElementById('footerSocialInstagram');
            const footerFacebook = document.getElementById('footerSocialFacebook');
            const footerTiktok = document.getElementById('footerSocialTiktok');

            let hasFooterSocial = false;

            if (footerWhatsApp) {
                if (whatsappNumber) {
                    footerWhatsApp.href = \`https://wa.me/\${whatsappNumber}\`;
                    footerWhatsApp.style.display = 'inline-flex';
                    hasFooterSocial = true;
                } else {
                    footerWhatsApp.style.display = 'none';
                }
            }

            if (configureFooterLink(footerInstagram, instagramValue)) {
                hasFooterSocial = true;
            }

            if (configureFooterLink(footerFacebook, facebookValue)) {
                hasFooterSocial = true;
            }

            if (configureFooterLink(footerTiktok, tiktokValue)) {
                hasFooterSocial = true;
            }

            if (footerSocialContainer) {
                footerSocialContainer.style.display = hasFooterSocial ? '' : 'none';
            }
        }

        function initializeCatalogState() {
            const categories = Array.from(document.querySelectorAll('.category'));
            const navWrapper = document.querySelector('.nav-container');
            const navButtonsContainer = document.getElementById('navButtons');
            const emptyMessage = document.getElementById('emptyCatalogMessage');

            const categoriesWithProducts = categories.filter(category =>
                category.querySelectorAll('.product-card').length > 0
            );

            const hasProducts = categoriesWithProducts.length > 0;

            if (navWrapper) {
                navWrapper.style.display = hasProducts ? '' : 'none';
            }

            if (emptyMessage) {
                emptyMessage.style.display = hasProducts ? 'none' : 'block';
            }

            if (hasProducts) {
                const firstCategory = categoriesWithProducts[0];
                const firstCategoryId = firstCategory ? firstCategory.id : null;

                categories.forEach(category => {
                    if (category) {
                        category.classList.toggle('active', category === firstCategory);
                    }
                });

                if (navButtonsContainer) {
                    const navButtons = Array.from(navButtonsContainer.querySelectorAll('.nav-btn'));
                    navButtons.forEach(button => {
                        if (!button.dataset || !firstCategoryId) {
                            button.classList.remove('active');
                            return;
                        }

                        button.classList.toggle('active', button.dataset.category === firstCategoryId);
                    });
                }
            }
        }

        function showCategory(event, categoryId) {
            const categories = Array.from(document.querySelectorAll('.category'));
            if (!categories.length) {
                return;
            }

            let requestedCategoryId = typeof categoryId === 'string' ? categoryId : '';

            categories.forEach(cat => cat.classList.remove('active'));

            let targetCategory = requestedCategoryId ? document.getElementById(requestedCategoryId) : null;
            if (!targetCategory) {
                targetCategory = categories[0] || null;
                requestedCategoryId = targetCategory ? targetCategory.id : requestedCategoryId;
            }

            if (targetCategory) {
                targetCategory.classList.add('active');
            }

            const buttons = Array.from(document.querySelectorAll('.nav-btn'));
            buttons.forEach(btn => btn.classList.remove('active'));
            const targetButton = (event && (event.currentTarget || event.target)) || (requestedCategoryId
                ? document.querySelector('[data-category="' + requestedCategoryId + '"]')
                : null);
            if (targetButton) {
                targetButton.classList.add('active');
            }

            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                window.scrollTo({
                    top: navContainer.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        }

        function openModal(productId) {
            const modal = document.getElementById('productModal');
            const product = productData[productId];

            if (!modal || !product) {
                return;
            }

            currentProduct = product.title;
            modalProduct = product;
            modalImages = Array.isArray(product.images)
                ? product.images
                    .map(image => (typeof image === 'string' ? image.trim() : ''))
                    .filter(image => image.length > 0)
                : [];
            currentImageIndex = 0;
            const titleEl = document.getElementById('modalTitle');
            const descriptionEl = document.getElementById('modalDescription');
            const specsList = document.getElementById('modalSpecs');

            if (titleEl) {
                titleEl.textContent = product.title;
            }

            if (descriptionEl) {
                descriptionEl.textContent = product.description;
            }

            if (specsList) {
                if (product.specs && product.specs.length) {
                    specsList.innerHTML = product.specs.map(spec =>
                        \`<li><span>\${spec[0]}:</span><span>\${spec[1]}</span></li>\`
                    ).join('');
                } else {
                    specsList.innerHTML = '<li><span>Información:</span><span>Disponible a solicitud</span></li>';
                }
            }

            updateModalImage();
            updateModalCarouselControls();

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            const modal = document.getElementById('productModal');
            if (modal) {
                modal.classList.remove('active');
            }
            document.body.style.overflow = 'auto';
            modalImages = [];
            modalProduct = null;
            currentProduct = null;
            currentImageIndex = 0;
            updateModalImage();
            updateModalCarouselControls();
        }

        function contactWhatsApp() {
            const config = catalogConfig || {};
            const whatsappNumber = (config.whatsapp || '').replace(${nonDigitPatternLiteral}, '');

            if (!whatsappNumber) {
                return;
            }

            const productName = currentProduct || 'Producto Amazonia';
            const message = \`Hola! Me interesa el producto: \${productName}. ¿Podrían darme más información?\`;
            const url = \`https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent(message)}\`;
            window.open(url, '_blank');
        }

        function requestQuote() {
            const config = catalogConfig || {};
            const emailValue = (config.email || '').trim();

            if (!emailValue) {
                return;
            }

            const productName = currentProduct || 'Producto Amazonia';
            const subject = \`Cotización - \${productName}\`;
            const phoneLine = config.phone ? \`Teléfono de contacto preferido: \${config.phone}\` : 'Teléfono de contacto:';
            const body = \`Hola,\\n\\nMe gustaría recibir una cotización para el producto: \${productName}.\\n\\n\${phoneLine}\\nCantidad requerida:\\n\\nGracias!\`;
            const url = \`mailto:\${emailValue}?subject=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`;
            window.location.href = url;
        }

        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('header');
            if (header && scrolled < 300) {
                header.style.transform = \`translateY(\${scrolled * 0.5}px)\`;
            }
        });`;
        }
    
