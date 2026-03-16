const STORAGE_KEY = 'amazoniaData';
const DEFAULT_APPEARANCE = {
    background: '#f5f5f5',
    header: '#2d4a2b',
    primary: '#6b8e68',
    accent: '#8fa68c',
    text: '#2d4a2b',
    backgroundImage: '',
    headerImage: '',
    footerImage: '',
    mode: 'light',
    backgroundPattern: 'concrete-soft',
    sectionPattern: '',
    overlayStrength: 0.48
};

const TEXTURE_LIBRARY = {
    none: '',
    'concrete-soft': 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.12), transparent 28%), radial-gradient(circle at 80% 10%, rgba(0, 0, 0, 0.04), transparent 25%), linear-gradient(135deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%)',
    'concrete-fibers': 'linear-gradient(90deg, rgba(255, 255, 255, 0.04) 5%, transparent 5%), linear-gradient(0deg, rgba(0, 0, 0, 0.03) 10%, transparent 10%), radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.08), transparent 20%)',
    'jungle-gradient': 'linear-gradient(135deg, rgba(74, 124, 89, 0.08), rgba(31, 47, 40, 0.14))'
};

const THEME_MODE_KEY = 'amazoniaThemeMode';
let activeThemeMode = 'light';

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

function clamp(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
    if (typeof hex !== 'string') {
        return null;
    }

    const normalized = hex.trim();
    const match = normalized.match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
    if (!match) {
        return null;
    }

    const value = match[1].length === 3
        ? match[1].split('').map(char => char + char).join('')
        : match[1];

    const intValue = Number.parseInt(value, 16);
    return {
        r: (intValue >> 16) & 255,
        g: (intValue >> 8) & 255,
        b: intValue & 255
    };
}

