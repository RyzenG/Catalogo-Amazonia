export function generateCategoryId(value) {
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

export function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function escapeHtml(value) {
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

const COP_CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

export function formatCurrencyCOP(value) {
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

export function getProductImageSource(product, fallbackIcon = '🛠️') {
    if (!product) {
        return createIconPlaceholder(fallbackIcon, 'Producto Amazonia');
    }

    if (product.image) {
        return product.image;
    }

    const iconValue = product.icon || fallbackIcon;
    const nameValue = product.name || 'Producto Amazonia';

    if (!iconValue) {
        return createIconPlaceholder('🛠️', nameValue);
    }

    return createIconPlaceholder(iconValue, nameValue);
}

export function stripLegacyImageData(productsByCategory) {
    if (!productsByCategory || typeof productsByCategory !== 'object') {
        return;
    }

    Object.values(productsByCategory).forEach(productList => {
        if (!Array.isArray(productList)) {
            return;
        }

        productList.forEach(product => {
            if (product && typeof product === 'object' && Object.prototype.hasOwnProperty.call(product, 'imageData')) {
                delete product.imageData;
            }
        });
    });
}
