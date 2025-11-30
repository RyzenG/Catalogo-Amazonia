const STORAGE_KEY = 'amazoniaData';
const DEFAULT_APPEARANCE = {
    background: '#f5f5f5',
    header: '#2d4a2b',
    primary: '#6b8e68',
    accent: '#8fa68c',
    text: '#2d4a2b',
    backgroundImage: '',
    headerImage: '',
    footerImage: ''
};

const DEFAULT_CONTACT = {
    whatsapp: '',
    email: '',
    phone: '',
    address: '',
    ctaText: 'Solicitar información',
    ctaLink: ''
};

const DEFAULT_PRICE_RANGES = [
    { id: 'low', label: 'Hasta $150.000', min: 0, max: 150000 },
    { id: 'mid', label: '$150.001 - $400.000', min: 150001, max: 400000 },
    { id: 'high', label: 'Más de $400.000', min: 400001, max: null }
];

const DEFAULT_CATEGORIES = [
    {
        id: 'mobiliario',
        name: 'Mobiliario',
        description: 'Mesas, bancas y complementos para terrazas y salas.',
        icon: '🪑'
    },
    {
        id: 'iluminacion',
        name: 'Iluminación',
        description: 'Lámparas en concreto ultraligero y tonos cálidos.',
        icon: '💡'
    },
    {
        id: 'accesorios',
        name: 'Accesorios',
        description: 'Macetas, bowls y piezas decorativas para destacar texturas.',
        icon: '🪴'
    }
];

const DEFAULT_PRODUCTS = [
    {
        id: 'mesa-rio',
        name: 'Mesa Río',
        category: 'mobiliario',
        description: 'Cubierta sellada con resina natural, patas de acero grafito.',
        price: 380000,
        tags: ['interior', 'premium'],
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        ctaText: 'Agendar asesoría'
    },
    {
        id: 'banca-selva',
        name: 'Banca Selva',
        category: 'mobiliario',
        description: 'Textura inspirada en corteza amazónica, ideal para exteriores.',
        price: 180000,
        tags: ['exterior', 'stock'],
        imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'lampara-aurora',
        name: 'Lámpara Aurora',
        category: 'iluminacion',
        description: 'Difusor cálido y cuerpo de concreto ultraligero pigmentado.',
        price: 240000,
        tags: ['nuevo', 'tendencia'],
        imageUrl: 'https://images.unsplash.com/photo-1493663284031-b66af44d7c0e?auto=format&fit=crop&w=1200&q=80',
        ctaLink: 'mailto:info@amazoniaconcrete.com?subject=Consulta%20L%C3%A1mpara%20Aurora'
    },
    {
        id: 'pendulo-bruma',
        name: 'Péndulo Bruma',
        category: 'iluminacion',
        description: 'Colgante con acabado gris humo y cable textil verde musgo.',
        price: 460000,
        tags: ['premium'],
        imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'maceta-lago',
        name: 'Maceta Lago',
        category: 'accesorios',
        description: 'Maceta cilíndrica en concreto pigmentado, resistente a exteriores.',
        price: 95000,
        tags: ['exterior', 'stock'],
        imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    },
    {
        id: 'bowl-ceniza',
        name: 'Bowl Ceniza',
        category: 'accesorios',
        description: 'Pieza decorativa con sello hidrófugo y textura fina.',
        price: 65000,
        tags: ['interior'],
        imageUrl: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80'
    }
];

let categories = [];
let products = [];
let config = {
    appearance: { ...DEFAULT_APPEARANCE },
    contact: { ...DEFAULT_CONTACT },
    priceRanges: DEFAULT_PRICE_RANGES
};

function sanitizeText(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim();
}

function sanitizeEmoji(value, fallback = '📦') {
    const text = sanitizeText(value);
    return text || fallback;
}

