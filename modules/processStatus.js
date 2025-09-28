const DEFAULT_SELECTORS = {
    panel: 'exportStatusPanel',
    list: 'exportStatusList',
    empty: 'exportStatusEmpty',
    clearButton: 'clearProcessStatusButton'
};

const DEFAULT_STATE_CLASSES = [
    'process-panel__item--running',
    'process-panel__item--success',
    'process-panel__item--error'
];

function formatProcessTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function createProcessStatusManager({
    labels = {},
    selectors = {},
    stateClasses = DEFAULT_STATE_CLASSES
} = {}) {
    const resolvedSelectors = { ...DEFAULT_SELECTORS, ...selectors };
    const entries = new Map();
    let counter = 0;

    const elements = {
        panel: null,
        list: null,
        empty: null,
        clearButton: null
    };

    function resolveElements() {
        const { panel, list, empty, clearButton } = resolvedSelectors;

        if (!elements.panel || !elements.panel.isConnected) {
            elements.panel = panel ? document.getElementById(panel) : null;
        }

        if (!elements.list || !elements.list.isConnected) {
            elements.list = list ? document.getElementById(list) : null;
        }

        if (!elements.empty || !elements.empty.isConnected) {
            elements.empty = empty ? document.getElementById(empty) : null;
        }

        if (!elements.clearButton || !elements.clearButton.isConnected) {
            elements.clearButton = clearButton ? document.getElementById(clearButton) : null;
        }

        if (!elements.panel || !elements.list) {
            return null;
        }

        return elements;
    }

    function toggleEmptyState() {
        const resolved = resolveElements();
        if (!resolved) {
            return;
        }

        const hasItems = resolved.list.children.length > 0;

        if (resolved.empty) {
            resolved.empty.hidden = hasItems;
        }

        if (resolved.clearButton) {
            resolved.clearButton.disabled = !hasItems;
        }
    }

    function createEntry(operation, initialDetail = 'Iniciando…') {
        const resolved = resolveElements();

        if (!resolved) {
            return null;
        }

        const label = labels[operation] || 'Proceso';
        const now = new Date();
        counter += 1;
        const entryId = `${operation}-${now.getTime()}-${counter}`;

        const item = document.createElement('li');
        const runningClass = stateClasses[0] || 'process-panel__item--running';
        item.className = `process-panel__item ${runningClass}`;
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

        resolved.list.prepend(item);
        entries.set(entryId, { element: item, detail: detailElement, icon });

        toggleEmptyState();

        return entryId;
    }

    function updateEntry(entryId, options = {}) {
        if (!entryId || !entries.has(entryId)) {
            return;
        }

        const entry = entries.get(entryId);
        const { element, detail, icon } = entry;
        const { state, detail: detailText } = options;

        if (typeof detailText === 'string') {
            detail.textContent = detailText;
        }

        if (state) {
            stateClasses.forEach(className => {
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

    function clearEntries() {
        entries.forEach(entry => {
            if (entry.element && entry.element.parentNode) {
                entry.element.parentNode.removeChild(entry.element);
            }
        });

        entries.clear();

        const resolved = resolveElements();
        if (resolved && resolved.list) {
            resolved.list.innerHTML = '';
        }

        toggleEmptyState();
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

    return {
        resolveElements,
        toggleEmptyState,
        createEntry,
        updateEntry,
        clearEntries,
        setElementBusyState
    };
}
