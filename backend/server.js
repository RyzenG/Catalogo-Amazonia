const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'amazonia-admin-token';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'catalog-store.json');
const MAX_VERSIONS = 8;

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ versions: [] }, null, 2));
    }
}

function readStore() {
    ensureDataFile();
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.versions)) {
            return { versions: [] };
        }
        return parsed;
    } catch (error) {
        console.error('No se pudo leer el archivo de datos', error);
        return { versions: [] };
    }
}

function writeStore(store) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function getLatest(store) {
    return store.versions && store.versions.length > 0 ? store.versions[0] : null;
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
            if (data.length > 5 * 1024 * 1024) {
                reject(new Error('Payload demasiado grande'));
            }
        });
        req.on('end', () => {
            try {
                const parsed = data ? JSON.parse(data) : {};
                resolve(parsed);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

function isAuthorized(req) {
    const header = req.headers['authorization'] || '';
    const tokenHeader = req.headers['x-admin-token'];
    const provided = header.startsWith('Bearer ')
        ? header.replace('Bearer ', '')
        : tokenHeader;
    return provided === ADMIN_TOKEN;
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end(JSON.stringify(payload));
}

function handleOptions(res) {
    res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.end();
}

function handleGetCatalog(res) {
    const store = readStore();
    const latest = getLatest(store);
    if (!latest) {
        return sendJson(res, 200, { message: 'No hay datos almacenados', data: null });
    }
    sendJson(res, 200, { data: latest });
}

function handleGetVersions(res) {
    const store = readStore();
    const versions = (store.versions || []).slice(0, MAX_VERSIONS).map(version => ({
        id: version.id,
        updatedAt: version.updatedAt,
        searchTerm: version.searchTerm || '',
        notes: version.notes || '',
    }));
    sendJson(res, 200, { versions });
}

function handleGetVersionById(res, versionId) {
    const store = readStore();
    const version = (store.versions || []).find(v => v.id === versionId);
    if (!version) {
        return sendJson(res, 404, { error: 'No se encontró la versión solicitada' });
    }
    sendJson(res, 200, { data: version });
}

function handleSave(req, res) {
    if (!isAuthorized(req)) {
        return sendJson(res, 401, { error: 'Token inválido o faltante' });
    }

    parseBody(req)
        .then(body => {
            const { catalogData, searchTerm = '', baseVersion } = body || {};
            if (!catalogData || typeof catalogData !== 'object') {
                return sendJson(res, 400, { error: 'Solicitud inválida: falta catalogData' });
            }

            const store = readStore();
            const latest = getLatest(store);

            if (latest && baseVersion && latest.id !== baseVersion) {
                return sendJson(res, 409, {
                    error: 'Conflicto: existe una versión más reciente',
                    latest,
                });
            }

            const versionId = randomUUID();
            const versionEntry = {
                id: versionId,
                updatedAt: new Date().toISOString(),
                catalogData,
                searchTerm,
            };

            const existingVersions = store.versions || [];
            const updatedList = [versionEntry, ...existingVersions].slice(0, MAX_VERSIONS);
            writeStore({ versions: updatedList });

            sendJson(res, 200, {
                message: 'Datos guardados correctamente',
                versionId,
                updatedAt: versionEntry.updatedAt,
            });
        })
        .catch(error => {
            console.error('Error al guardar los datos', error);
            sendJson(res, 500, { error: 'Error al guardar los datos' });
        });
}

const server = http.createServer((req, res) => {
    const { url, method } = req;

    if (method === 'OPTIONS') {
        return handleOptions(res);
    }

    if (method === 'GET' && url === '/api/catalog') {
        return handleGetCatalog(res);
    }

    if (method === 'GET' && url === '/api/catalog/versions') {
        return handleGetVersions(res);
    }

    if (method === 'GET' && url.startsWith('/api/catalog/versions/')) {
        const versionId = url.replace('/api/catalog/versions/', '');
        return handleGetVersionById(res, versionId);
    }

    if (method === 'POST' && url === '/api/catalog') {
        return handleSave(req, res);
    }

    sendJson(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
    ensureDataFile();
    console.log(`API del catálogo escuchando en http://localhost:${PORT}`);
});