function toSlug(value, fallback = 'categoria') {
    const text = sanitizeText(value).toLowerCase();
    const slug = text
        .normalize('NFD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
    return slug || fallback;
}

function normalizeCategory(rawCategory, index, usedIds) {
    const category = rawCategory && typeof rawCategory === 'object' ? rawCategory : {};
    const baseName = sanitizeText(category.name || category.title || category.label);
    const generatedId = toSlug(category.id || baseName || `categoria-${index + 1}`);
    let finalId = generatedId;
    let counter = 1;

    while (usedIds.has(finalId)) {
        finalId = `${generatedId}-${counter}`;
        counter += 1;
    }

    usedIds.add(finalId);

    return {
        id: finalId,
        name: baseName || `Categoría ${index + 1}`,
        description: sanitizeText(category.description || category.desc),
        icon: sanitizeEmoji(category.icon)
    };
}

function normalizeCategories(rawCategories) {
    const usedIds = new Set();

    if (Array.isArray(rawCategories)) {
        return rawCategories.map((category, index) => normalizeCategory(category, index, usedIds));
    }

    return DEFAULT_CATEGORIES.map((category, index) => normalizeCategory(category, index, usedIds));
}

function normalizePrice(value) {
    const numeric = parsePriceValue(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
        return numeric;
    }
    return 0;
}

function parsePriceValue(rawValue) {
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
        return rawValue;
    }

    if (typeof rawValue !== 'string') {
        return null;
    }

    const match = rawValue.match(/-?[\d][\d.,]*/);
    if (!match) {
        return null;
    }

    const candidate = match[0];
    const commaCount = (candidate.match(/,/g) || []).length;
    const dotCount = (candidate.match(/\./g) || []).length;
    const usesCommaDecimal = commaCount === 1 && dotCount === 0;
    const decimalSeparator = usesCommaDecimal ? ',' : '.';
    const thousandsSeparator = usesCommaDecimal ? '.' : ',';

    const normalized = candidate
        .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
        .replace(decimalSeparator, '.');

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTags(rawTags) {
    if (!Array.isArray(rawTags)) {
        return [];
    }
    return rawTags
        .map(tag => sanitizeText(tag))
        .filter(Boolean);
}

function normalizeProduct(rawProduct, index, categoryId) {
    const product = rawProduct && typeof rawProduct === 'object' ? rawProduct : {};
    const baseName = sanitizeText(product.name || product.title);
    const slugSource = product.id || product.sku || baseName || `producto-${index + 1}`;

    const imageCandidates = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        const primaryImage = sanitizeText(product.primaryImage || product.image);
        const firstImage = sanitizeText(product.images[0]);
        if (primaryImage) {
            imageCandidates.push(primaryImage);
        }
        if (firstImage) {
            imageCandidates.push(firstImage);
        }
    }
    if (typeof product.image === 'string') {
        imageCandidates.push(sanitizeText(product.image));
    }
    if (typeof product.imageUrl === 'string') {
        imageCandidates.push(sanitizeText(product.imageUrl));
    }
    const imageUrl = imageCandidates.find(Boolean) || '';

    return {
        id: toSlug(slugSource, `producto-${index + 1}`),
        name: baseName || `Producto ${index + 1}`,
        category: sanitizeText(product.category) || categoryId,
        description: sanitizeText(product.description || product.desc),
        price: normalizePrice(product.price),
        tags: normalizeTags(product.tags),
        imageUrl,
        ctaText: sanitizeText(product.ctaText),
        ctaLink: sanitizeText(product.ctaLink || product.contactLink)
    };
}

