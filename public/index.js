// ==========================================================================
// 1. CONFIGURACIÓN GLOBAL Y VARIABLES
// ==========================================================================
const API_URL = '/api';
let tokenGlobal = '';
let usuarioGlobal = null;
let comerciosGlobal = [];
let tiendasGlobal = [];
const socket = io(); 

// ==========================================================================
// 2. UTILIDADES GENERALES
// ==========================================================================
function extraerArray(json) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    if (json && Array.isArray(json.comercios)) return json.comercios;
    if (json && Array.isArray(json.tiendas)) return json.tiendas;
    return [];
}

// ==========================================================================
// 3. INICIO Y CIERRE DE SESIÓN
// ==========================================================================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgElement = document.getElementById('loginMessage');

    if (msgElement) msgElement.innerText = "Conectando al servidor...";

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            tokenGlobal = data.token;
            usuarioGlobal = data.usuario;

            document.getElementById('loginScreen')?.classList.add('hidden');
            document.getElementById('dashboardScreen')?.classList.remove('hidden');

            const nombre = data.usuario.nombre || 'Administrador';
            const apellido = data.usuario.apellido || 'Maestro';
            const empresa = data.usuario.comercioNombre || 'Sistema Dynamis';

            const userBadge = document.getElementById('userBadge');
            if (userBadge) {
                userBadge.innerText = `Usuario: ${nombre} ${apellido}\nRol: ${data.usuario.rol}\nEmpresa: ${empresa}`;
            }

            // Gestión de Permisos UI
            const rol = data.usuario.rol;
            if (rol === 'Dueño') {
                document.getElementById('cajaRolesRegistro')?.classList.add('hidden');
                document.getElementById('productoPanelForm')?.classList.remove('hidden');
            } else if (rol === 'Empleado') {
                document.getElementById('adminPanels')?.classList.add('hidden');
                document.getElementById('tiendaPanelForm')?.classList.add('hidden');
                document.getElementById('productoPanelForm')?.classList.remove('hidden');
            } else {
                document.getElementById('adminPanels')?.classList.remove('hidden');
                document.getElementById('cajaRolesRegistro')?.classList.remove('hidden');
                document.getElementById('tiendaPanelForm')?.classList.remove('hidden');
                document.getElementById('productoPanelForm')?.classList.remove('hidden');
            }

            await actualizarDatosGlobales();
            mostrarSeccion('secComercios');

            if (msgElement) msgElement.innerText = "";
        } else {
            if (msgElement) msgElement.textContent = data.error || 'Credenciales incorrectas.';
        }
    } catch (error) {
        console.error("Error en login:", error);
        if (msgElement) msgElement.innerText = 'Error de red con el backend.';
    }
});

document.getElementById('btnLogout')?.addEventListener('click', () => {
    tokenGlobal = '';
    usuarioGlobal = null;
    location.reload();
});

// ==========================================================================
// 4. MOTOR DE NAVEGACIÓN (SPA)
// ==========================================================================
function mostrarSeccion(idSeccion) {
    document.getElementById('secComercios')?.classList.add('hidden');
    document.getElementById('secTiendas')?.classList.add('hidden');
    document.getElementById('secStock')?.classList.add('hidden');
    document.getElementById('secVentas')?.classList.add('hidden');

    document.getElementById(idSeccion)?.classList.remove('hidden');
}

// ==========================================================================
// 5. CARGA DE DATOS PRINCIPALES
// ==========================================================================
async function actualizarDatosGlobales() {
    try {
        const [resCom, resTien] = await Promise.all([
            fetch(`${API_URL}/comercios`, { headers: { 'Authorization': `Bearer ${tokenGlobal}` } }),
            fetch(`${API_URL}/tiendas`, { headers: { 'Authorization': `Bearer ${tokenGlobal}` } })
        ]);

        comerciosGlobal = extraerArray(await resCom.json());
        tiendasGlobal = extraerArray(await resTien.json());

        if (typeof renderizarComerciosYListas === 'function') renderizarComerciosYListas(comerciosGlobal, tiendasGlobal);
        if (typeof renderizarTiendasIndependientes === 'function') renderizarTiendasIndependientes(tiendasGlobal, comerciosGlobal);
        if (typeof cargarVentas === 'function') cargarVentas();

        if (typeof llenarSelectTiendasProducto === 'function') llenarSelectTiendasProducto();
        if (typeof llenarSelectTiendasVenta === 'function') llenarSelectTiendasVenta();

    } catch (error) {
        console.error("Error cargando datos globales:", error);
    }
}

