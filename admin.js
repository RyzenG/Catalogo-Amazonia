        // Default data structure
        const defaultConfig = {
            whatsapp: '573000000000',
            email: 'info@amazoniaconcrete.com',
            phone: '+57 300 000 0000',
            address: '',
            companyName: 'AMAZONIA CONCRETE',
            tagline: 'Naturaleza y Modernidad en Perfecta Armonía',
            footerMessage: 'Creando espacios únicos con concreto sostenible',
            logoData: ''
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

        let catalogData = {
            config: { ...defaultConfig },
            categories: defaultCategories.map(category => ({ ...category })),
            products: createDefaultProductsMap(defaultCategories),
            categoryInfo: {}
        };

        let currentCategory = defaultCategories[0] ? defaultCategories[0].id : '';
        let editingProductId = null;
        let currentImageData = null;
        let currentImageUrl = '';
        let currentIconFallback = '';

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

        function getProductImageSource(product, fallbackIcon = '🛠️') {
            if (!product) {
                return createIconPlaceholder(fallbackIcon, 'Producto Amazonia');
            }

            if (product.imageData) {
                return product.imageData;
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

        function ensureCategoryStructure() {
            if (!catalogData || typeof catalogData !== 'object') {
                catalogData = {
                    config: { ...defaultConfig },
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

            catalogData.categories.forEach(category => {
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
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'btn btn-danger';
                deleteButton.textContent = 'Eliminar';
                deleteButton.disabled = totalCategories <= 1;
                if (deleteButton.disabled) {
                    deleteButton.title = 'Debe existir al menos una categoría activa.';
                }
                deleteButton.addEventListener('click', () => deleteCategory(category.id));
                actions.appendChild(deleteButton);

                item.appendChild(grid);
                item.appendChild(descriptionGroup);
                item.appendChild(actions);

                list.appendChild(item);
            });
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
            refreshCategoriesUI({ preserveCurrent: true });
            loadProducts();
            saveData();
            showMessage('Categoría añadida correctamente', 'success');
            renderCategoryManagerList();
            resetNewCategoryForm();
        }

        function saveCategoryEdits() {
            const list = document.getElementById('categoryManagerList');
            if (!list) {
                return;
            }

            const items = Array.from(list.querySelectorAll('.category-manager-item'));
            if (items.length === 0) {
                closeCategoryModal();
                return;
            }

            items.forEach(item => {
                const categoryId = item.dataset.categoryId;
                const nameInput = item.querySelector('[data-field="name"]');
                const iconInput = item.querySelector('[data-field="icon"]');
                const descriptionInput = item.querySelector('[data-field="description"]');

                const category = catalogData.categories.find(cat => cat.id === categoryId);
                if (category) {
                    category.name = (nameInput && nameInput.value.trim()) || 'Nueva categoría';
                    category.icon = (iconInput && iconInput.value.trim()) || '📦';
                    category.description = descriptionInput ? descriptionInput.value : '';
                }
            });

            refreshCategoriesUI({ preserveCurrent: true });
            loadProducts();
            saveData();
            showMessage('Categorías actualizadas correctamente', 'success');
            renderCategoryManagerList();
        }

        function deleteCategory(categoryId) {
            ensureCategoryStructure();

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

            refreshCategoriesUI({ preserveCurrent: false });
            loadProducts();
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
            currentImageData = null;
            currentImageUrl = '';
            updateProductImagePreview(null);
            const imageUrlInput = document.getElementById('productImageUrl');
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
            const logoData = catalogData && catalogData.config ? catalogData.config.logoData : '';
            updateLogoPreview(logoData || null);
        }

        function setupImageInput() {
            const imageInput = document.getElementById('productImage');
            const imageUrlInput = document.getElementById('productImageUrl');

            if (imageInput) {
                imageInput.addEventListener('change', handleProductImageChange);
            }

            if (imageUrlInput) {
                imageUrlInput.addEventListener('input', handleProductImageUrlChange);
            }
        }

        function setupLogoInput() {
            const logoInput = document.getElementById('companyLogo');
            if (!logoInput) {
                return;
            }

            logoInput.addEventListener('change', handleCompanyLogoChange);
        }

        function handleProductImageChange(event) {
            const file = event.target.files && event.target.files[0];

            if (!file) {
                if (currentImageUrl) {
                    updateProductImagePreview(currentImageUrl, 'Vista previa del producto');
                } else if (!currentImageData) {
                    updateProductImagePreview(null);
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = function(loadEvent) {
                currentImageData = loadEvent.target && loadEvent.target.result ? loadEvent.target.result : null;
                currentImageUrl = '';
                currentIconFallback = '';
                updateProductImagePreview(currentImageData, file.name);
                const imageUrlInput = document.getElementById('productImageUrl');
                if (imageUrlInput) {
                    imageUrlInput.value = '';
                }
            };
            reader.readAsDataURL(file);
        }

        function handleProductImageUrlChange(event) {
            const urlValue = event && event.target ? event.target.value.trim() : '';
            currentImageUrl = urlValue;

            if (urlValue) {
                currentImageData = null;
                const imageInput = document.getElementById('productImage');
                if (imageInput && imageInput.value) {
                    imageInput.value = '';
                }
                updateProductImagePreview(urlValue, 'Vista previa del producto');
            } else if (!currentImageData) {
                updateProductImagePreview(null);
            }
        }

        function handleCompanyLogoChange(event) {
            const file = event.target.files && event.target.files[0];
            const input = event.target;

            if (!file) {
                const hasLogo = catalogData && catalogData.config && catalogData.config.logoData;
                if (!hasLogo) {
                    updateLogoPreview(null);
                }
                return;
            }

            const reader = new FileReader();
            reader.onload = function(loadEvent) {
                const result = loadEvent.target && loadEvent.target.result ? loadEvent.target.result : null;
                catalogData.config = catalogData.config || {};
                catalogData.config.logoData = result || '';
                updateLogoPreview(result);
                updateCatalogPreview();
                if (input) {
                    input.value = '';
                }
            };
            reader.readAsDataURL(file);
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

            const saveConfigButton = document.getElementById('saveConfigButton');
            if (saveConfigButton) {
                saveConfigButton.addEventListener('click', saveConfig);
            }

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
            registerAdminEventHandlers();
            loadData();
            renderFeatureInputs();
            setupImageInput();
            setupLogoInput();
            resetImagePreview();
        });

        // Load saved data from localStorage
        function loadData() {
            const saved = localStorage.getItem('amazoniaData');

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    console.log('Datos cargados correctamente');

                    if (parsed && typeof parsed === 'object') {
                        catalogData.config = { ...defaultConfig, ...(parsed.config || {}) };
                        catalogData.categories = Array.isArray(parsed.categories)
                            ? parsed.categories
                            : defaultCategories.map(category => ({ ...category }));
                        catalogData.products = parsed.products && typeof parsed.products === 'object'
                            ? parsed.products
                            : createDefaultProductsMap(catalogData.categories);
                        catalogData.categoryInfo = isPlainObject(parsed.categoryInfo) ? parsed.categoryInfo : {};
                    }
                } catch (error) {
                    console.error('No se pudieron leer los datos guardados', error);
                    catalogData = {
                        config: { ...defaultConfig },
                        categories: defaultCategories.map(category => ({ ...category })),
                        products: createDefaultProductsMap(defaultCategories),
                        categoryInfo: {}
                    };
                }
            } else {
                catalogData = {
                    config: { ...defaultConfig },
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
        function saveData() {
            ensureCategoryStructure();
            localStorage.setItem('amazoniaData', JSON.stringify(catalogData));
            showMessage('Datos guardados correctamente', 'success');
            updateCatalogPreview();
        }

        // Load configuration
        function loadConfig() {
            document.getElementById('whatsapp').value = catalogData.config.whatsapp || '';
            document.getElementById('email').value = catalogData.config.email || '';
            document.getElementById('phone').value = catalogData.config.phone || '';
            document.getElementById('address').value = catalogData.config.address || '';
            document.getElementById('companyName').value = catalogData.config.companyName || '';
            document.getElementById('tagline').value = catalogData.config.tagline || '';
            document.getElementById('footerMessage').value = catalogData.config.footerMessage || '';
            updateLogoPreview(catalogData.config.logoData || null);
            const logoInput = document.getElementById('companyLogo');
            if (logoInput) {
                logoInput.value = '';
            }
            updateCatalogPreview();
        }

        // Save configuration
        function saveConfig() {
            const existingLogoData = catalogData && catalogData.config && catalogData.config.logoData
                ? catalogData.config.logoData
                : '';
            catalogData.config = {
                whatsapp: document.getElementById('whatsapp').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                companyName: document.getElementById('companyName').value,
                tagline: document.getElementById('tagline').value,
                footerMessage: document.getElementById('footerMessage').value,
                logoData: existingLogoData
            };
            saveData();
        }

        // Show section
        function showSection(section) {
            document.getElementById('configSection').style.display = section === 'config' ? 'block' : 'none';
            document.getElementById('productsSection').style.display = section === 'products' ? 'block' : 'none';

            if (section === 'products') {
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
                    const hasPrice = typeof product.price !== 'undefined' && product.price !== null;
                    const rawPrice = hasPrice ? String(product.price) : '';
                    const priceHtml = escapeHtml(rawPrice);
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
                        <button type="button" class="icon-btn move-btn" data-action="move" data-direction="up" data-product-id="${product.id}" ${disableUp}>↑</button>
                        <button type="button" class="icon-btn move-btn" data-action="move" data-direction="down" data-product-id="${product.id}" ${disableDown}>↓</button>
                    </div>
                    <div class="product-thumb">
                        <img src="${imageSrc}" alt="${imageAlt}">
                    </div>
                    <div class="product-info">
                        <div class="product-name">${productNameHtml}</div>
                        <div class="product-price">${priceHtml}</div>
                    </div>
                    <div class="product-actions">
                        <button type="button" class="icon-btn edit-btn" data-action="edit" data-product-id="${product.id}">✏️</button>
                        <button type="button" class="icon-btn delete-btn" data-action="delete" data-product-id="${product.id}">🗑️</button>
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

            editingProductId = productId;

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
                    document.getElementById('productPrice').value = product.price;
                    document.getElementById('productSpecs').value = product.specs || '';
                    document.getElementById('productId').value = productId;

                    const imageUrlInput = document.getElementById('productImageUrl');
                    const productImageUrl = typeof product.image === 'string' ? product.image : '';

                    if (imageUrlInput) {
                        imageUrlInput.value = productImageUrl;
                    }

                    if (product.imageData) {
                        currentImageData = product.imageData;
                        currentImageUrl = productImageUrl;
                    } else if (productImageUrl) {
                        currentImageData = null;
                        currentImageUrl = productImageUrl;
                    } else {
                        currentImageData = null;
                        currentImageUrl = '';
                    }
                    currentIconFallback = product.icon || '';
                    const previewSource = currentImageData || currentImageUrl || createIconPlaceholder(currentIconFallback || '🛠️', product.name);
                    updateProductImagePreview(previewSource, product.name || 'Producto Amazonia');
                    const imageInput = document.getElementById('productImage');
                    if (imageInput) {
                        imageInput.value = '';
                    }

                    renderFeatureInputs(product.features);
                }
            } else {
                document.getElementById('modalTitle').textContent = 'Añadir Producto';
                form.reset();
                renderCategoryOptions(currentCategory);
                document.getElementById('productCategory').value = currentCategory;
                document.getElementById('productId').value = '';
                currentImageData = null;
                currentImageUrl = '';
                currentIconFallback = '';
                const imageInput = document.getElementById('productImage');
                if (imageInput) {
                    imageInput.value = '';
                }
                const imageUrlInput = document.getElementById('productImageUrl');
                if (imageUrlInput) {
                    imageUrlInput.value = '';
                }
                updateProductImagePreview(null);
                renderFeatureInputs();
            }

            modal.classList.add('active');
        }

        // Close modal
        function closeProductModal() {
            document.getElementById('productModal').classList.remove('active');
            document.getElementById('productForm').reset();
            editingProductId = null;
            currentImageData = null;
            currentImageUrl = '';
            currentIconFallback = '';
            const imageInput = document.getElementById('productImage');
            if (imageInput) {
                imageInput.value = '';
            }
            const imageUrlInput = document.getElementById('productImageUrl');
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
            updateProductImagePreview(null);
            renderFeatureInputs();
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

            const imageUrlInput = document.getElementById('productImageUrl');
            const imageUrl = imageUrlInput ? imageUrlInput.value.trim() : '';

            const productData = {
                id: editingProductId || 'product_' + Date.now(),
                name: document.getElementById('productName').value,
                shortDesc: document.getElementById('productShortDesc').value,
                longDesc: document.getElementById('productLongDesc').value,
                price: document.getElementById('productPrice').value,
                features: features,
                specs: document.getElementById('productSpecs').value,
                imageData: currentImageData || null
            };

            if (imageUrl && !currentImageData) {
                productData.image = imageUrl;
                productData.imageData = null;
            } else {
                delete productData.image;
            }

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
        function showMessage(message, type) {
            const statusMessage = document.getElementById('statusMessage');
            statusMessage.textContent = message;
            statusMessage.className = 'status-message ' + type;
            
            setTimeout(() => {
                statusMessage.className = 'status-message';
            }, 3000);
        }

        // Export data
        function exportData() {
            const dataStr = JSON.stringify(catalogData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'amazonia_datos_' + new Date().toISOString().split('T')[0] + '.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showMessage('Datos exportados correctamente', 'success');
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
                        catalogData.config = { ...defaultConfig, ...(parsed.config || {}) };
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
            // First save current data
            saveData();

            // Generate the HTML content
            const htmlContent = generateCatalogHTML();
            
            // Create download link
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'catalogo_amazonia_' + new Date().toISOString().split('T')[0] + '.html';
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);

            showMessage('¡Catálogo generado correctamente! Revisa tu carpeta de descargas.', 'success');
        }

        function updateCatalogPreview() {
            const previewFrame = document.getElementById('catalogPreview');
            if (!previewFrame) {
                return;
            }

            try {
                const htmlContent = generateCatalogHTML();
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
        function generateCatalogHTML() {
            ensureCategoryStructure();
            const config = catalogData.config;
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

            const trimmedConfig = {
                whatsapp: (config.whatsapp || '').trim(),
                email: (config.email || '').trim(),
                phone: (config.phone || '').trim(),
                address: (config.address || '').trim(),
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
                        const imageSrc = getProductImageSource(product, categoryIcon);
                        const imageAlt = escapeHtml(`Imagen de ${rawName}`);
                        const hasPrice = typeof product.price !== 'undefined' && product.price !== null;
                        const rawPrice = hasPrice ? String(product.price) : '';
                        const productPriceHtml = escapeHtml(rawPrice);
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

            const contactButtons = [
                trimmedConfig.phone ? `<a id="contactPhone" class="contact-btn" href="#">📞 Llamar</a>` : '',
                trimmedConfig.email ? `<a id="contactEmail" class="contact-btn" href="#">✉️ Email</a>` : '',
                trimmedConfig.whatsapp ? `<a id="contactWhatsAppLink" class="contact-btn" href="#">💬 WhatsApp</a>` : '',
                trimmedConfig.address ? `<a id="contactAddress" class="contact-btn" href="#">📍 Ubicación</a>` : ''
            ].filter(Boolean).join('');

            // Generate the complete HTML
            return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyNameHtml || defaultCompanyNameHtml} - Catálogo Digital</title>
    <style>
        ${getCatalogStyles()}
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div class="loader" id="loader">
        <svg class="leaf-spinner" viewBox="0 0 100 100">
            <path d="M50 20 Q30 40 50 60 Q70 40 50 20" fill="#6b8e68"/>
            <path d="M50 40 Q30 60 50 80 Q70 60 50 40" fill="#8fa68c"/>
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
                        <img id="modalImage" src="" alt="Imagen del producto seleccionado">
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
                <p>${footerMessageHtml}</p>
                <div class="contact-buttons">${contactButtons}</div>
            </div>
            <p style="margin-top: 2rem; opacity: 0.7;">© 2024 ${footerCompanyName} - Todos los derechos reservados</p>
        </div>
    </footer>

    <script>
        ${getCatalogScript(productDataJS, config, serializeForScript)}
    <\/script>
</body>
</html>`;
        }

        // Get catalog styles
        function getCatalogStyles() {
            return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            overflow-x: hidden;
        }

        /* Loading Screen */
        .loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: #2d4a2b;
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
            background: linear-gradient(135deg, #2d4a2b 0%, #3d5a3b 100%);
            color: white;
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
            background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
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
            background: linear-gradient(135deg, #6b8e68 0%, #8fa68c 100%);
            color: white;
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
            box-shadow: 0 5px 15px rgba(107,142,104,0.3);
        }

        .nav-btn.active {
            background: linear-gradient(135deg, #2d4a2b 0%, #3d5a3b 100%);
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
            color: #2d4a2b;
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
            background: linear-gradient(90deg, transparent, #6b8e68, transparent);
        }

        .category-description {
            text-align: center;
            color: #666;
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
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
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
            background: linear-gradient(135deg, rgba(107,142,104,0.1) 0%, rgba(45,74,43,0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }

        .product-card:hover::before {
            opacity: 1;
        }

        .product-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .product-image {
            width: 100%;
            height: 250px;
            background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
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
            color: #2d4a2b;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }

        .product-description {
            color: #666;
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
            background: rgba(107,142,104,0.1);
            color: #2d4a2b;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.85rem;
        }

        .product-price {
            font-size: 1.5rem;
            color: #6b8e68;
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
            background: linear-gradient(135deg, #2d4a2b 0%, #3d5a3b 100%);
            color: white;
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
            width: 100%;
            max-height: 320px;
            background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
            border-radius: 10px;
            overflow: hidden;
            display: block;
        }

        .modal-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .modal-details h3 {
            color: #2d4a2b;
            margin-bottom: 1rem;
        }

        .modal-details p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1rem;
        }

        .specs-list {
            list-style: none;
            margin: 1rem 0;
        }

        .specs-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }

        .cta-section {
            background: rgba(107,142,104,0.1);
            padding: 1.5rem;
            border-radius: 10px;
            text-align: center;
        }

        .cta-button {
            background: linear-gradient(135deg, #6b8e68 0%, #8fa68c 100%);
            color: white;
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
            box-shadow: 0 5px 15px rgba(107,142,104,0.3);
        }

        /* Footer */
        footer {
            background: #2d4a2b;
            color: white;
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

        .contact-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        .contact-btn {
            background: rgba(255,255,255,0.1);
            color: white;
            padding: 0.8rem 1.5rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 25px;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .contact-btn:hover {
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
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
        });

        function applyConfig() {
            const config = catalogConfig || {};
            const companyName = config.companyName || '';
            const taglineValue = config.tagline || '';
            const logoData = config.logoData || '';
            const whatsappNumber = (config.whatsapp || '').replace(/\\D+/g, '');
            const emailValue = (config.email || '').trim();
            const phoneValue = config.phone || '';
            const addressValue = config.address || '';

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

            const phoneLink = document.getElementById('contactPhone');
            if (phoneLink) {
                const sanitizedPhone = phoneValue.replace(/[^+\\d]/g, '');
                if (sanitizedPhone) {
                    phoneLink.href = \`tel:\${sanitizedPhone}\`;
                    phoneLink.style.display = 'inline-flex';
                } else {
                    phoneLink.style.display = 'none';
                }
            }

            const emailLink = document.getElementById('contactEmail');
            if (emailLink) {
                if (emailValue) {
                    emailLink.href = \`mailto:\${emailValue}\`;
                    emailLink.style.display = 'inline-flex';
                } else {
                    emailLink.style.display = 'none';
                }
            }

            const whatsappLink = document.getElementById('contactWhatsAppLink');
            if (whatsappLink) {
                if (whatsappNumber) {
                    whatsappLink.href = \`https://wa.me/\${whatsappNumber}\`;
                    whatsappLink.style.display = 'inline-flex';
                } else {
                    whatsappLink.style.display = 'none';
                }
            }

            const addressLink = document.getElementById('contactAddress');
            if (addressLink) {
                if (addressValue) {
                    addressLink.href = \`https://www.google.com/maps/search/\${encodeURIComponent(addressValue)}\`;
                    addressLink.style.display = 'inline-flex';
                } else {
                    addressLink.style.display = 'none';
                }
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
            const titleEl = document.getElementById('modalTitle');
            const imageEl = document.getElementById('modalImage');
            const descriptionEl = document.getElementById('modalDescription');
            const specsList = document.getElementById('modalSpecs');

            if (titleEl) {
                titleEl.textContent = product.title;
            }

            if (imageEl) {
                imageEl.src = product.image || '';
                imageEl.alt = product.alt || \`Imagen de \${product.title}\`;
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

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            const modal = document.getElementById('productModal');
            if (modal) {
                modal.classList.remove('active');
            }
            document.body.style.overflow = 'auto';
        }

        function contactWhatsApp() {
            const config = catalogConfig || {};
            const whatsappNumber = (config.whatsapp || '').replace(/\\D+/g, '');

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
    