function normalizeProducts(rawProducts, normalizedCategories) {
    const categoryIds = new Set(normalizedCategories.map(category => category.id));
    const normalized = [];

    if (rawProducts && typeof rawProducts === 'object' && !Array.isArray(rawProducts)) {
        Object.entries(rawProducts).forEach(([categoryId, productList]) => {
            if (!Array.isArray(productList)) {
                return;
            }
            const targetCategory = categoryIds.has(categoryId) ? categoryId : null;
            productList.forEach((product, index) => {
                const normalizedProduct = normalizeProduct(product, index, categoryId);
                const hasValidCategory = categoryIds.has(normalizedProduct.category) || targetCategory;
                if (hasValidCategory) {
                    normalizedProduct.category = normalizedProduct.category || targetCategory;
                    normalized.push(normalizedProduct);
                }
            });
        });
    } else if (Array.isArray(rawProducts)) {
        rawProducts.forEach((product, index) => {
            const normalizedProduct = normalizeProduct(product, index);
            if (categoryIds.has(normalizedProduct.category)) {
                normalized.push(normalizedProduct);
            }
        });
    }

    if (normalized.length === 0) {
        return DEFAULT_PRODUCTS.filter(product => categoryIds.has(product.category)).map(product => ({ ...product }));
    }

    return normalized;
}

function normalizeAppearance(rawAppearance) {
    const appearanceData = rawAppearance && typeof rawAppearance === 'object'
        ? rawAppearance
        : {};

    const normalized = { ...DEFAULT_APPEARANCE };
    const colorKeys = ['background', 'header', 'primary', 'accent', 'text'];
    const imageKeys = ['backgroundImage', 'headerImage', 'footerImage'];
    const colorPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

    colorKeys.forEach(key => {
        const candidate = sanitizeText(appearanceData[key]);
        normalized[key] = colorPattern.test(candidate) ? candidate : normalized[key];
    });

    imageKeys.forEach(key => {
        normalized[key] = sanitizeText(appearanceData[key]);
    });

    return normalized;
}

function normalizeContact(rawContact) {
    const contactData = rawContact && typeof rawContact === 'object'
        ? rawContact
        : {};

    const sanitizePhone = value => sanitizeText(value).replace(/[^\d+]/g, '');

    return {
        whatsapp: sanitizePhone(contactData.whatsapp || contactData.phone || ''),
        email: sanitizeText(contactData.email),
        phone: sanitizeText(contactData.phone || contactData.whatsapp || ''),
        address: sanitizeText(contactData.address),
        ctaText: sanitizeText(contactData.ctaText || contactData.contactText) || DEFAULT_CONTACT.ctaText,
        ctaLink: sanitizeText(contactData.ctaLink || contactData.contactLink)
    };
}

function normalizePriceRange(range, index, usedIds) {
    const baseRange = range && typeof range === 'object' ? range : {};
    const idCandidate = sanitizeText(baseRange.id) || `price-${index + 1}`;
    const label = sanitizeText(baseRange.label);
    const currency = sanitizeText(baseRange.currency || 'COP').toUpperCase() || 'COP';
    const minValue = parsePriceValue(baseRange.min);
    const maxValue = parsePriceValue(baseRange.max);
    const normalizedId = idCandidate;

    if (normalizedId) {
        usedIds.add(normalizedId);
    }

    return {
        id: normalizedId,
        label: label || '',
        min: Number.isFinite(minValue) && minValue >= 0 ? minValue : 0,
        max: Number.isFinite(maxValue) && maxValue >= 0 ? maxValue : null,
        currency
    };
}

function normalizePriceRanges(rawRanges) {
    const usedIds = new Set();
    const ranges = Array.isArray(rawRanges) && rawRanges.length > 0 ? rawRanges : DEFAULT_PRICE_RANGES;

    const normalized = ranges
        .map((range, index) => normalizePriceRange(range, index, usedIds))
        .filter(range => Number.isFinite(range.min) || Number.isFinite(range.max));

    if (normalized.length === 0) {
        return DEFAULT_PRICE_RANGES.map((range, index) => normalizePriceRange(range, index, usedIds));
    }

    return normalized;
}

