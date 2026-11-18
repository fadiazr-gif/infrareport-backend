const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const test = require('node:test');

test('CRUD de activos, validaciones y CORS', { timeout: 15000 }, async (t) => {
    const origin = 'http://localhost:5173';
    const temp = await mkdtemp(join(tmpdir(), 'infrareport-'));
    const server = spawn(process.execPath, ['src/app.js'], {
        env: { ...process.env, PORT: '0', DB_FILE: join(temp, 'test.db'), FRONTEND_ORIGIN: origin },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    t.after(async () => {
        if (server.exitCode === null && server.signalCode === null) {
            const exited = once(server, 'exit');
            server.kill();
            await exited;
        }
        await rm(temp, { recursive: true, force: true });
    });

    const url = await new Promise((resolve, reject) => {
        let output = '';
        server.stdout.on('data', (chunk) => {
            output += chunk;
            const match = output.match(/Servidor: (http:\/\/localhost:\d+)/);
            if (match) resolve(match[1] + '/api/activos');
        });
        server.stderr.on('data', (chunk) => { output += chunk; });
        server.once('error', reject);
        server.once('exit', (code) => reject(new Error(`Backend detenido (${code})\n${output}`)));
    });

    const preflight = await fetch(url + '/1', {
        method: 'OPTIONS',
        headers: {
            Origin: origin,
            'Access-Control-Request-Method': 'PUT',
            'Access-Control-Request-Headers': 'content-type'
        }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    assert.match(preflight.headers.get('access-control-allow-methods'), /PUT/);
    const otherOrigin = await fetch(url, { headers: { Origin: 'http://localhost:9999' } });
    assert.notEqual(otherOrigin.headers.get('access-control-allow-origin'), 'http://localhost:9999');

    async function request(method, path, expected, body) {
        const headers = { Origin: origin };
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        const response = await fetch(url + path, { method, headers, body: JSON.stringify(body) });
        assert.equal(response.status, expected, `${method} ${path}`);
        assert.equal(response.headers.get('access-control-allow-origin'), origin);
        if (expected === 204) {
            assert.equal(await response.text(), '');
            return;
        }
        return response.json();
    }

    const asset = { empresa: 'Demo', nombre: 'Switch de prueba', tipo: 'switch', estado: 'operativo', criticidad: 'media' };
    assert.deepEqual(await request('GET', '', 200), []);
    assert.match((await request('POST', '', 400, { ...asset, nombre: ' ' })).error, /nombre/);
    assert.match((await request('POST', '', 400, { ...asset, estado: 'desconocido' })).error, /estado/i);
    assert.match((await request('GET', '/invalido', 400)).error, /ID/);
    const created = await request('POST', '', 201, asset);
    const path = '/' + created.id;
    assert.equal((await request('GET', '', 200))[0].nombre, asset.nombre);
    assert.equal((await request('GET', path, 200)).id, created.id);
    await request('PUT', path, 200, { ...asset, estado: 'en_riesgo' });
    assert.equal((await request('GET', path, 200)).estado, 'en_riesgo');
    await request('DELETE', path, 204);
    assert.match((await request('GET', path, 404)).error, /no encontrado/);
    assert.deepEqual(await request('GET', '', 200), []);
});