// ==========================================================================
// 6. FORMULARIO: REGISTRO DE USUARIOS (ADMIN/DUEÑO)
// ==========================================================================
document.getElementById('formUsuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nombre: document.getElementById('nombreUsuario')?.value.trim() || '',
        apellido: document.getElementById('apellidoUsuario')?.value.trim() || '',
        email: document.getElementById('emailUsuario').value.trim(),
        password: document.getElementById('passwordUsuario').value,
        rol: document.getElementById('rolUsuario').value,
        comercioId: document.getElementById('selectComercioUsuario')?.value || null
    };

    try {
        const res = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenGlobal}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            alert('✅ Usuario creado con éxito');
            document.getElementById('formUsuario').reset();
        } else {
            alert('❌ Error: ' + (data.error || data.detalle));
        }
    } catch (error) {
        console.error("Error registro:", error);
    }
});

// ==========================================================================
// 7. WEBSOCKETS (CHAT SOPORTE EN TIEMPO REAL)
// ==========================================================================
socket.on('connect', () => console.log('✅ Conectado al chat. Socket ID:', socket.id));

function toggleChat() {
    document.getElementById('chatWindow')?.classList.toggle('hidden');
}

function enviarMensajeChat(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const texto = input.value.trim();

    if (texto !== "" && usuarioGlobal) {
        let nombreAutor = '';
        if (usuarioGlobal.rol === 'Admin') {
            nombreAutor = '🛠️ Soporte Dynamis';
        } else {
            const nombre = usuarioGlobal.nombre || 'Usuario';
            const empresa = usuarioGlobal.comercioNombre || 'Sistema';
            nombreAutor = `👤 ${nombre} | ${usuarioGlobal.rol} - ${empresa}`;
        }

        socket.emit('mensaje_cliente', { id: socket.id, autor: nombreAutor, texto: texto });
        input.value = '';
    }
}

