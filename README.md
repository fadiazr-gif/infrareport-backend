
# InfraReport
## Sistema de Diagnóstico de Infraestructura Tecnológica

### Descripción
InfraReport es un proyecto de ingeniería de software
orientado al registro, administración y evaluación
de activos de infraestructura tecnológica empresarial.

El objetivo final es generar informes de diagnóstico
con inventarios, hallazgos, riesgos y recomendaciones.

### Tecnologías
- Node.js
- Express
- SQLite
- JavaScript
- API REST
- Git y GitHub

### Arquitectura
El backend implementa las siguientes capas:

1. Routes: definición de endpoints.
2. Controllers: gestión HTTP.
3. Services: validaciones y reglas de negocio.
4. Repositories: operaciones SQL.
5. Database: conexión centralizada SQLite.

### Entidad principal
Activos tecnológicos.

Campos:
- ID
- Empresa
- Nombre
- Tipo
- Marca
- Modelo
- Dirección IP
- Estado
- Criticidad
- Observaciones
- Fecha de creación

### Instalación
1. Clonar el repositorio.
2. Ejecutar npm install.
3. Copiar .env.example a .env.
4. Ejecutar npm run dev.

Servidor: http://localhost:3000

### Endpoints

| Método | Ruta | Función |
|---|---|---|
| GET | /api/activos | Listar |
| GET | /api/activos/:id | Consultar |
| POST | /api/activos | Crear |
| PUT | /api/activos/:id | Actualizar |
| DELETE | /api/activos/:id | Eliminar |

### Validaciones
La capa de servicios verifica los campos
obligatorios y los valores permitidos.

### Pruebas realizadas

- HTTP 201: creación exitosa.
- HTTP 400: validación de datos.
- HTTP 404: recurso inexistente.
- HTTP 200: consulta y actualización.
- HTTP 204: eliminación exitosa.

### Evidencias

**Creación exitosa**

![HTTP 201](evidencias/prueba_201.png)

**Error de validación**

![HTTP 400](evidencias/prueba_400.png)

**Recurso no encontrado**

![HTTP 404](evidencias/prueba_404.png)

### Futuras funcionalidades
- Registro de empresas.
- Inventario tecnológico avanzado.
- Evaluación de infraestructura.
- Matriz de riesgos.
- Generación de informes PDF.

## Actividad 11 · Integración de frontend y API

El inventario web usa HTML, CSS y JavaScript. Se sirve en un proceso independiente en el puerto 5173. El navegador consume la API de Express en el puerto 3000 mediante `fetch`. SQLite y las validaciones de negocio siguen en el backend.

### 1. Preparar el entorno

Desde la raíz del repositorio, en PowerShell:

```powershell
npm.cmd ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Conserva el valor existente de `DB_FILE` si ya tienes una base de datos con activos. Si clonaste el repositorio en otra carpeta, configura `DB_FILE` con la ruta de tu base existente antes de iniciar el backend.

Si `npm.cmd ci` devuelve `ENOENT` al crear `node_modules` en OneDrive, clona la rama en una carpeta local fuera de OneDrive, como `C:\dev\infrareport`, y vuelve a ejecutar este paso.

### 2. Levantar la API y configurar CORS

Agrega `FRONTEND_ORIGIN=http://localhost:5173` a `.env` para autorizar ese origen. Si la variable se omite, la API conserva su comportamiento anterior y permite cualquier origen. El origen incluye esquema, host y puerto. Usa `localhost` en ambos pasos.

```powershell
npm.cmd start
```

Abre http://localhost:3000/api/activos y confirma que aparece una lista JSON. Una base nueva devuelve `[]`.

### 3. Abrir el frontend

En otra terminal, desde la misma carpeta:

```powershell
npm.cmd run frontend
```

Abre http://localhost:5173. Si tu API usa otro puerto, define por ejemplo `$env:API_URL = 'http://localhost:3001/api/activos'` en la terminal del frontend antes de iniciarlo. Si cambias el puerto del frontend mediante `FRONTEND_PORT`, actualiza también `FRONTEND_ORIGIN` en el backend y reinícialo.

### 4. Probar con un activo de demostración

| Paso | Resultado esperado |
|---|---|
| Abrir la página o pulsar **Actualizar lista** | GET 200 y tabla de inventario |
| Intentar guardar con un campo requerido vacío o solo con espacios | El formulario indica qué falta y bloquea el envío |
| Escribir una IP inválida como `300.1.2.3` | El formulario solicita una IPv4 o IPv6 válida antes de enviar |
| Registrar un activo de prueba con empresa, nombre, tipo, estado y criticidad | POST 201 y fila nueva |
| Pulsar **Ver** en la fila nueva | GET 200 y detalle completo |
| Pulsar **Editar**, cambiar el estado y guardar | PUT 200 y cambio visible |
| Pulsar **Eliminar** y cancelar la confirmación | El activo permanece en la tabla |
| Confirmar **Eliminar** para ese activo de prueba | DELETE 204 sin cuerpo y fila eliminada |
| Detener la API y pulsar **Actualizar lista** | Mensaje de conexión en pantalla |

El frontend muestra los mensajes de error que devuelve la API, incluidos HTTP 400 y 404. Para verificar esos casos, probar el CRUD y comprobar la solicitud previa de CORS, ejecuta:

```powershell
npm.cmd test
```

Las pruebas usan una base SQLite temporal. Se verificó el ciclo completo en Edge con datos de demostración y se consultó la API después de crear, actualizar y eliminar para comprobar el estado guardado en SQLite.

- [Validación de una IP incorrecta](evidencias/frontend-validacion.png)
- [Creación y listado del activo](evidencias/frontend-creacion.png)
- [Actualización del estado](evidencias/frontend-edicion.png)
- [Eliminación del activo](evidencias/frontend-eliminacion.png)

### 5. Publicar el avance

La entrega usa la rama `actividad-11-frontend` del mismo repositorio. Puedes obtenerla en una carpeta nueva con:

```powershell
git clone --branch actividad-11-frontend https://github.com/fadiazr-gif/infrareport-backend.git
cd infrareport-backend
```

Si haces cambios, revisa `git status --short`, crea un commit y ejecuta `git push origin actividad-11-frontend`. Revisa la rama en GitHub antes de integrarla a `main`. La configuración `.env` y las bases SQLite en `data/` están excluidas por `.gitignore`.
