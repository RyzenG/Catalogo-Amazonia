const state = {
  csrfToken: null,
  categories: [],
  products: [],
  editingCategoryId: null,
  editingProductId: null,
  selectedCategoryFilter: 'all',
  user: null
};

const selectors = {
  loginView: document.getElementById('login-view'),
  loginForm: document.getElementById('login-form'),
  loginError: document.getElementById('login-error'),
  loginSubmit: document.getElementById('login-submit'),
  adminView: document.getElementById('admin-view'),
  sessionUsername: document.getElementById('session-username'),
  logoutButton: document.getElementById('logout-button'),
  categoryForm: document.getElementById('category-form'),
  categoryId: document.getElementById('category-id'),
  categoryName: document.getElementById('category-name'),
  categorySlug: document.getElementById('category-slug'),
  categoryDescription: document.getElementById('category-description'),
  categorySubmit: document.getElementById('category-submit'),
  categoryMessage: document.getElementById('category-message'),
  categoryList: document.getElementById('category-list'),
  categoryReset: document.getElementById('category-reset'),
  productForm: document.getElementById('product-form'),
  productId: document.getElementById('product-id'),
  productName: document.getElementById('product-name'),
  productSlug: document.getElementById('product-slug'),
  productCategory: document.getElementById('product-category'),
  productIcon: document.getElementById('product-icon'),
  productPrice: document.getElementById('product-price'),
  productImage: document.getElementById('product-image'),
  productDescription: document.getElementById('product-description'),
  productSpecs: document.getElementById('product-specs'),
  productSubmit: document.getElementById('product-submit'),
  productMessage: document.getElementById('product-message'),
  productList: document.getElementById('product-list'),
  productReset: document.getElementById('product-reset'),
  productFilter: document.getElementById('product-filter'),
  categoryTemplate: document.getElementById('category-item-template'),
  productTemplate: document.getElementById('product-card-template')
};

function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('error', Boolean(isError));
  element.hidden = !message;
}

async function fetchCsrfToken(force = false) {
  if (state.csrfToken && !force) {
    return state.csrfToken;
  }
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('No se pudo obtener el token CSRF.');
  }
  const data = await response.json();
  state.csrfToken = data.csrfToken;
  return state.csrfToken;
}

async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const init = {
    method,
    credentials: 'include',
    headers: { ...(options.headers || {}) }
  };

  if (options.body !== undefined) {
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!state.csrfToken) {
      await fetchCsrfToken();
    }
    init.headers['X-CSRF-Token'] = state.csrfToken;
  }

  const response = await fetch(url, init);
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error('No se pudo parsear la respuesta JSON', error);
    }
  }

  if (!response.ok) {
    if (response.status === 403) {
      await fetchCsrfToken(true);
    }
    const message = data?.error || 'Ocurrió un error inesperado.';
    throw new Error(message);
  }

  if (data && data.csrfToken) {
    state.csrfToken = data.csrfToken;
  }

  return data;
}

function toggleView(authenticated) {
  if (authenticated) {
    selectors.loginView.classList.add('hidden');
    selectors.adminView.classList.remove('hidden');
  } else {
    selectors.adminView.classList.add('hidden');
    selectors.loginView.classList.remove('hidden');
  }
}

async function checkSession() {
  try {
    const response = await fetch('/api/auth/session', { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Sesión inválida');
    }
    return await response.json();
  } catch (error) {
    return { authenticated: false };
  }
}

function resetCategoryForm() {
  state.editingCategoryId = null;
  selectors.categoryId.value = '';
  selectors.categoryName.value = '';
  selectors.categorySlug.value = '';
  selectors.categoryDescription.value = '';
  selectors.categorySubmit.textContent = 'Guardar categoría';
  showMessage(selectors.categoryMessage, '');
}

function resetProductForm() {
  state.editingProductId = null;
  selectors.productId.value = '';
  selectors.productName.value = '';
  selectors.productSlug.value = '';
  selectors.productIcon.value = '';
  selectors.productPrice.value = '';
  selectors.productImage.value = '';
  selectors.productDescription.value = '';
  selectors.productSpecs.value = '';
  selectors.productSubmit.textContent = 'Guardar producto';
  if (state.categories.length > 0) {
    selectors.productCategory.value = String(state.categories[0].id);
  }
  showMessage(selectors.productMessage, '');
}

function specsToTextarea(specs) {
  if (!Array.isArray(specs)) return '';
  return specs.map(([label, value]) => `${label}: ${value}`).join('\n');
}

function populateCategoryOptions() {
  const filterSelect = selectors.productFilter;
  const categorySelect = selectors.productCategory;

  filterSelect.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'Todas las categorías';
  filterSelect.appendChild(allOption);

  categorySelect.innerHTML = '';

  state.categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = String(category.id);
    option.textContent = category.name;
    filterSelect.appendChild(option.cloneNode(true));
    categorySelect.appendChild(option);
  });

  if (!state.categories.some((cat) => String(cat.id) === state.selectedCategoryFilter)) {
    state.selectedCategoryFilter = 'all';
  }

  filterSelect.value = state.selectedCategoryFilter;
  if (state.categories.length > 0) {
    categorySelect.value = String(state.categories[0].id);
  }
}

