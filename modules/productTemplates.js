export function createProductTemplates({ escapeHtml, formatCurrency, getProductImageSource }) {
    if (typeof escapeHtml !== 'function') {
        throw new TypeError('createProductTemplates requiere una función escapeHtml');
    }

    if (typeof formatCurrency !== 'function') {
        throw new TypeError('createProductTemplates requiere una función formatCurrency');
    }

    if (typeof getProductImageSource !== 'function') {
        throw new TypeError('createProductTemplates requiere una función getProductImageSource');
    }

    function sanitizeFeatures(features) {
        if (!Array.isArray(features)) {
            return [];
        }

        return features
            .map(feature => (typeof feature === 'string' ? feature.trim() : ''))
            .filter(feature => feature.length > 0)
            .map(feature => escapeHtml(feature));
    }

    function resolveActionLabel(rawName) {
        const base = typeof rawName === 'string' && rawName.trim().length > 0
            ? rawName.trim()
            : 'este producto';
        return escapeHtml(base);
    }

    function resolveProductName(rawName) {
        const base = typeof rawName === 'string' && rawName.trim().length > 0
            ? rawName
            : 'Producto sin nombre';
        return {
            text: base,
            html: escapeHtml(base)
        };
    }

    function mapProductToTemplateData(product, index, totalProducts) {
        const { text: productNameText, html: productNameHtml } = resolveProductName(product?.name);
        const productId = typeof product?.id === 'string' ? product.id : '';
        const productIdAttr = escapeHtml(productId);
        const shortDesc = typeof product?.shortDesc === 'string' ? product.shortDesc : '';
        const shortDescHtml = escapeHtml(shortDesc);
        const formattedPrice = formatCurrency(product?.price);
        const priceHtml = escapeHtml(formattedPrice);
        const actionLabelAttr = resolveActionLabel(productNameText);
        const sanitizedFeatures = sanitizeFeatures(product?.features);
        const featuresAttr = sanitizedFeatures.join('||');
        const imageSrc = escapeHtml(getProductImageSource(product));
        const imageAlt = escapeHtml(`Vista previa de ${productNameText}`);

        return {
            id: productIdAttr,
            disableUp: index === 0,
            disableDown: index === totalProducts - 1,
            actionLabelAttr,
            productNameHtml,
            priceHtml,
            imageSrc,
            imageAlt,
            shortDescHtml,
            featuresAttr
        };
    }

    function productItemTemplate(data) {
        const disableUpAttr = data.disableUp ? 'disabled' : '';
        const disableDownAttr = data.disableDown ? 'disabled' : '';

        return `
            <div class="product-item" data-product-id="${data.id}" data-short-desc="${data.shortDescHtml}" data-features="${data.featuresAttr}">
                <div class="order-controls">
                    <button type="button" class="icon-btn move-btn" data-action="move" data-direction="up" data-product-id="${data.id}" aria-label="Mover ${data.actionLabelAttr} hacia arriba" title="Mover ${data.actionLabelAttr} hacia arriba" ${disableUpAttr}>↑</button>
                    <button type="button" class="icon-btn move-btn" data-action="move" data-direction="down" data-product-id="${data.id}" aria-label="Mover ${data.actionLabelAttr} hacia abajo" title="Mover ${data.actionLabelAttr} hacia abajo" ${disableDownAttr}>↓</button>
                </div>
                <div class="product-thumb">
                    <img src="${data.imageSrc}" alt="${data.imageAlt}">
                </div>
                <div class="product-info">
                    <div class="product-name">${data.productNameHtml}</div>
                    <div class="product-price">${data.priceHtml}</div>
                </div>
                <div class="product-actions">
                    <button type="button" class="icon-btn edit-btn" data-action="edit" data-product-id="${data.id}" aria-label="Editar ${data.actionLabelAttr}" title="Editar ${data.actionLabelAttr}">✏️</button>
                    <button type="button" class="icon-btn delete-btn" data-action="delete" data-product-id="${data.id}" aria-label="Eliminar ${data.actionLabelAttr}" title="Eliminar ${data.actionLabelAttr}">🗑️</button>
                </div>
            </div>`;
    }

    function renderProductList(products) {
        if (!Array.isArray(products) || products.length === 0) {
            return '';
        }

        return products
            .map((product, index) => mapProductToTemplateData(product, index, products.length))
            .map(productItemTemplate)
            .join('');
    }

    return {
        renderProductList,
        productItemTemplate,
        mapProductToTemplateData,
        sanitizeFeatures
    };
}
