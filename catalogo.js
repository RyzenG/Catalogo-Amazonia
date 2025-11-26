const categories = [
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

const products = [
    {
        id: 'mesa-rio',
        name: 'Mesa Río',
        category: 'mobiliario',
        description: 'Cubierta sellada con resina natural, patas de acero grafito.',
        price: 380000,
        tags: ['interior', 'premium']
    },
    {
        id: 'banca-selva',
        name: 'Banca Selva',
        category: 'mobiliario',
        description: 'Textura inspirada en corteza amazónica, ideal para exteriores.',
        price: 180000,
        tags: ['exterior', 'stock']
    },
    {
        id: 'lampara-aurora',
        name: 'Lámpara Aurora',
        category: 'iluminacion',
        description: 'Difusor cálido y cuerpo de concreto ultraligero pigmentado.',
        price: 240000,
        tags: ['nuevo', 'tendencia']
    },
    {
        id: 'pendulo-bruma',
        name: 'Péndulo Bruma',
        category: 'iluminacion',
        description: 'Colgante con acabado gris humo y cable textil verde musgo.',
        price: 460000,
        tags: ['premium']
    },
    {
        id: 'maceta-lago',
        name: 'Maceta Lago',
        category: 'accesorios',
        description: 'Maceta cilíndrica en concreto pigmentado, resistente a exteriores.',
        price: 95000,
        tags: ['exterior', 'stock']
    },
    {
        id: 'bowl-ceniza',
        name: 'Bowl Ceniza',
        category: 'accesorios',
        description: 'Pieza decorativa con sello hidrófugo y textura fina.',
        price: 65000,
        tags: ['interior']
    }
];

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

function renderCategoryTags(activeCategoryId) {
    const container = document.getElementById('categoryTags');
    container.innerHTML = '';

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

function matchesPriceRange(product, priceFilter) {
    if (priceFilter === 'low') return product.price <= 150000;
    if (priceFilter === 'mid') return product.price > 150000 && product.price <= 400000;
    if (priceFilter === 'high') return product.price > 400000;
    return true;
}

function applyFilters({ search, price, category } = {}) {
    const searchInput = document.getElementById('searchInput');
    const priceSelect = document.getElementById('priceSelect');

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

function renderProducts(filteredProducts, activeCategory) {
    const container = document.getElementById('catalogProducts');
    const grouped = groupProducts(filteredProducts);
    container.innerHTML = '';

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
            const card = document.createElement('div');
            card.className = 'product-card';

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

            card.appendChild(headerRow);
            card.appendChild(description);
            card.appendChild(meta);
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

function initCatalog() {
    renderCategoryTags(null);
    applyFilters();

    document.getElementById('searchInput').addEventListener('input', event => {
        applyFilters({ search: event.target.value });
    });

    document.getElementById('priceSelect').addEventListener('change', event => {
        applyFilters({ price: event.target.value });
    });
}

document.addEventListener('DOMContentLoaded', initCatalog);