function renderCategories() {
  selectors.categoryList.innerHTML = '';

  state.categories.forEach((category) => {
    const template = selectors.categoryTemplate.content.cloneNode(true);
    const listItem = template.querySelector('.list-item');
    listItem.dataset.id = category.id;

    template.querySelector('.item-title').textContent = category.name;
    template.querySelector('.item-subtitle').textContent = category.description || 'Sin descripción';

    template.querySelector('.item-edit').addEventListener('click', () => {
      state.editingCategoryId = category.id;
      selectors.categoryId.value = String(category.id);
      selectors.categoryName.value = category.name;
      selectors.categorySlug.value = category.slug || '';
      selectors.categoryDescription.value = category.description || '';
      selectors.categorySubmit.textContent = 'Actualizar categoría';
      selectors.categoryName.focus();
    });

    template.querySelector('.item-delete').addEventListener('click', async () => {
      const confirmed = window.confirm(`¿Eliminar la categoría "${category.name}"? Los productos asociados también se eliminarán.`);
      if (!confirmed) return;
      try {
        selectors.categorySubmit.disabled = true;
        selectors.productSubmit.disabled = true;
        await apiFetch(`/api/categories/${category.id}`, { method: 'DELETE' });
        await loadAdminData();
        resetCategoryForm();
        resetProductForm();
      } catch (error) {
        showMessage(selectors.categoryMessage, error.message, true);
      } finally {
        selectors.categorySubmit.disabled = false;
        selectors.productSubmit.disabled = false;
      }
    });

    selectors.categoryList.appendChild(template);
  });
}

function renderProducts() {
  selectors.productList.innerHTML = '';
  const filter = state.selectedCategoryFilter;

  const filteredProducts = state.products.filter((product) => {
    if (filter === 'all') return true;
    return String(product.categoryId) === filter;
  });

  if (filteredProducts.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.textContent = 'No hay productos registrados para esta categoría.';
    emptyState.className = 'subtitle';
    selectors.productList.appendChild(emptyState);
    return;
  }

  filteredProducts.forEach((product) => {
    const template = selectors.productTemplate.content.cloneNode(true);
    const card = template.querySelector('.product-card');
    card.dataset.id = product.id;

    template.querySelector('.product-icon').textContent = product.icon || '🏷️';
    template.querySelector('.product-title').textContent = product.name;

    const category = state.categories.find((cat) => cat.id === product.categoryId);
    const metaParts = [];
    if (category) {
      metaParts.push(category.name);
    }
    if (product.price !== null && product.price !== undefined) {
      metaParts.push(`Precio: ${Number(product.price).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`);
    }
    if (product.imageUrl) {
      metaParts.push('Con imagen');
    }
    template.querySelector('.product-meta').textContent = metaParts.join(' · ');
    template.querySelector('.product-description').textContent = product.description || 'Sin descripción disponible.';

    const specsList = template.querySelector('.product-specs');
    if (Array.isArray(product.specs) && product.specs.length > 0) {
      product.specs.forEach(([label, value]) => {
        const item = document.createElement('li');
        const labelElement = document.createElement('strong');
        labelElement.textContent = label;
        const valueElement = document.createElement('span');
        valueElement.textContent = value;
        item.appendChild(labelElement);
        item.appendChild(valueElement);
        specsList.appendChild(item);
      });
    } else {
      const emptySpecs = document.createElement('li');
      emptySpecs.textContent = 'Sin especificaciones.';
      specsList.appendChild(emptySpecs);
    }

    template.querySelector('.product-edit').addEventListener('click', () => {
      state.editingProductId = product.id;
      selectors.productId.value = String(product.id);
      selectors.productName.value = product.name;
      selectors.productSlug.value = product.slug || '';
      selectors.productCategory.value = String(product.categoryId);
      selectors.productIcon.value = product.icon || '';
      selectors.productPrice.value = product.price ?? '';
      selectors.productImage.value = product.imageUrl || '';
      selectors.productDescription.value = product.description || '';
      selectors.productSpecs.value = specsToTextarea(product.specs);
      selectors.productSubmit.textContent = 'Actualizar producto';
      selectors.productName.focus();
    });

    template.querySelector('.product-delete').addEventListener('click', async () => {
      const confirmed = window.confirm(`¿Eliminar el producto "${product.name}"?`);
      if (!confirmed) return;
      try {
        selectors.productSubmit.disabled = true;
        await apiFetch(`/api/products/${product.id}`, { method: 'DELETE' });
        await fetchProducts();
        resetProductForm();
      } catch (error) {
        showMessage(selectors.productMessage, error.message, true);
      } finally {
        selectors.productSubmit.disabled = false;
      }
    });

    selectors.productList.appendChild(template);
  });
}

