export function createCategoriesModule({
    getCatalogData,
    setCatalogData,
    getCurrentCategory,
    setCurrentCategory,
    defaultConfig,
    defaultCategories,
    createDefaultProductsMap,
    generateCategoryId,
    loadProducts,
    saveData,
    showMessage,
    isPlainObject,
    stripLegacyImageData
}) {
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

    function ensureCategoryStructure() {
        let catalogData = getCatalogData();

        if (!catalogData || typeof catalogData !== 'object') {
            catalogData = {
                config: { ...defaultConfig },
                categories: defaultCategories.map(category => ({ ...category })),
                products: createDefaultProductsMap(defaultCategories),
                categoryInfo: {}
            };
            setCatalogData(catalogData);
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
        const currentCategory = getCurrentCategory();

        if (!currentCategory || !validIds.has(currentCategory)) {
            const firstCategory = catalogData.categories[0] ? catalogData.categories[0].id : '';
            setCurrentCategory(firstCategory);
        }
    }

    function renderCategoryTabs() {
        const tabsContainer = document.getElementById('categoryTabs');
        if (!tabsContainer) {
            return;
        }

        const catalogData = getCatalogData();
        const currentCategory = getCurrentCategory();

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
                updateCurrentCategory(category.id);
            });
            tabsContainer.appendChild(button);
        });
    }

    function renderCategoryOptions(selectedId) {
        const select = document.getElementById('productCategory');
        if (!select) {
            return;
        }

        const catalogData = getCatalogData();
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

        const catalogData = getCatalogData();
        const currentCategory = getCurrentCategory();
        const availableIds = catalogData.categories.map(category => category.id);
        if (!preserveCurrent || !availableIds.includes(currentCategory)) {
            updateCurrentCategory(availableIds[0] || '');
        } else {
            renderCategoryTabs();
            renderCategoryOptions(getCurrentCategory());

            if (load) {
                loadProducts();
            }
        }

        const openProductButton = document.getElementById('openProductModalButton');
        if (openProductButton) {
            openProductButton.disabled = availableIds.length === 0;
        }
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

    function captureCategoryManagerValues() {
        const list = document.getElementById('categoryManagerList');
        if (!list) {
            return;
        }

        const items = Array.from(list.querySelectorAll('.category-manager-item'));
        if (items.length === 0) {
            return;
        }

        const catalogData = getCatalogData();
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

    function updateCurrentCategory(categoryId) {
        ensureCategoryStructure();
        const catalogData = getCatalogData();
        const availableIds = catalogData.categories.map(category => category.id);
        const targetId = availableIds.includes(categoryId) ? categoryId : (availableIds[0] || '');

        setCurrentCategory(targetId);
        renderCategoryTabs();
        renderCategoryOptions(targetId);
        loadProducts();
    }

    function renderCategoryManagerList() {
        const list = document.getElementById('categoryManagerList');
        if (!list) {
            return;
        }

        const catalogData = getCatalogData();
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

    function moveCategory(categoryId, direction) {
        ensureCategoryStructure();
        captureCategoryManagerValues();

        const catalogData = getCatalogData();
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

        const catalogData = getCatalogData();
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

        setCurrentCategory(newCategory.id);
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

        const catalogData = getCatalogData();

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

    return {
        ensureCategoryStructure,
        renderCategoryTabs,
        renderCategoryOptions,
        refreshCategoriesUI,
        updateCurrentCategory,
        openCategoryModal,
        closeCategoryModal,
        handleAddCategory,
        saveCategoryEdits,
        deleteCategory,
        renderCategoryManagerList,
        resetNewCategoryForm,
        moveCategory,
        formatCategoryLabel
    };
}