function normalizeConfig(rawConfig) {
    const configData = rawConfig && typeof rawConfig === 'object'
        ? rawConfig
        : {};

    const appearanceConfig = configData.appearance || configData.theme || rawConfig || {};
    const contactConfig = configData.contact || configData || {};

    return {
        appearance: normalizeAppearance(appearanceConfig),
        contact: { ...DEFAULT_CONTACT, ...normalizeContact(contactConfig) },
        priceRanges: normalizePriceRanges(configData.priceRanges || configData.priceFilters)
    };
}

function parseJsonSafely(value) {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('No se pudo leer el JSON proporcionado', error);
        return null;
    }
}

function readInlineDataset() {
    const inlineNode = document.getElementById('amazoniaData');
    if (!inlineNode || !inlineNode.textContent) {
        return null;
    }
    return parseJsonSafely(inlineNode.textContent);
}

function readStoredDataset() {
    if (typeof localStorage === 'undefined') {
        return null;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseJsonSafely(stored) : null;
}

function persistDataset(dataset) {
    if (typeof localStorage === 'undefined' || !dataset) {
        return;
    }

    const { categories: storedCategories, products: storedProducts, config: storedConfig } = dataset;
    const productMap = storedProducts.reduce((map, product) => {
        if (!map[product.category]) {
            map[product.category] = [];
        }
        map[product.category].push({ ...product });
        return map;
    }, {});

    const payload = {
        categories: storedCategories,
        products: productMap,
        config: storedConfig
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadDataset() {
    const stored = readStoredDataset();
    const inlineData = stored ? null : readInlineDataset();
    const source = stored || inlineData || {
        categories: DEFAULT_CATEGORIES,
        products: DEFAULT_PRODUCTS,
        config: { appearance: DEFAULT_APPEARANCE, contact: DEFAULT_CONTACT, priceRanges: DEFAULT_PRICE_RANGES }
    };

    const normalizedCategories = normalizeCategories(source.categories);
    const normalizedProducts = normalizeProducts(source.products, normalizedCategories);
    const normalizedConfig = normalizeConfig(source.config || source);

    const dataset = {
        categories: normalizedCategories,
        products: normalizedProducts,
        config: normalizedConfig
    };

    if (!stored) {
        persistDataset(dataset);
    }

    return dataset;
}

function applyAppearanceStyles(theme) {
    const root = document.documentElement;
    if (!root || !theme) {
        return;
    }

    root.style.setProperty('--brand-light', theme.background);
    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-accent', theme.accent);
    root.style.setProperty('--brand-dark', theme.header);
    root.style.setProperty('--text-body', theme.text);

    if (document.body) {
        document.body.style.backgroundColor = theme.background;
        document.body.style.backgroundImage = theme.backgroundImage ? `url(${theme.backgroundImage})` : '';
        document.body.style.backgroundRepeat = theme.backgroundImage ? 'no-repeat' : '';
        document.body.style.backgroundSize = theme.backgroundImage ? 'cover' : '';
    }

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundImage = theme.headerImage ? `url(${theme.headerImage})` : '';
        hero.style.backgroundSize = theme.headerImage ? 'cover' : '';
        hero.style.backgroundRepeat = theme.headerImage ? 'no-repeat' : '';
        hero.style.backgroundBlendMode = theme.headerImage ? 'multiply' : '';
    }

    const footer = document.querySelector('.site-footer');
    if (footer) {
        footer.style.backgroundImage = theme.footerImage ? `url(${theme.footerImage})` : '';
        footer.style.backgroundSize = theme.footerImage ? 'cover' : '';
        footer.style.backgroundRepeat = theme.footerImage ? 'no-repeat' : '';
    }
}

function formatCurrency(value) {
    return value.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });
}

function groupProducts(filteredProducts) {
    const grouped = new Map();
    categories.forEach(category => {
        grouped.set(category.id, []);
    });

    filteredProducts.forEach(product => {
        if (!grouped.has(product.category)) {
            grouped.set(product.category, []);
        }
        grouped.get(product.category).push(product);
    });

    return grouped;
}

