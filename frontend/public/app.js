const byId = (id) => document.getElementById(id);
const editor = byId('editor');
const form = byId('asset-form');
const statusMessage = byId('status');
const options = {
    tipo: { servidor: 'Servidor', switch: 'Switch', router: 'Router', firewall: 'Firewall',
        computador: 'Computador', pc: 'PC', impresora: 'Impresora', almacenamiento: 'Almacenamiento', otro: 'Otro' },
    estado: { operativo: 'Operativo', en_riesgo: 'En riesgo', fuera_servicio: 'Fuera de servicio' },
    criticidad: { baja: 'Baja', media: 'Media', alta: 'Alta' }
};
const labels = {
    id: 'ID', empresa: 'Empresa', nombre: 'Nombre', tipo: 'Tipo', marca: 'Marca', modelo: 'Modelo',
    direccion_ip: 'Dirección IP', estado: 'Estado', criticidad: 'Criticidad',
    observaciones: 'Observaciones', creado_en: 'Fecha de creación'
};
let editingId = null;
let originalIp = '';
let busy = false;

for (const [field, values] of Object.entries(options)) {
    const select = form.elements.namedItem(field);
    select.add(new Option('Seleccionar', ''));
    for (const [value, label] of Object.entries(values)) {
        select.add(new Option(label, value));
    }
}

async function request(method, id = null, body) {
    const path = id === null ? '' : '/' + encodeURIComponent(id);
    const settings = { method };
    if (body !== undefined) {
        settings.headers = { 'Content-Type': 'application/json' };
        settings.body = JSON.stringify(body);
    }
    let response;
    try {
        response = await fetch(window.INFRAREPORT_API + path, settings);
    } catch {
        throw new Error('No se pudo conectar con la API. Comprueba que el backend esté iniciado y que CORS permita este origen.');
    }
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} · ${data?.error || 'La solicitud falló.'}`);
    }
    if (response.status !== 204 && data === null) {
        throw new Error('La API devolvió una respuesta inesperada.');
    }
    return { data, code: response.status };
}

function message(text, isError = false) {
    statusMessage.textContent = text;
    statusMessage.classList.toggle('error', isError);
    statusMessage.classList.toggle('success', !isError && text.startsWith('HTTP '));
}

function validIp(value) {
    if (value.includes(':')) {
        if (!/^[\da-f:.]+$/i.test(value)) return false;
        try {
            return Boolean(new URL(`http://[${value}]/`).hostname);
        } catch {
            return false;
        }
    }
    const octets = value.split('.');
    return octets.length === 4 && octets.every((octet) =>
        /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) <= 255);
}

function display(asset, key) {
    const value = asset[key];
    if (value == null || value === '') return '—';
    const values = options[key];
    return values && Object.hasOwn(values, value) ? values[value] : String(value);
}

function renderAssets(assets) {
    byId('assets').replaceChildren();
    byId('count').textContent = assets.length === 1 ? '1 activo registrado' : `${assets.length} activos registrados`;
    if (assets.length === 0) {
        const cell = byId('assets').insertRow().insertCell();
        cell.colSpan = 6;
        cell.textContent = 'Todavía no hay activos registrados.';
    }
    for (const asset of assets) {
        const row = byId('assets').insertRow();
        for (const key of ['nombre', 'empresa', 'tipo', 'estado', 'criticidad']) {
            row.insertCell().textContent = display(asset, key);
        }
        const actions = document.createElement('div');
        actions.className = 'row-actions';
        row.insertCell().append(actions);
        for (const [label, action] of [['Ver', showDetail], ['Editar', editAsset], ['Eliminar', deleteAsset]]) {
            const button = document.createElement('button');
            button.className = label === 'Eliminar' ? 'secondary danger' : 'secondary';
            button.type = 'button';
            button.textContent = label;
            button.setAttribute('aria-label', `${label} ${asset.nombre}`);
            button.addEventListener('click', () => run(() => action(asset)));
            actions.append(button);
        }
    }
}

async function loadAssets(successMessage) {
    const { data, code } = await request('GET');
    renderAssets(data);
    message(successMessage || `HTTP ${code} · Inventario actualizado.`);
}

async function run(action, onError = (error) => message(error.message, true)) {
    if (busy) return;
    busy = true;
    const buttons = ['new', 'refresh', 'save', 'cancel'].map(byId);
    for (const button of buttons) button.disabled = true;
    try {
        await action();
    } catch (error) {
        onError(error);
    } finally {
        busy = false;
        for (const button of buttons) button.disabled = false;
    }
}

function openEditor(asset = null) {
    editingId = asset?.id ?? null;
    originalIp = asset?.direccion_ip ?? '';
    form.reset();
    byId('form-error').textContent = '';
    byId('form-title').textContent = asset ? 'Editar activo' : 'Registrar activo';
    if (asset) {
        for (const key of new FormData(form).keys()) {
            form.elements.namedItem(key).value = asset[key] ?? '';
        }
    }
    editor.showModal();
}

async function showDetail(asset) {
    const { data, code } = await request('GET', asset.id);
    const fields = byId('detail-fields');
    fields.replaceChildren();
    for (const [key, label] of Object.entries(labels)) {
        const term = document.createElement('dt');
        const value = document.createElement('dd');
        term.textContent = label;
        value.textContent = display(data, key);
        fields.append(term, value);
    }
    message(`HTTP ${code} · Activo consultado.`);
    byId('detail').showModal();
}

async function editAsset(asset) {
    const { data } = await request('GET', asset.id);
    openEditor(data);
}

async function refreshAfterMutation(successMessage) {
    message(successMessage);
    try {
        await loadAssets(successMessage);
    } catch (error) {
        message(`${successMessage} No se pudo actualizar la lista. ${error.message}`, true);
    }
}

async function deleteAsset(asset) {
    if (!window.confirm(`¿Eliminar el activo «${asset.nombre}»?`)) return;
    const { code } = await request('DELETE', asset.id);
    await refreshAfterMutation(`HTTP ${code} · Activo eliminado.`);
}

byId('new').addEventListener('click', () => openEditor());
byId('refresh').addEventListener('click', () => run(() => loadAssets()));
byId('cancel').addEventListener('click', () => editor.close());
editor.addEventListener('cancel', (event) => {
    if (busy) event.preventDefault();
});
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {};
    for (const [key, value] of new FormData(form)) {
        payload[key] = value.trim();
    }
    for (const key of ['empresa', 'nombre', 'tipo', 'estado', 'criticidad']) {
        if (!payload[key]) {
            byId('form-error').textContent = `Completa el campo ${labels[key]}.`;
            form.elements.namedItem(key).focus();
            return;
        }
    }
    const ip = form.elements.namedItem('direccion_ip');
    if (payload.direccion_ip && !validIp(payload.direccion_ip) &&
        payload.direccion_ip !== originalIp) {
        byId('form-error').textContent = 'Introduce una dirección IPv4 o IPv6 válida.';
        ip.focus();
        return;
    }
    byId('form-error').textContent = '';
    run(async () => {
        const creating = editingId === null;
        const { code } = await request(creating ? 'POST' : 'PUT', editingId, payload);
        editor.close();
        await refreshAfterMutation(`HTTP ${code} · Activo ${creating ? 'registrado' : 'actualizado'}.`);
    }, (error) => { byId('form-error').textContent = error.message; });
});

message('Cargando inventario…');
run(() => loadAssets());