socket.on('mensaje_servidor', (data) => {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const div = document.createElement('div');
    div.className = data.id === socket.id ? 'chat-msg msg-propio' : 'chat-msg msg-ajeno';
    div.innerHTML = `<span class="msg-autor">${data.autor}</span>${data.texto}`;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
// ==========================================================================
// 8. RENDERIZADO DE DATOS (PINTAR EL HTML)
// ==========================================================================

function renderizarComerciosYListas(comercios, tiendas) {
    const tablaComercios = document.getElementById('tablaComercios');

    if (tablaComercios) {
        tablaComercios.innerHTML = `
            <thead>
                <tr>
                    <th>Empresa</th>
                    <th>CUIT</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${comercios.map(c => {
            let botones = '<span style="color: gray; font-size: 0.8rem;">Sin permisos</span>';

            if (usuarioGlobal && usuarioGlobal.rol === 'Admin') {
                botones = c.estado === 'Activo'
                    ? `<button onclick="cambiarEstadoComercio('${c._id}', 'baja')" style="background-color: #dc3545; padding: 5px 10px; font-size: 0.8rem;">Desactivar</button>`
                    : `<button onclick="cambiarEstadoComercio('${c._id}', 'reactivar')" style="background-color: #28a745; padding: 5px 10px; font-size: 0.8rem;">Reactivar</button>`;
            }

            return `
                    <tr>
                        <td><strong>${c.nombre}</strong></td>
                        <td>${c.cuit}</td>
                        <td><span class="badge ${c.estado === 'Activo' ? 'badge-success' : 'badge-danger'}">${c.estado}</span></td>
                        <td>${botones}</td>
                    </tr>
                    `;
        }).join('')}
            </tbody>
        `;
    }

    const htmlOpciones = '<option value="">Seleccione un comercio...</option>' +
        comercios.map(c => `<option value="${c._id}">${c.nombre}</option>`).join('');

    const selectUsuario = document.getElementById('selectComercioUsuario');
    const selectTienda = document.getElementById('selectComercioTienda');
    const filtroStock = document.getElementById('filtroComercioStock');

    if (selectUsuario) selectUsuario.innerHTML = htmlOpciones;
    if (selectTienda) selectTienda.innerHTML = htmlOpciones;
    if (filtroStock) filtroStock.innerHTML = htmlOpciones;
}

function renderizarTiendasIndependientes(tiendas, comercios) {
    const tablaTiendas = document.getElementById('tablaTiendas');

    if (tablaTiendas) {
        tablaTiendas.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre Tienda</th>
                    <th>Pertenece a</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${tiendas.map(t => {
            const comercioPadre = comercios.find(c => c._id === t.comercioId);
            const nombreComercio = comercioPadre ? comercioPadre.nombre : 'Desconocido';

            let botones = '<span style="color: gray; font-size: 0.8rem;">Sin permisos</span>';

            if (usuarioGlobal && (usuarioGlobal.rol === 'Admin' || usuarioGlobal.rol === 'Dueño')) {
                botones = t.estado === 'Activa'
                    ? `<button onclick="cambiarEstadoTienda('${t._id}', 'baja')" style="background-color: #dc3545; padding: 5px 10px; font-size: 0.8rem;">Desactivar</button>`
                    : `<button onclick="cambiarEstadoTienda('${t._id}', 'reactivar')" style="background-color: #28a745; padding: 5px 10px; font-size: 0.8rem;">Reactivar</button>`;
            }

            return `
                    <tr>
                        <td><strong>${t.nombre}</strong></td>
                        <td>${nombreComercio}</td>
                        <td><span class="badge ${t.estado === 'Activa' ? 'badge-success' : 'badge-danger'}">${t.estado}</span></td>
                        <td>${botones}</td>
                    </tr>
                    `;
        }).join('')}
            </tbody>
        `;
    }
}

async function cargarVentas() {
    try {
        const res = await fetch(`${API_URL}/ventas`, {
            headers: { 'Authorization': `Bearer ${tokenGlobal}` }
        });
        const data = await res.json();
        const ventas = extraerArray(data);

        const tbody = document.getElementById('tablaVentas');
        if (tbody) {
            if (ventas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay ventas registradas aún.</td></tr>`;
                return;
            }

            tbody.innerHTML = ventas.map(v => {
                const fecha = new Date(v.createdAt).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' });
                
                const vendedor = v.usuarioId ? v.usuarioId.email : 'N/A';
                
                const producto = v.productoId ? v.productoId.nombre : 'Producto Eliminado';

                return `
                <tr>
                    <td>${fecha}</td>
                    <td>${vendedor}</td>
                    <td>${producto}</td>
                    <td>${v.cantidad}</td>
                    <td><strong>$${v.total.toLocaleString()}</strong></td>
                </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Error cargando el historial de ventas:", error);
    }
}
function renderizarProductos(productos) {
    const tablaProductos = document.getElementById('tablaProductos');

    if (tablaProductos) {
        if (productos.length === 0) {
            tablaProductos.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay productos registrados.</td></tr>`;
            return;
        }

        tablaProductos.innerHTML = `
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Stock Disponible</th>
                    <th>Precio Unidad</th>
                    <th>ID Sistema (Para Vender)</th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(p => `
                    <tr>
                        <td><strong>${p.nombre}</strong></td>
                        <td>
                            <span class="badge ${p.stock > 10 ? 'badge-success' : 'badge-danger'}">
                                ${p.stock} unid.
                            </span>
                        </td>
                        <td>$${p.precio}</td>
                        <td style="font-size: 0.8rem; color: gray;">${p._id}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    }
}
// ==========================================================================
// 9. GESTIÓN DE ESTADOS (BAJA LÓGICA Y REACTIVACIÓN)
// ==========================================================================

async function cambiarEstadoComercio(id, accion) {
    const metodo = accion === 'baja' ? 'DELETE' : 'PUT';
    const url = accion === 'baja' ? `${API_URL}/comercios/${id}` : `${API_URL}/comercios/${id}/activar`;

    const confirmacion = confirm(`¿Estás seguro de que querés ${accion === 'baja' ? 'dar de baja' : 'reactivar'} este comercio?`);
    if (!confirmacion) return;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Authorization': `Bearer ${tokenGlobal}` }
        });

        if (res.ok) {
            await actualizarDatosGlobales();
        } else {
            const data = await res.json();
            alert(`Error: ${data.error || 'No se pudo completar la operación'}`);
        }
    } catch (error) {
        console.error("Error cambiando el estado del comercio:", error);
    }
}