function buildContactLink(product) {
    if (!config || !config.contact) {
        return null;
    }

    const preferredText = product.ctaText || config.contact.ctaText || 'Solicitar información';
    const normalizedProductName = product && product.name ? product.name : 'este producto';
    const sanitizedCustomLink = sanitizeText(product.ctaLink);

    const whatsappNumber = config.contact.whatsapp.replace(/\D/g, '');
    const email = config.contact.email;
    const phone = config.contact.phone;

    if (sanitizedCustomLink) {
        return {
            label: preferredText,
            href: sanitizedCustomLink,
            target: '_blank'
        };
    }

    const encodedMessage = encodeURIComponent(`Hola, quiero saber más sobre ${normalizedProductName}.`);

    if (whatsappNumber) {
        return {
            label: preferredText || 'Escribir por WhatsApp',
            href: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
            target: '_blank'
        };
    }

    if (email) {
        return {
            label: preferredText || 'Solicitar por correo',
            href: `mailto:${email}?subject=${encodeURIComponent(`Consulta sobre ${normalizedProductName}`)}`,
            target: '_self'
        };
    }

    if (phone) {
        return {
            label: preferredText || 'Llamar',
            href: `tel:${phone}`,
            target: '_self'
        };
    }

    return null;
}

function renderCategoryTags(activeCategoryId) {
    const container = document.getElementById('categoryTags');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (categories.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-state';
        emptyMessage.textContent = 'Aún no hay categorías configuradas. Guarda datos desde el panel de administración.';
        container.appendChild(emptyMessage);
        return;
    }

    const allButton = document.createElement('button');
    allButton.textContent = 'Todas';
    allButton.className = `tag ${!activeCategoryId ? 'is-active' : ''}`;
    allButton.type = 'button';
    allButton.dataset.category = '';
    allButton.addEventListener('click', () => applyFilters({ category: null }));
    container.appendChild(allButton);

    categories.forEach(category => {
        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = `tag ${activeCategoryId === category.id ? 'is-active' : ''}`;
        tag.textContent = `${category.icon} ${category.name}`;
        tag.dataset.category = category.id;
        tag.addEventListener('click', () => applyFilters({ category: category.id }));
        container.appendChild(tag);
    });
}

function getConfiguredPriceRanges() {
    const ranges = normalizePriceRanges(config && Array.isArray(config.priceRanges)
        ? config.priceRanges
        : DEFAULT_PRICE_RANGES);

    config.priceRanges = ranges;
    return ranges;
}

function formatPriceLabel(value, currency = 'COP') {
    if (!Number.isFinite(value)) {
        return '';
    }

    try {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency || 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    } catch (error) {
        return formatCurrency(value);
    }
}

function buildPriceRangeLabel(range) {
    const label = sanitizeText(range.label);
    if (label) {
        return label;
    }

    const min = Number.isFinite(range.min) ? range.min : null;
    const max = Number.isFinite(range.max) ? range.max : null;
    const formatterCurrency = sanitizeText(range.currency || 'COP').toUpperCase() || 'COP';

    if (min !== null && max !== null) {
        return `${formatPriceLabel(min, formatterCurrency)} - ${formatPriceLabel(max, formatterCurrency)}`;
    }

    if (min !== null) {
        return `Desde ${formatPriceLabel(min, formatterCurrency)}`;
    }

    if (max !== null) {
        return `Hasta ${formatPriceLabel(max, formatterCurrency)}`;
    }

    return '';
}