function mixColors(baseHex, targetHex, weight) {
    const base = hexToRgb(baseHex);
    const target = hexToRgb(targetHex);
    if (!base || !target) {
        return baseHex;
    }

    const factor = clamp(weight, 0, 1);
    const mixChannel = (from, to) => Math.round(from + (to - from) * factor);

    const r = mixChannel(base.r, target.r).toString(16).padStart(2, '0');
    const g = mixChannel(base.g, target.g).toString(16).padStart(2, '0');
    const b = mixChannel(base.b, target.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function getReadableTextColor(backgroundHex, lightColor = '#ffffff', darkColor = '#0d0d0d') {
    const rgb = hexToRgb(backgroundHex);
    if (!rgb) {
        return darkColor;
    }

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.55 ? darkColor : lightColor;
}

function calculateRelativeLuminance(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) {
        return null;
    }

    const toLinear = channel => {
        const normalized = channel / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hexA, hexB) {
    const lumA = calculateRelativeLuminance(hexA);
    const lumB = calculateRelativeLuminance(hexB);

    if (lumA === null || lumB === null) {
        return null;
    }

    const lighter = Math.max(lumA, lumB) + 0.05;
    const darker = Math.min(lumA, lumB) + 0.05;
    return lighter / darker;
}

function ensureReadableColor(backgroundHex, preferredHex, minimumRatio = 4.5) {
    const fallback = getReadableTextColor(backgroundHex, '#f8f9f7', '#0f1612');
    const preferred = preferredHex || fallback;
    const contrast = getContrastRatio(backgroundHex, preferred);

    if (contrast !== null && contrast >= minimumRatio) {
        return preferred;
    }

    const fallbackContrast = getContrastRatio(backgroundHex, fallback);
    if (fallbackContrast !== null && fallbackContrast >= (contrast || 0)) {
        return fallback;
    }

    return preferred;
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

function isProductAvailable(product) {
    return getProductAvailabilityState(product) === 'available';
}

/**
 * Devuelve el estado de disponibilidad del producto:
 *   'available'  → en stock, CTA activo
 *   'consultar'  → disponibilidad bajo consulta, CTA alternativo
 *   'soldout'    → agotado, botón deshabilitado
 */
function getProductAvailabilityState(product) {
    if (!product || typeof product !== 'object') {
        return 'available';
    }

    if (typeof product.available === 'boolean' && !product.available) {
        return 'soldout';
    }

    if (typeof product.availability === 'string') {
        const normalized = product.availability.trim().toLowerCase();
        if (normalized === 'sold-out' || normalized === 'agotado') {
            return 'soldout';
        }
        if (normalized === 'consultar') {
            return 'consultar';
        }
    }

    return 'available';
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
    const available = isProductAvailable(product);

    return {
        id: toSlug(slugSource, `producto-${index + 1}`),
        name: baseName || `Producto ${index + 1}`,
        category: sanitizeText(product.category) || categoryId,
        description: sanitizeText(product.description || product.desc),
        price: normalizePrice(product.price),
        tags: normalizeTags(product.tags),
        imageUrl,
        ctaText: sanitizeText(product.ctaText),
        ctaLink: sanitizeText(product.ctaLink || product.contactLink),
        availability: available ? 'available' : 'sold-out',
        available
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
    const patternKeys = ['backgroundPattern', 'sectionPattern'];
    const colorPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

    colorKeys.forEach(key => {
        const candidate = sanitizeText(appearanceData[key]);
        normalized[key] = colorPattern.test(candidate) ? candidate : normalized[key];
    });

    imageKeys.forEach(key => {
        normalized[key] = sanitizeText(appearanceData[key]);
    });

    patternKeys.forEach(key => {
        const candidate = sanitizeText(appearanceData[key]);
        normalized[key] = candidate || normalized[key];
    });

    const mode = sanitizeText(appearanceData.mode).toLowerCase();
    normalized.mode = mode === 'dark' ? 'dark' : 'light';

    const overlayValue = Number.parseFloat(appearanceData.overlayStrength);
    normalized.overlayStrength = Number.isFinite(overlayValue)
        ? clamp(overlayValue, 0, 0.85)
        : normalized.overlayStrength;

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

function resolvePattern(patternKey) {
    if (typeof patternKey !== 'string') {
        return '';
    }
    const sanitized = patternKey.trim();
    return TEXTURE_LIBRARY[sanitized] || '';
}

function buildLayeredBackground(imageUrl, pattern) {
    const layers = [];
    if (imageUrl) {
        layers.push(`linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), url(${imageUrl})`);
    }
    if (pattern) {
        layers.push(pattern);
    }
    return layers.join(', ');
}

function resolveThemeMode(theme) {
    const storedMode = typeof localStorage !== 'undefined'
        ? localStorage.getItem(THEME_MODE_KEY)
        : null;

    if (storedMode === 'dark' || storedMode === 'light') {
        return storedMode;
    }

    return theme.mode === 'dark' ? 'dark' : 'light';
}

function applyAppearanceStyles(theme, forcedMode) {
    const root = document.documentElement;
    if (!root || !theme) {
        return;
    }

    const mode = forcedMode || resolveThemeMode(theme);
    activeThemeMode = mode;

    root.classList.toggle('theme-dark', mode === 'dark');
    root.classList.toggle('theme-light', mode !== 'dark');
    root.setAttribute('data-theme-mode', mode);

    const readableText = getReadableTextColor(theme.background, '#f8f9f7', '#0f1612');
    const mutedText = mode === 'dark'
        ? 'rgba(232, 237, 231, 0.78)'
        : 'rgba(45, 74, 43, 0.7)';
    const safeBodyText = ensureReadableColor(theme.background, theme.text);
    const backgroundBase = mode === 'dark'
        ? mixColors(theme.background, '#0b100c', 0.65)
        : theme.background;
    const surface = mode === 'dark'
        ? mixColors(theme.background, '#0b100c', 0.55)
        : '#ffffff';
    const surfaceAlt = mode === 'dark'
        ? mixColors(theme.background, '#141c15', 0.4)
        : mixColors(theme.background, '#ffffff', 0.4);
    const borderSoft = mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    root.style.setProperty('--brand-light', backgroundBase);
    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-accent', theme.accent);
    root.style.setProperty('--brand-dark', theme.header);
    root.style.setProperty('--text-body', mode === 'dark' ? readableText : safeBodyText);
    root.style.setProperty('--text-muted', mutedText);
    root.style.setProperty('--surface', surface);
    root.style.setProperty('--surface-alt', surfaceAlt);
    root.style.setProperty('--border-soft', borderSoft);
    root.style.setProperty('--text-on-primary', getReadableTextColor(theme.primary));

    const headerRgb = hexToRgb(theme.header) || { r: 31, g: 47, b: 40 };
    const overlayStrength = clamp(Number(theme.overlayStrength) || DEFAULT_APPEARANCE.overlayStrength, 0, 0.85);
    root.style.setProperty('--overlay-strong', `rgba(${headerRgb.r}, ${headerRgb.g}, ${headerRgb.b}, ${overlayStrength})`);
    root.style.setProperty('--overlay-soft', `rgba(${headerRgb.r}, ${headerRgb.g}, ${headerRgb.b}, ${Math.max(0.12, overlayStrength - 0.2)})`);

    const backgroundPattern = resolvePattern(theme.backgroundPattern);
    const sectionPattern = resolvePattern(theme.sectionPattern);
    root.style.setProperty('--texture-body', backgroundPattern || '');
    root.style.setProperty('--texture-section', sectionPattern || '');

    if (document.body) {
        document.body.style.backgroundColor = backgroundBase;
        document.body.style.backgroundImage = buildLayeredBackground(theme.backgroundImage, backgroundPattern);
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = 'cover';
    }

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundImage = buildLayeredBackground(theme.headerImage, sectionPattern || backgroundPattern);
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundRepeat = 'no-repeat';
        hero.style.backgroundBlendMode = theme.headerImage ? 'multiply' : '';
    }

    const footer = document.querySelector('.site-footer');
    if (footer) {
        footer.style.backgroundImage = buildLayeredBackground(theme.footerImage, sectionPattern || backgroundPattern);
        footer.style.backgroundSize = 'cover';
        footer.style.backgroundRepeat = 'no-repeat';
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
    if (!config || !config.contact || getProductAvailabilityState(product) === 'soldout') {
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

        const descId = `desc-${category.id}`;
        const description = document.createElement('p');
        description.className = 'section__description';
        description.id = descId;
        description.textContent = category.description;

        // Toggle "Ver descripción" visible solo en mobile (CSS oculta el botón en desktop)
        const descToggle = document.createElement('button');
        descToggle.type = 'button';
        descToggle.className = 'category-desc-toggle';
        descToggle.setAttribute('aria-expanded', 'false');
        descToggle.setAttribute('aria-controls', descId);
        descToggle.textContent = 'Ver descripción';
        descToggle.addEventListener('click', () => {
            const expanded = descToggle.getAttribute('aria-expanded') === 'true';
            descToggle.setAttribute('aria-expanded', String(!expanded));
            description.classList.toggle('is-expanded', !expanded);
            descToggle.textContent = expanded ? 'Ver descripción' : 'Ocultar descripción';
        });

        header.appendChild(title);
        header.appendChild(descToggle);
        header.appendChild(description);
        block.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'product-grid';

        items.forEach(product => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.setAttribute('aria-label', product.name);
            card.style.cursor = 'pointer';
            card.setAttribute('tabindex', '0');
            const availabilityState = getProductAvailabilityState(product);
            const isAvailable = availabilityState === 'available';

            // Abrir modal al hacer clic en la card (excepto en el CTA)
            card.addEventListener('click', event => {
                if (!event.target.closest('.product-card__actions')) {
                    openProductModal(product);
                }
            });
            card.addEventListener('keydown', event => {
                if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('.product-card__actions')) {
                    event.preventDefault();
                    openProductModal(product);
                }
            });

            const media = document.createElement('div');
            media.className = 'product-card__media';

            const badges = document.createElement('div');
            badges.className = 'product-card__badges';

            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'badge badge--category';
            categoryBadge.textContent = category.name;
            badges.appendChild(categoryBadge);

            const labelStyles = {
                nuevo: 'badge--new',
                premium: 'badge--premium',
                stock: 'badge--stock'
            };

            const addedLabels = new Set();
            product.tags.forEach(tag => {
                const normalized = tag.toLowerCase();
                const labelClass = labelStyles[normalized];
                if (labelClass && !addedLabels.has(normalized)) {
                    const label = document.createElement('span');
                    label.className = `badge ${labelClass}`;
                    label.textContent = tag;
                    badges.appendChild(label);
                    addedLabels.add(normalized);
                }
            });

            if (product.imageUrl) {
                const image = document.createElement('img');
                image.className = 'product-card__image';
                image.src = product.imageUrl;
                image.alt = `Vista de ${product.name}`;
                image.loading = 'lazy';
                image.decoding = 'async';
                media.appendChild(badges);
                media.appendChild(image);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'product-card__image product-card__image--placeholder';
                placeholder.setAttribute('role', 'img');
                placeholder.setAttribute('aria-label', `Imagen pendiente para ${product.name}`);
                placeholder.textContent = 'Imagen en preparación';
                media.appendChild(badges);
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

            if (availabilityState === 'soldout') {
                const soldOutBadge = document.createElement('span');
                soldOutBadge.className = 'badge badge--soldout';
                soldOutBadge.textContent = 'Agotado';
                badges.appendChild(soldOutBadge);
            } else if (availabilityState === 'consultar') {
                const consultarBadge = document.createElement('span');
                consultarBadge.className = 'badge badge--consultar';
                consultarBadge.textContent = 'Consultar';
                badges.appendChild(consultarBadge);
            }

            if (availabilityState === 'soldout') {
                const soldOutChip = document.createElement('span');
                soldOutChip.className = 'pill pill--soldout';
                soldOutChip.textContent = 'Agotado';
                meta.appendChild(soldOutChip);
            }

            const actions = document.createElement('div');
            actions.className = 'product-card__actions';
            const contactLink = buildContactLink(product);

            if (availabilityState === 'soldout') {
                const soldOutButton = document.createElement('button');
                soldOutButton.type = 'button';
                soldOutButton.className = 'button product-card__cta product-card__cta--disabled';
                soldOutButton.textContent = 'Agotado';
                soldOutButton.setAttribute('aria-disabled', 'true');
                actions.appendChild(soldOutButton);
            } else if (availabilityState === 'consultar') {
                const whatsappNumber = config?.contact?.whatsapp?.replace(/\D/g, '');
                const productMsg = encodeURIComponent(`Hola, quiero consultar disponibilidad de ${product.name}.`);
                const consultarButton = document.createElement('a');
                consultarButton.className = 'button product-card__cta product-card__cta--consultar';
                consultarButton.href = whatsappNumber
                    ? `https://wa.me/${whatsappNumber}?text=${productMsg}`
                    : (config?.contact?.email ? `mailto:${config.contact.email}` : '#');
                consultarButton.target = '_blank';
                consultarButton.rel = 'noopener noreferrer';
                consultarButton.textContent = 'Consultar disponibilidad';
                consultarButton.setAttribute('aria-label', `Consultar disponibilidad de ${product.name}`);
                actions.appendChild(consultarButton);
            } else if (contactLink) {
                const actionButton = document.createElement('a');
                actionButton.className = 'button product-card__cta';
                actionButton.href = contactLink.href;
                actionButton.target = contactLink.target;
                actionButton.rel = contactLink.target === '_blank' ? 'noopener noreferrer' : '';
                actionButton.textContent = contactLink.label;
                actionButton.setAttribute('aria-label', `${contactLink.label} para ${product.name}`);
                actions.appendChild(actionButton);
            }

            // Botón secundario: compartir por WhatsApp
            const whatsappShareNumber = config?.contact?.whatsapp?.replace(/\D/g, '');
            if (whatsappShareNumber) {
                const catalogUrl = window.location.href.split('?')[0];
                const shareText = encodeURIComponent(
                    `Mira este producto de Amazonia Concrete: ${product.name} — ${catalogUrl}?categoria=${product.category}`
                );
                const shareBtn = document.createElement('a');
                shareBtn.className = 'product-card__share';
                shareBtn.href = `https://wa.me/?text=${shareText}`;
                shareBtn.target = '_blank';
                shareBtn.rel = 'noopener noreferrer';
                shareBtn.setAttribute('aria-label', `Compartir ${product.name} por WhatsApp`);
                shareBtn.innerHTML = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.115 1.535 5.845L.057 23.927a.5.5 0 0 0 .609.61l6.213-1.49A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.655-.51-5.18-1.398l-.371-.22-3.847.923.962-3.72-.242-.382A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`;
                actions.appendChild(shareBtn);
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
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        const sampleNames = products.slice(0, 3).map(p => p.name).join(', ');
        empty.innerHTML = `
            <p class="empty-state__title">No encontramos productos con ese criterio.</p>
            <p class="empty-state__hint">Prueba con: <em>${sampleNames || 'Maceta, Lámpara, Mesa'}</em></p>
        `;
        container.appendChild(empty);
    }

    updateResultsCounter(filteredProducts.length);

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
    updateUrl({ categoria: activeCategory, buscar: activeSearch, precio: activePrice });
}

/* ═══════════════════════════════════════════════════
   SPRINT 2: MODAL DE DETALLE + LIGHTBOX + RELACIONADOS
   ═══════════════════════════════════════════════════ */

/**
 * Crea (una sola vez) el elemento <dialog> del modal de producto y lo agrega al DOM.
 * Retorna el dialog existente si ya fue creado.
 */
function createProductModal() {
    const existing = document.getElementById('productModal');
    if (existing) {
        return existing;
    }

    const dialog = document.createElement('dialog');
    dialog.id = 'productModal';
    dialog.className = 'product-modal';
    dialog.setAttribute('aria-labelledby', 'productModalTitle');
    dialog.setAttribute('aria-modal', 'true');

    dialog.innerHTML = `
        <div class="product-modal__inner">
            <button class="product-modal__close" id="productModalClose" aria-label="Cerrar detalle de producto" type="button">&#x2715;</button>

            <div class="product-modal__media" id="productModalMedia">
                <img id="productModalImage" class="product-modal__image" src="" alt="" loading="eager" decoding="async">
                <div id="productModalPlaceholder" class="product-modal__image product-modal__image--placeholder" role="img" aria-label="Imagen pendiente" hidden></div>
            </div>

            <div class="product-modal__content">
                <div id="productModalBadges" class="product-modal__badges"></div>
                <h2 id="productModalTitle" class="product-modal__title"></h2>
                <p id="productModalPrice" class="product-modal__price"></p>
                <p id="productModalDesc" class="product-modal__desc"></p>
                <div id="productModalMeta" class="product-meta"></div>
                <div id="productModalActions" class="product-modal__actions"></div>
            </div>

            <section id="productModalRelated" class="product-modal__related" aria-label="Productos relacionados" hidden>
                <h3 class="product-modal__related-title">También te puede interesar</h3>
                <div id="productModalRelatedGrid" class="product-modal__related-grid"></div>
            </section>
        </div>
    `;

    document.body.appendChild(dialog);

    // Cerrar al hacer clic en el backdrop (fuera del inner)
    dialog.addEventListener('click', event => {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    document.getElementById('productModalClose').addEventListener('click', () => {
        dialog.close();
    });

    return dialog;
}

/**
 * Rellena y abre el modal con los datos del producto.
 * @param {Object} product - objeto producto normalizado
 */
function openProductModal(product) {
    const dialog = createProductModal();
    const availState = getProductAvailabilityState(product);
    const categoryData = categories.find(c => c.id === product.category);

    // --- Imagen ---
    const img = document.getElementById('productModalImage');
    const placeholder = document.getElementById('productModalPlaceholder');
    if (product.imageUrl) {
        img.src = product.imageUrl;
        img.alt = `Vista de ${product.name}`;
        img.hidden = false;
        img.style.cursor = 'zoom-in';
        img.onclick = () => openImageLightbox(product.imageUrl, product.name);
        placeholder.hidden = true;
    } else {
        img.hidden = true;
        img.onclick = null;
        placeholder.setAttribute('aria-label', `Imagen pendiente para ${product.name}`);
        placeholder.hidden = false;
    }

    // --- Título y precio ---
    document.getElementById('productModalTitle').textContent = product.name;
    document.getElementById('productModalPrice').textContent = formatCurrency(product.price);
    document.getElementById('productModalDesc').textContent = product.description;

    // --- Badges ---
    const badgesContainer = document.getElementById('productModalBadges');
    badgesContainer.innerHTML = '';
    if (categoryData) {
        const catBadge = document.createElement('span');
        catBadge.className = 'badge badge--category';
        catBadge.textContent = categoryData.name;
        badgesContainer.appendChild(catBadge);
    }
    const labelMap = { nuevo: 'badge--new', premium: 'badge--premium', stock: 'badge--stock' };
    const addedLabels = new Set();
    product.tags.forEach(tag => {
        const cls = labelMap[tag.toLowerCase()];
        if (cls && !addedLabels.has(cls)) {
            const b = document.createElement('span');
            b.className = `badge ${cls}`;
            b.textContent = tag;
            badgesContainer.appendChild(b);
            addedLabels.add(cls);
        }
    });
    if (availState === 'soldout') {
        const b = document.createElement('span');
        b.className = 'badge badge--soldout';
        b.textContent = 'Agotado';
        badgesContainer.appendChild(b);
    } else if (availState === 'consultar') {
        const b = document.createElement('span');
        b.className = 'badge badge--consultar';
        b.textContent = 'Consultar';
        badgesContainer.appendChild(b);
    }

    // --- Tags (pills) ---
    const metaContainer = document.getElementById('productModalMeta');
    metaContainer.innerHTML = '';
    product.tags.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'pill';
        chip.textContent = tag;
        metaContainer.appendChild(chip);
    });

    // --- Variantes de acabado/color ---
    const existingVariantsSection = document.getElementById('productModalVariants');
    if (existingVariantsSection) {
        existingVariantsSection.remove();
    }
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        const variantsSection = document.createElement('div');
        variantsSection.id = 'productModalVariants';
        variantsSection.className = 'product-modal__variants';
        const variantsLabel = document.createElement('p');
        variantsLabel.className = 'product-modal__variants-label';
        variantsLabel.textContent = 'Acabados disponibles';
        variantsSection.appendChild(variantsLabel);
        const variantsList = document.createElement('div');
        variantsList.className = 'product-modal__variants-list';
        product.variants.forEach((variant, index) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `variant-pill ${index === 0 ? 'is-active' : ''}`;
            pill.textContent = variant;
            pill.setAttribute('aria-pressed', String(index === 0));
            pill.addEventListener('click', () => {
                variantsList.querySelectorAll('.variant-pill').forEach(p => {
                    p.classList.remove('is-active');
                    p.setAttribute('aria-pressed', 'false');
                });
                pill.classList.add('is-active');
                pill.setAttribute('aria-pressed', 'true');
            });
            variantsList.appendChild(pill);
        });
        variantsSection.appendChild(variantsList);
        // Insertar antes de las acciones CTA
        const actionsEl = document.getElementById('productModalActions');
        if (actionsEl) {
            actionsEl.parentNode.insertBefore(variantsSection, actionsEl);
        } else {
            document.getElementById('productModalContent').appendChild(variantsSection);
        }
    }

    // --- CTA ---
    const actionsContainer = document.getElementById('productModalActions');
    actionsContainer.innerHTML = '';
    if (availState === 'soldout') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'button product-card__cta product-card__cta--disabled';
        btn.textContent = 'Agotado';
        btn.setAttribute('aria-disabled', 'true');
        actionsContainer.appendChild(btn);
    } else {
        const whatsappNumber = config?.contact?.whatsapp?.replace(/\D/g, '');
        const isConsultar = availState === 'consultar';
        const msgText = isConsultar
            ? `Hola, quiero consultar disponibilidad de ${product.name}.`
            : `Hola, quiero saber más sobre ${product.name}.`;
        const encodedMsg = encodeURIComponent(msgText);

        let href = '#';
        if (whatsappNumber) {
            href = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
        } else if (config?.contact?.email) {
            href = `mailto:${config.contact.email}?subject=${encodeURIComponent(`Consulta sobre ${product.name}`)}`;
        }

        const ctaText = isConsultar
            ? 'Consultar disponibilidad'
            : (product.ctaText || config?.contact?.ctaText || 'Solicitar información');

        const btn = document.createElement('a');
        btn.className = `button product-card__cta${isConsultar ? ' product-card__cta--consultar' : ''}`;
        btn.href = href;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.textContent = ctaText;
        btn.setAttribute('aria-label', `${ctaText} para ${product.name}`);
        actionsContainer.appendChild(btn);
    }

    // --- Productos relacionados ---
    renderRelatedProducts(product);

    dialog.showModal();
}

/**
 * Rellena la sección de productos relacionados dentro del modal.
 * Muestra hasta 3 productos de la misma categoría, excluyendo el actual.
 */
function renderRelatedProducts(currentProduct) {
    const relatedSection = document.getElementById('productModalRelated');
    const relatedGrid = document.getElementById('productModalRelatedGrid');
    if (!relatedSection || !relatedGrid) {
        return;
    }

    const related = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 3);

    if (related.length === 0) {
        relatedSection.hidden = true;
        return;
    }

    relatedGrid.innerHTML = '';
    related.forEach(product => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'related-card';
        card.setAttribute('aria-label', `Ver detalle de ${product.name}`);

        if (product.imageUrl) {
            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.alt = `Vista de ${product.name}`;
            img.className = 'related-card__image';
            img.loading = 'lazy';
            img.decoding = 'async';
            card.appendChild(img);
        } else {
            const ph = document.createElement('div');
            ph.className = 'related-card__image related-card__image--placeholder';
            ph.setAttribute('aria-hidden', 'true');
            card.appendChild(ph);
        }

        const info = document.createElement('div');
        info.className = 'related-card__info';
        const nameEl = document.createElement('span');
        nameEl.className = 'related-card__name';
        nameEl.textContent = product.name;
        const priceEl = document.createElement('span');
        priceEl.className = 'related-card__price';
        priceEl.textContent = formatCurrency(product.price);
        info.appendChild(nameEl);
        info.appendChild(priceEl);
        card.appendChild(info);

        card.addEventListener('click', () => openProductModal(product));
        relatedGrid.appendChild(card);
    });

    relatedSection.hidden = false;
}

/**
 * Abre el lightbox con la imagen a tamaño completo.
 * Se crea una sola vez en el DOM.
 */
function openImageLightbox(imageUrl, productName) {
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.className = 'image-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-label', 'Imagen ampliada');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.hidden = true;

        lightbox.innerHTML = `
            <button class="image-lightbox__close" aria-label="Cerrar imagen ampliada" type="button">&#x2715;</button>
            <img class="image-lightbox__img" src="" alt="">
        `;

        lightbox.querySelector('.image-lightbox__close').addEventListener('click', () => {
            lightbox.hidden = true;
        });
        lightbox.addEventListener('click', event => {
            if (event.target === lightbox) {
                lightbox.hidden = true;
            }
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !lightbox.hidden) {
                lightbox.hidden = true;
            }
        });

        document.body.appendChild(lightbox);
    }

    const img = lightbox.querySelector('.image-lightbox__img');
    img.src = imageUrl;
    img.alt = `Vista ampliada de ${productName}`;
    lightbox.hidden = false;
    lightbox.querySelector('.image-lightbox__close').focus();
}

function updateThemeToggleLabel(toggleButton, mode) {
    if (!toggleButton) {
        return;
    }

    const isDark = mode === 'dark';
    toggleButton.textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
    toggleButton.setAttribute('aria-pressed', String(isDark));
    toggleButton.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
}

function setupThemeToggle(theme) {
    const target = document.querySelector('.site-header') || document.body;
    if (!target) {
        return;
    }

    let toggle = document.getElementById('themeToggle');
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.id = 'themeToggle';
        toggle.className = 'theme-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-live', 'polite');
        target.appendChild(toggle);
    }

    updateThemeToggleLabel(toggle, activeThemeMode);

    toggle.addEventListener('click', () => {
        const nextMode = activeThemeMode === 'dark' ? 'light' : 'dark';
        activeThemeMode = nextMode;
        applyAppearanceStyles(theme, nextMode);
        updateThemeToggleLabel(toggle, nextMode);

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(THEME_MODE_KEY, nextMode);
        }
    });
}

/* ─── URL profunda: estado del catálogo en query params ─── */

function readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        categoria: params.get('categoria'),
        buscar: params.get('buscar'),
        precio: params.get('precio')
    };
}

function updateUrl({ categoria, buscar, precio } = {}) {
    if (!window.history || !window.history.replaceState) {
        return;
    }
    const params = new URLSearchParams();
    if (categoria) {
        params.set('categoria', categoria);
    }
    if (buscar) {
        params.set('buscar', buscar);
    }
    if (precio && precio !== '') {
        params.set('precio', precio);
    }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

/* ─── Contador de resultados ─── */

function updateResultsCounter(count) {
    let counter = document.getElementById('resultsCounter');
    if (!counter) {
        const container = document.getElementById('catalogProducts');
        if (!container || !container.parentNode) {
            return;
        }
        counter = document.createElement('p');
        counter.id = 'resultsCounter';
        counter.className = 'results-counter';
        container.parentNode.insertBefore(counter, container);
    }
    counter.textContent = count === 1
        ? 'Mostrando 1 producto'
        : `Mostrando ${count} producto${count !== 0 ? 's' : ''}`;
}

/* ─── Utilidad: debounce ─── */

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/* ─── JSON-LD schema.org/Product ─── */

function injectProductSchema(visibleProducts) {
    const existing = document.getElementById('product-jsonld');
    if (existing) {
        existing.remove();
    }

    if (!visibleProducts || visibleProducts.length === 0) {
        return;
    }

    const catalogName = config?.about?.storeName || 'Amazonia Concrete';

    const items = visibleProducts.map((product, index) => {
        const availState = getProductAvailabilityState(product);
        const schemaAvailability = availState === 'soldout'
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock';

        const item = {
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: product.name,
                description: product.description,
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'COP',
                    price: product.price,
                    availability: schemaAvailability
                }
            }
        };
        if (product.imageUrl) {
            item.item.image = product.imageUrl;
        }
        return item;
    });

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Catálogo ${catalogName}`,
        itemListElement: items
    };

    const script = document.createElement('script');
    script.id = 'product-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

function initCatalog() {
    const dataset = loadDataset();
    categories = dataset.categories;
    products = dataset.products;
    config = dataset.config;

    applyAppearanceStyles(config.appearance);
    renderPriceFilterOptions();
    createProductModal();

    // Restaurar estado desde URL al cargar
    const urlParams = readUrlParams();
    const initialCategory = urlParams.categoria || null;
    renderCategoryTags(initialCategory);
    applyFilters({
        category: initialCategory,
        search: urlParams.buscar || '',
        price: urlParams.precio || ''
    });

    injectProductSchema(products);
    setupThemeToggle(config.appearance);

    const searchInput = document.getElementById('searchInput');
    const priceSelect = document.getElementById('priceSelect');

    if (searchInput && urlParams.buscar) {
        searchInput.value = urlParams.buscar;
    }
    if (priceSelect && urlParams.precio) {
        priceSelect.value = urlParams.precio;
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(event => {
            applyFilters({ search: event.target.value });
        }, 250));
    }

    if (priceSelect) {
        priceSelect.addEventListener('change', event => {
            applyFilters({ price: event.target.value });
        });
    }

    setupStickyOffset();
    window.addEventListener('resize', debounce(setupStickyOffset, 150));
}

/**
 * Mide la altura del header sticky y actualiza la variable CSS --header-height.
 * La usa el sidebar para pegarse justo debajo del header en mobile.
 */
function setupStickyOffset() {
    const header = document.querySelector('.site-header');
    if (!header) {
        return;
    }
    document.documentElement.style.setProperty(
        '--header-height',
        `${header.getBoundingClientRect().height}px`
    );
}

document.addEventListener('DOMContentLoaded', initCatalog);