async function cambiarEstadoTienda(id, accion) {
    const metodo = accion === 'baja' ? 'DELETE' : 'PUT';
    const url = accion === 'baja' ? `${API_URL}/tiendas/${id}` : `${API_URL}/tiendas/${id}/activar`;

    const confirmacion = confirm(`¿Estás seguro de que querés ${accion === 'baja' ? 'dar de baja' : 'reactivar'} esta tienda?`);
    if (!confirmacion) return;

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Authorization': `Bearer ${tokenGlobal}` }
        });

        if (res.ok) {
            await actualizarDatosGlobales();
        } else {
            const data = await res.json();
            alert(`Error: ${data.error || 'No se pudo completar la operación'}`);
        }
    } catch (error) {
        console.error("Error cambiando el estado de la tienda:", error);
    }
}
// ==========================================================================
// 10. FORMULARIOS DE ALTA: COMERCIOS Y TIENDAS
// ==========================================================================

document.getElementById('formComercio')?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const payload = {
        nombre: document.getElementById('nombreComercio').value.trim(),
        cuit: document.getElementById('cuitComercio').value.trim()
    };

    try {
        const res = await fetch(`${API_URL}/comercios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenGlobal}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('✅ Comercio registrado con éxito');
            document.getElementById('formComercio').reset();
            await actualizarDatosGlobales(); 
        } else {
            const data = await res.json();
            alert(`❌ Error: ${data.error || 'No se pudo crear el comercio'}`);
        }
    } catch (error) {
        console.error("Error al crear comercio:", error);
    }
});

// Crear Nueva Tienda
document.getElementById('formTienda')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nombre: document.getElementById('nombreTienda').value.trim(),
        dominio: document.getElementById('dominioTienda').value.trim(),
        comercioId: document.getElementById('selectComercioTienda').value
    };

    try {
        const res = await fetch(`${API_URL}/tiendas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenGlobal}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('✅ Tienda registrada con éxito');
            document.getElementById('formTienda').reset();
            await actualizarDatosGlobales();
        } else {
            const data = await res.json();
            alert(`❌ Error: ${data.error || data.detalle || 'No se pudo crear la tienda'}`);
        }
    } catch (error) {
        console.error("Error al crear tienda:", error);
    }
});
// ==========================================================================
// 11. VISOR DE STOCK DINÁMICO (FILTROS EN CASCADA)
// ==========================================================================

// Se ejecuta al cambiar el <select> de Comercio en la pestaña Stock
function actualizarFiltroTiendas() {
    const comercioId = document.getElementById('filtroComercioStock').value;
    const selectTienda = document.getElementById('filtroTiendaStock');

    if (!comercioId) {
        selectTienda.innerHTML = '<option value="">Primero seleccione un comercio...</option>';
        return;
    }

    const tiendasFiltradas = tiendasGlobal.filter(t => t.comercioId === comercioId && t.estado === 'Activa');

    selectTienda.innerHTML = '<option value="">Seleccione una tienda...</option>' +
        tiendasFiltradas.map(t => `<option value="${t._id}">${t.nombre}</option>`).join('');
}