function renderPriceFilterOptions() {
    const priceSelect = document.getElementById('priceSelect');
    if (!priceSelect) {
        return;
    }

    const currentValue = priceSelect.value;
    priceSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Todos los precios';
    priceSelect.appendChild(defaultOption);

    getConfiguredPriceRanges().forEach(range => {
        const option = document.createElement('option');
        option.value = range.id;
        option.textContent = buildPriceRangeLabel(range);
        option.dataset.min = Number.isFinite(range.min) ? range.min : '';
        option.dataset.max = Number.isFinite(range.max) ? range.max : '';
        priceSelect.appendChild(option);
    });

    const hasCurrentValue = priceSelect.querySelector(`option[value="${currentValue}"]`);
    if (hasCurrentValue) {
        priceSelect.value = currentValue;
    }
}

function resolvePriceFilter(priceFilter) {
    if (!priceFilter) {
        return null;
    }

    const ranges = getConfiguredPriceRanges();
    const directMatch = ranges.find(range => range.id === priceFilter);
    if (directMatch) {
        return directMatch;
    }

    const trimmed = typeof priceFilter === 'string' ? priceFilter.trim() : '';
    if (!trimmed) {
        return null;
    }

    if (trimmed.endsWith('+')) {
        const minValue = parsePriceValue(trimmed.slice(0, -1));
        return Number.isFinite(minValue)
            ? { min: minValue, max: null, id: trimmed, label: '' }
            : null;
    }

    const [minPart, maxPart] = trimmed.split('-');
    if (typeof minPart === 'undefined' || typeof maxPart === 'undefined') {
        return null;
    }

    const minValue = parsePriceValue(minPart);
    const maxValue = parsePriceValue(maxPart);
    if (!Number.isFinite(minValue) && !Number.isFinite(maxValue)) {
        return null;
    }

    return {
        min: Number.isFinite(minValue) ? minValue : 0,
        max: Number.isFinite(maxValue) ? maxValue : null,
        id: trimmed,
        label: ''
    };
}

function matchesPriceRange(product, priceFilter) {
    if (!priceFilter) {
        return true;
    }

    const priceValue = parsePriceValue(product.price);
    if (!Number.isFinite(priceValue)) {
        return false;
    }

    const range = resolvePriceFilter(priceFilter);
    if (!range) {
        return true;
    }

    const min = Number.isFinite(range.min) ? range.min : 0;
    const max = Number.isFinite(range.max) ? range.max : Infinity;
    return priceValue >= min && priceValue <= max;
}