async function fetchCategories() {
  const data = await apiFetch('/api/categories');
  state.categories = data?.categories || [];
  populateCategoryOptions();
  renderCategories();
}

async function fetchProducts() {
  const data = await apiFetch('/api/products');
  state.products = data?.products?.map((product) => ({
    ...product,
    specs: product.specs || []
  })) || [];
  renderProducts();
}

async function loadAdminData() {
  await Promise.all([fetchCategories(), fetchProducts()]);
}

async function handleLogin(event) {
  event.preventDefault();
  showMessage(selectors.loginError, '');
  selectors.loginSubmit.disabled = true;
  selectors.loginSubmit.textContent = 'Ingresando...';

  const formData = new FormData(selectors.loginForm);
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    await fetchCsrfToken();
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    state.user = data.user;
    await fetchCsrfToken(true);
    selectors.sessionUsername.textContent = `Hola, ${data.user.username}`;
    toggleView(true);
    resetCategoryForm();
    resetProductForm();
    await loadAdminData();
  } catch (error) {
    showMessage(selectors.loginError, error.message, true);
  } finally {
    selectors.loginSubmit.disabled = false;
    selectors.loginSubmit.textContent = 'Ingresar';
    selectors.loginForm.reset();
  }
}

async function handleLogout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Error al cerrar sesión', error);
  } finally {
    state.user = null;
    state.csrfToken = null;
    state.categories = [];
    state.products = [];
    toggleView(false);
    showMessage(selectors.loginError, 'Sesión finalizada. Inicia sesión nuevamente.');
  }
}

selectors.loginForm.addEventListener('submit', handleLogin);
selectors.logoutButton.addEventListener('click', handleLogout);

selectors.categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(selectors.categoryMessage, '');

  const name = selectors.categoryName.value.trim();
  const slug = selectors.categorySlug.value.trim();
  const description = selectors.categoryDescription.value.trim();
  const body = {
    name,
    description: description || undefined
  };

  if (slug) {
    body.slug = slug;
  }

  const isEditing = Boolean(state.editingCategoryId);
  const url = isEditing ? `/api/categories/${state.editingCategoryId}` : '/api/categories';
  const method = isEditing ? 'PUT' : 'POST';

  selectors.categorySubmit.disabled = true;
  selectors.categorySubmit.textContent = isEditing ? 'Actualizando...' : 'Guardando...';

  try {
    await apiFetch(url, { method, body });
    await fetchCategories();
    resetCategoryForm();
    showMessage(selectors.categoryMessage, 'Categoría guardada correctamente.');
    await fetchProducts();
  } catch (error) {
    showMessage(selectors.categoryMessage, error.message, true);
  } finally {
    selectors.categorySubmit.disabled = false;
    selectors.categorySubmit.textContent = 'Guardar categoría';
  }
});

selectors.categoryReset.addEventListener('click', resetCategoryForm);

selectors.productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage(selectors.productMessage, '');

  const body = {
    name: selectors.productName.value.trim(),
    slug: selectors.productSlug.value.trim() || undefined,
    categoryId: selectors.productCategory.value,
    icon: selectors.productIcon.value.trim() || undefined,
    imageUrl: selectors.productImage.value.trim() || undefined,
    description: selectors.productDescription.value.trim(),
    specs: selectors.productSpecs.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...valueParts] = line.split(':');
        if (!label || valueParts.length === 0) return null;
        return [label.trim(), valueParts.join(':').trim()];
      })
      .filter(Boolean)
  };

  const priceValue = selectors.productPrice.value.trim();
  if (priceValue !== '') {
    body.price = priceValue;
  }

  if (body.specs.length === 0) {
    delete body.specs;
  }

  const isEditing = Boolean(state.editingProductId);
  const url = isEditing ? `/api/products/${state.editingProductId}` : '/api/products';
  const method = isEditing ? 'PUT' : 'POST';

  selectors.productSubmit.disabled = true;
  selectors.productSubmit.textContent = isEditing ? 'Actualizando...' : 'Guardando...';

  try {
    await apiFetch(url, { method, body });
    await fetchProducts();
    resetProductForm();
    showMessage(selectors.productMessage, 'Producto guardado correctamente.');
  } catch (error) {
    showMessage(selectors.productMessage, error.message, true);
  } finally {
    selectors.productSubmit.disabled = false;
    selectors.productSubmit.textContent = 'Guardar producto';
  }
});

selectors.productReset.addEventListener('click', resetProductForm);

selectors.productFilter.addEventListener('change', (event) => {
  state.selectedCategoryFilter = event.target.value;
  renderProducts();
});

(async function init() {
  const session = await checkSession();
  if (session.authenticated) {
    state.user = session.user;
    selectors.sessionUsername.textContent = `Hola, ${session.user.username}`;
    toggleView(true);
    await fetchCsrfToken().catch(() => {});
    await loadAdminData();
  } else {
    toggleView(false);
    await fetchCsrfToken().catch(() => {});
  }
})();