// Se ejecuta al elegir una Tienda y presionar buscar
async function buscarProductosPorTienda() {
    const tiendaId = document.getElementById('filtroTiendaStock').value;
    const tablaProductos = document.getElementById('tablaProductos');

    if (!tiendaId) {
        tablaProductos.innerHTML = '<tr><td colspan="5" style="text-align:center;">Seleccione una tienda para ver su stock.</td></tr>';
        return;
    }

    try {
        tablaProductos.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando catálogo...</td></tr>';

        const res = await fetch(`${API_URL}/productos/tienda/${tiendaId}`, {
            headers: { 'Authorization': `Bearer ${tokenGlobal}` }
        });

        const data = await res.json();

        if (res.ok) {
            const productos = extraerArray(data);
            renderizarProductos(productos, tiendaId);
        } else {
            tablaProductos.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error: ${data.error}</td></tr>`;
        }
    } catch (error) {
        console.error("Error buscando productos:", error);
        tablaProductos.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error de conexión.</td></tr>`;
    }
}

function renderizarProductos(productos, tiendaId) {
    const tablaProductos = document.getElementById('tablaProductos');

    if (!tablaProductos) return;

    if (productos.length === 0) {
        tablaProductos.innerHTML = `<tr><td colspan="5" style="text-align:center;">Esta tienda no tiene productos registrados.</td></tr>`;
        return;
    }

    tablaProductos.innerHTML = `
        <thead>
            <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>📋 ID del Producto</th>
                <th>🏠 ID de la Tienda</th>
            </tr>
        </thead>
        <tbody>
            ${productos.map(p => `
                <tr>
                    <td><strong>${p.nombre}</strong></td>
                    <td><span class="badge ${p.stock > 10 ? 'badge-success' : 'badge-danger'}">${p.stock}</span></td>
                    <td>$${p.precio}</td>
                    <td style="font-family: monospace; font-size: 0.85rem; color: #a1a1aa;">${p._id}</td>
                    <td style="font-family: monospace; font-size: 0.85rem; color: #a1a1aa;">${p.tiendaId || tiendaId}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
}
// ==========================================================================
// 12. DESPLEGABLE INTELIGENTE DE TIENDAS PARA PRODUCTOS
// ==========================================================================

function llenarSelectTiendasProducto() {
    const select = document.getElementById('selectTiendaProducto');
    if (!select || tiendasGlobal.length === 0) return;

    try {
        const tokenData = JSON.parse(atob(tokenGlobal.split('.')[1]));
        const miComercioId = tokenData.comercioId;
        const miRol = tokenData.rol;

        let tiendasFiltradas = [];

        if (miRol === 'Admin') {
            // El Admin ve absolutamente todas las tiendas activas
            tiendasFiltradas = tiendasGlobal.filter(t => t.estado === 'Activa');
        } else {
            // Dueños y Empleados ven SOLAMENTE las tiendas conectadas a su Comercio
            tiendasFiltradas = tiendasGlobal.filter(t => t.comercioId === miComercioId && t.estado === 'Activa');
        }

        select.innerHTML = '<option value="">Seleccione una tienda...</option>' +
            tiendasFiltradas.map(t => {
                if (miRol === 'Admin') {
                    const comercioPadre = comerciosGlobal.find(c => c._id === t.comercioId);
                    const nombreCom = comercioPadre ? comercioPadre.nombre : 'Desconocido';
                    return `<option value="${t._id}">${t.nombre} (${nombreCom})</option>`;
                }
                return `<option value="${t._id}">${t.nombre}</option>`;
            }).join('');

    } catch (error) {
        console.error("Error al procesar el token para el select:", error);
    }
}
// ==========================================================================
// 13. FORMULARIO DE ALTA: NUEVO PRODUCTO
// ==========================================================================

document.getElementById('formProducto')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nombre: document.getElementById('nombreProducto').value.trim(),
        stock: parseInt(document.getElementById('stockProducto').value, 10),
        precio: parseFloat(document.getElementById('precioProducto').value),
        tiendaId: document.getElementById('selectTiendaProducto').value
    };

    try {
        const res = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenGlobal}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert('✅ Producto registrado con éxito en el inventario.');
            document.getElementById('formProducto').reset();

            if (document.getElementById('filtroTiendaStock').value === payload.tiendaId) {
                buscarProductosPorTienda();
            }
        } else {
            alert(`❌ Error: ${data.error || 'No se pudo registrar el producto'}`);
        }
    } catch (error) {
        console.error("Error al registrar producto:", error);
        alert('Error de red al intentar comunicarse con el servidor.');
    }
});
// ==========================================================================
// 14. FLUJO DE VENTAS DINÁMICO (FILTROS POR ROL Y CASCADA)
// ==========================================================================