function renderProducts(filteredProducts, activeCategory) {
    const container = document.getElementById('catalogProducts');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (categories.length === 0) {
        const emptyCategories = document.createElement('p');
        emptyCategories.textContent = 'No hay categorías disponibles para mostrar productos.';
        container.appendChild(emptyCategories);
        return;
    }

    if (products.length === 0) {
        const emptyProducts = document.createElement('p');
        emptyProducts.textContent = 'Aún no hay productos cargados. Usa el panel de administración para agregarlos.';
        container.appendChild(emptyProducts);
        return;
    }

    const grouped = groupProducts(filteredProducts);

    categories.forEach(category => {
        const items = grouped.get(category.id) || [];
        if (items.length === 0) {
            return;
        }

        const block = document.createElement('article');
        block.className = 'category-block';
        block.id = category.id;

        const header = document.createElement('div');
        header.className = 'category-block__header';

        const title = document.createElement('h2');
        title.className = 'category-block__title';
        title.textContent = `${category.icon} ${category.name}`;

        const description = document.createElement('p');
        description.className = 'section__description';
        description.textContent = category.description;

        header.appendChild(title);
        header.appendChild(description);
        block.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'product-grid';

        items.forEach(product => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.setAttribute('aria-label', product.name);

            const media = document.createElement('div');
            media.className = 'product-card__media';

            if (product.imageUrl) {
                const image = document.createElement('img');
                image.className = 'product-card__image';
                image.src = product.imageUrl;
                image.alt = `Vista de ${product.name}`;
                image.loading = 'lazy';
                image.decoding = 'async';
                media.appendChild(image);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'product-card__image product-card__image--placeholder';
                placeholder.setAttribute('role', 'img');
                placeholder.setAttribute('aria-label', `Imagen pendiente para ${product.name}`);
                placeholder.textContent = 'Imagen en preparación';
                media.appendChild(placeholder);
            }

            const headerRow = document.createElement('div');
            headerRow.className = 'product-card__header';

            const name = document.createElement('h3');
            name.className = 'product-card__name';
            name.textContent = product.name;

            const price = document.createElement('p');
            price.className = 'product-card__price';
            price.textContent = formatCurrency(product.price);

            headerRow.appendChild(name);
            headerRow.appendChild(price);

            const description = document.createElement('p');
            description.className = 'product-card__desc';
            description.textContent = product.description;

            const meta = document.createElement('div');
            meta.className = 'product-meta';
            product.tags.forEach(tag => {
                const chip = document.createElement('span');
                chip.className = 'pill';
                chip.textContent = tag;
                meta.appendChild(chip);
            });

            const actions = document.createElement('div');
            actions.className = 'product-card__actions';
            const contactLink = buildContactLink(product);

            if (contactLink) {
                const actionButton = document.createElement('a');
                actionButton.className = 'button product-card__cta';
                actionButton.href = contactLink.href;
                actionButton.target = contactLink.target;
                actionButton.rel = contactLink.target === '_blank' ? 'noopener noreferrer' : '';
                actionButton.textContent = contactLink.label;
                actionButton.setAttribute('aria-label', `${contactLink.label} para ${product.name}`);
                actions.appendChild(actionButton);
            }

            card.appendChild(media);
            card.appendChild(headerRow);
            card.appendChild(description);
            card.appendChild(meta);
            card.appendChild(actions);
            grid.appendChild(card);
        });

        block.appendChild(grid);
        container.appendChild(block);
    });

    if (!container.children.length) {
        const empty = document.createElement('p');
        empty.textContent = 'No hay productos que coincidan con los filtros seleccionados.';
        container.appendChild(empty);
    }

    if (activeCategory) {
        const anchor = document.getElementById(activeCategory);
        if (anchor && typeof anchor.scrollIntoView === 'function') {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function applyFilters({ search, price, category } = {}) {
    const searchInput = document.getElementById('searchInput');
    const priceSelect = document.getElementById('priceSelect');

    if (!searchInput || !priceSelect) {
        return;
    }

    if (typeof search === 'string') {
        searchInput.value = search;
    }
    if (typeof price === 'string') {
        priceSelect.value = price;
    }
    if (typeof category === 'string' || category === null) {
        renderCategoryTags(category || null);
    }

    const activeSearch = searchInput.value.trim().toLowerCase();
    const activePrice = priceSelect.value;
    const activeCategory = typeof category === 'string' || category === null
        ? category
        : document.querySelector('.tag.is-active')?.dataset?.category || null;

    const filtered = products.filter(product => {
        const matchesCategory = !activeCategory || product.category === activeCategory;
        const matchesSearch = !activeSearch
            || product.name.toLowerCase().includes(activeSearch)
            || product.description.toLowerCase().includes(activeSearch);
        const matchesPrice = matchesPriceRange(product, activePrice);
        return matchesCategory && matchesSearch && matchesPrice;
    });

    renderProducts(filtered, activeCategory);
}

function initCatalog() {
    const dataset = loadDataset();
    categories = dataset.categories;
    products = dataset.products;
    config = dataset.config;

    applyAppearanceStyles(config.appearance);
    renderPriceFilterOptions();
    renderCategoryTags(null);
    applyFilters();

    const searchInput = document.getElementById('searchInput');
    const priceSelect = document.getElementById('priceSelect');

    if (searchInput) {
        searchInput.addEventListener('input', event => {
            applyFilters({ search: event.target.value });
        });
    }

    if (priceSelect) {
        priceSelect.addEventListener('change', event => {
            applyFilters({ price: event.target.value });
        });
    }
}

document.addEventListener('DOMContentLoaded', initCatalog);