function llenarSelectTiendasVenta() {
    const select = document.getElementById('selectTiendaVenta');
    if (!select || tiendasGlobal.length === 0) return;

    try {
        const tokenData = JSON.parse(atob(tokenGlobal.split('.')[1]));
        const miComercioId = tokenData.comercioId;
        const miRol = tokenData.rol;

        let tiendasFiltradas = [];

        if (miRol === 'Admin') {
            tiendasFiltradas = tiendasGlobal.filter(t => t.estado === 'Activa');
        } else {
            tiendasFiltradas = tiendasGlobal.filter(t => t.comercioId === miComercioId && t.estado === 'Activa');
        }

        select.innerHTML = '<option value="">Seleccione una tienda...</option>' + 
            tiendasFiltradas.map(t => {
                if (miRol === 'Admin') {
                    const com = comerciosGlobal.find(c => c._id === t.comercioId);
                    return `<option value="${t._id}">${t.nombre} (${com ? com.nombre : 'Desconocido'})</option>`;
                }
                return `<option value="${t._id}">${t.nombre}</option>`;
            }).join('');
            
    } catch (error) {
        console.error("Error al procesar permisos de tiendas para ventas:", error);
    }
}

async function actualizarProductosVenta() {
    const tiendaId = document.getElementById('selectTiendaVenta').value;
    const selectProducto = document.getElementById('selectProductoVenta');

    if (!tiendaId) {
        selectProducto.innerHTML = '<option value="">Primero seleccione una tienda...</option>';
        return;
    }

    try {
        selectProducto.innerHTML = '<option value="">Cargando catálogo de productos...</option>';

        const res = await fetch(`${API_URL}/productos/tienda/${tiendaId}`, {
            headers: { 'Authorization': `Bearer ${tokenGlobal}` }
        });
        const data = await res.json();
        const productos = extraerArray(data);

        if (productos.length === 0) {
            selectProducto.innerHTML = '<option value="">No hay productos en esta tienda</option>';
            return;
        }

        selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>' + 
            productos.map(p => `<option value="${p._id}">${p.nombre} ($${p.precio}) [Disponibles: ${p.stock}]</option>`).join('');

    } catch (error) {
        console.error("Error cargando productos para el formulario de ventas:", error);
        selectProducto.innerHTML = '<option value="">Error al cargar catálogo</option>';
    }
}

document.getElementById('formVenta')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        productoId: document.getElementById('selectProductoVenta').value,
        cantidad: parseInt(document.getElementById('cantidadVenta').value, 10)
    };

    if (!payload.productoId) {
        alert('Por favor, seleccione un producto válido.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenGlobal}` 
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert('✅ Venta procesada correctamente. Stock actualizado.');
            document.getElementById('formVenta').reset();
            
            document.getElementById('selectProductoVenta').innerHTML = '<option value="">Primero seleccione una tienda...</option>';
            
            await cargarVentas();
            if (typeof buscarProductosPorTienda === 'function') buscarProductosPorTienda();
        } else {
            alert(` Error al vender: ${data.error || 'Verifique el stock disponible'}`);
        }
    } catch (error) {
        console.error("Error en flujo de transacciones:", error);
    }
});
