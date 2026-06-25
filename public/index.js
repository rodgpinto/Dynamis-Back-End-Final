const API_URL = '/api';
let tokenGlobal = '';
let rolGlobal = '';

// --- NAVEGACIÓN ---
function mostrarSeccion(idSeccion) {
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(idSeccion).classList.remove('hidden');
}

function controlarVisibilidadComercioUsuario() {
    const rol = document.getElementById('rolUsuario').value;
    const box = document.getElementById('boxComercioUsuario');
    const select = document.getElementById('selectComercioUsuario');
    if (rol === 'Admin') {
        box.classList.add('hidden'); select.removeAttribute('required');
    } else {
        box.classList.remove('hidden'); select.setAttribute('required', 'true');
    }
}

// --- LOGIN ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('email').value, password: document.getElementById('password').value })
    });
    const data = await res.json();

    if (res.ok) {
        tokenGlobal = data.token; rolGlobal = data.usuario.rol;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
        document.getElementById('userBadge').textContent = `Rol: ${rolGlobal} | ${data.usuario.email}`;

        if (rolGlobal === 'Admin') {
            document.getElementById('adminPanels').classList.remove('hidden');
            document.getElementById('tiendaPanelForm').classList.remove('hidden');
            document.getElementById('productoPanelForm').classList.remove('hidden'); // NUEVO
        } else if (rolGlobal === 'Dueño') {
            document.getElementById('tiendaPanelForm').classList.remove('hidden');
            document.getElementById('productoPanelForm').classList.remove('hidden'); // NUEVO
        }
        controlarVisibilidadComercioUsuario();
        actualizarDatosGlobales();

    } else {
        document.getElementById('loginMessage').textContent = data.error;
    }
});

document.getElementById('btnLogout').addEventListener('click', () => location.reload());

function extraerArray(json) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    if (json && Array.isArray(json.comercios)) return json.comercios;
    if (json && Array.isArray(json.tiendas)) return json.tiendas;
    return [];
}

async function actualizarDatosGlobales() {
    try {
        const [resCom, resTien] = await Promise.all([
            fetch(`${API_URL}/comercios`, { headers: { 'Authorization': `Bearer ${tokenGlobal}` } }),
            fetch(`${API_URL}/tiendas`, { headers: { 'Authorization': `Bearer ${tokenGlobal}` } })
        ]);
        const comercios = extraerArray(await resCom.json());
        const tiendas = extraerArray(await resTien.json());

        renderizarComerciosYListas(comercios, tiendas);
        renderizarTiendasIndependientes(tiendas, comercios);
        cargarVentas();
    } catch (error) { console.error("Error:", error); }
}

// --- RENDERIZADO VISUAL ---
function renderizarComerciosYListas(comercios, tiendas) {
    const grid = document.getElementById('gridComercios');
    const selectTiendaForm = document.getElementById('selectComercio');
    const selectUserForm = document.getElementById('selectComercioUsuario');

    grid.innerHTML = '';
    selectTiendaForm.innerHTML = '<option value="" disabled selected>Seleccione un comercio...</option>';
    selectUserForm.innerHTML = '<option value="" disabled selected>Seleccione un comercio...</option>';

    comercios.forEach(com => {
        const comIdStr = String(com._id);
        const estadoClase = com.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

        const tiendasDelComercio = tiendas.filter(t => {
            const tComId = t.comercioId._id ? String(t.comercioId._id) : String(t.comercioId);
            return tComId === comIdStr;
        });

        let htmlTiendas = '';
        if (tiendasDelComercio.length > 0) {
            htmlTiendas = '<ul class="pl-4 border-l-2 border-gray-200 space-y-2 mt-2">';
            tiendasDelComercio.forEach(t => {
                const estadoT = t.estado === 'Activa' ? '' : '<span class="text-red-500 text-xs ml-2 font-bold">(Inactiva)</span>';
                let botonesTienda = '';
                if (rolGlobal === 'Admin' || rolGlobal === 'Dueño') {
                    if (t.estado === 'Activa') {
                        botonesTienda = `<button onclick="bajaTienda('${t._id}')" class="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-0.5 bg-red-50 rounded border border-red-200">Baja Lógica</button>`;
                    } else {
                        botonesTienda = `<button onclick="reactivarTienda('${t._id}')" class="text-green-600 hover:text-green-800 text-xs font-bold px-2 py-0.5 bg-green-50 rounded border border-green-200">Reactivar</button>`;
                    }
                }

                htmlTiendas += `<li class="text-sm text-gray-600 flex flex-col bg-gray-50 p-2 rounded border border-gray-100">
                            <div class="flex items-center justify-between">
                                <span><b>${t.nombre}</b> ${estadoT}</span>
                                ${botonesTienda}
                            </div>
                            <span class="text-xs text-blue-500 font-mono mt-1 select-all" title="Copiar ID">ID Tienda: ${t._id}</span>
                        </li>`;
            });
            htmlTiendas += '</ul>';
        } else {
            htmlTiendas = '<p class="text-sm text-gray-400 italic mt-2">No posee tiendas vinculadas.</p>';
        }

        grid.innerHTML += `
                    <div class="bg-white rounded-lg shadow-md border-t-4 ${com.estado === 'Activo' ? 'border-blue-600' : 'border-gray-400'} p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-1">
                                <h3 class="text-xl font-extrabold text-gray-800">${com.nombre}</h3>
                                <span class="px-2 py-1 rounded text-xs font-bold ${estadoClase}">${com.estado}</span>
                            </div>
                            <p class="text-sm text-gray-500 mb-1 font-mono">CUIT: ${com.cuit}</p>
                            <p class="text-xs text-blue-600 font-mono bg-blue-50 p-1 rounded inline-block select-all mb-4">ID: ${com._id}</p>
                            
                            <div class="border-t border-dashed border-gray-200 pt-3">
                                <h4 class="text-sm font-bold text-gray-700">Tiendas asociadas (${tiendasDelComercio.length}):</h4>
                                ${htmlTiendas}
                            </div>
                        </div>
                        
                        ${rolGlobal === 'Admin' ? `
                        <div class="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                            ${com.estado === 'Activo' ?
                    `<button onclick="bajaComercio('${com._id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-bold transition shadow-sm">Dar de Baja</button>` :
                    `<button onclick="reactivarComercio('${com._id}')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold transition shadow-sm">Reactivar Comercio</button>`
                }
                        </div>` : ''}
                    </div>
                `;

        if (com.estado === 'Activo') {
            selectTiendaForm.innerHTML += `<option value="${com._id}">${com.nombre}</option>`;
            selectUserForm.innerHTML += `<option value="${com._id}">${com.nombre}</option>`;
        }
    });
}

function renderizarTiendasIndependientes(tiendas, comercios) {
    const grid = document.getElementById('gridTiendas');
    grid.innerHTML = '';
    // Llenamos el select de productos con las tiendas activas
    const selectTiendaProd = document.getElementById('selectTiendaProducto');
    selectTiendaProd.innerHTML = '<option value="" disabled selected>Seleccione una tienda...</option>';
    tiendas.forEach(t => {
        if (t.estado === 'Activa') selectTiendaProd.innerHTML += `<option value="${t._id}">${t.nombre} (${t.dominio})</option>`;
    });

    tiendas.forEach(t => {
        const idPadreABuscar = t.comercioId._id ? String(t.comercioId._id) : String(t.comercioId);
        const padre = comercios.find(c => String(c._id) === idPadreABuscar);
        const nombrePadre = padre ? padre.nombre : 'Comercio Eliminado o Desconocido';
        const estadoClase = t.estado === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

        let botonAccion = '';
        if (rolGlobal === 'Admin' || rolGlobal === 'Dueño') {
            if (t.estado === 'Activa') {
                botonAccion = `<button onclick="bajaTienda('${t._id}')" class="text-red-500 hover:text-red-700 text-sm font-bold">Baja Lógica</button>`;
            } else {
                botonAccion = `<button onclick="reactivarTienda('${t._id}')" class="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold hover:bg-green-200">Reactivar</button>`;
            }
        }

        grid.innerHTML += `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 relative flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-800">${t.nombre}</h3>
                                    <span class="text-blue-500 text-sm font-mono">${t.dominio}</span>
                                </div>
                                <span class="px-2 py-1 rounded text-xs font-bold ${estadoClase}">${t.estado}</span>
                            </div>
                            <div class="mt-4 bg-blue-50 p-3 rounded border border-blue-100 text-center">
                                <p class="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">Pertenece al Comercio:</p>
                                <p class="text-lg font-extrabold text-blue-900">${nombrePadre}</p>
                            </div>
                        </div>
                        <div class="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
                            <span class="text-xs text-gray-500 font-mono select-all bg-gray-100 px-2 py-1 rounded">ID: ${t._id}</span>
                            ${botonAccion}
                        </div>
                    </div>
                `;
    });
}

// --- FORMULARIOS (CREACIÓN DE DATOS) ---
document.getElementById('formComercio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/comercios`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenGlobal}` },
        body: JSON.stringify({ nombre: document.getElementById('nombreComercio').value, cuit: document.getElementById('cuitComercio').value })
    });
    if (res.ok) { document.getElementById('formComercio').reset(); actualizarDatosGlobales(); }
});

document.getElementById('formTienda').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/tiendas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenGlobal}` },
        body: JSON.stringify({ nombre: document.getElementById('nombreTienda').value, dominio: document.getElementById('dominioTienda').value, comercioId: document.getElementById('selectComercio').value })
    });
    if (res.ok) { document.getElementById('formTienda').reset(); actualizarDatosGlobales(); }
});

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const rol = document.getElementById('rolUsuario').value;
    const payload = {
        email: document.getElementById('emailUsuario').value,
        password: document.getElementById('passwordUsuario').value,
        rol: rol
    };
    if (rol !== 'Admin') payload.comercioId = document.getElementById('selectComercioUsuario').value;

    const res = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenGlobal}` },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert(`Usuario registrado con éxito.`);
        document.getElementById('formUsuario').reset();
        controlarVisibilidadComercioUsuario();
    } else {
        const err = await res.json();
        alert(`Error del Servidor: ${err.error} \nDetalle: ${err.detalle || 'Ninguno'}`);
    }
});

// --- FUNCIONES DE BAJA Y REACTIVACIÓN (CON MANEJO DE ERRORES) ---
async function reactivarComercio(id) {
    if (!confirm('¿Reactivar este Comercio corporativo?')) return;
    try {
        const res = await fetch(`${API_URL}/comercios/${id}/activar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${tokenGlobal}` } });
        if (res.ok) actualizarDatosGlobales();
        else { const data = await res.json(); alert(`El Backend rechazó la acción: ${data.error}`); }
    } catch (err) { alert('Error de conexión con el servidor.'); }
}

async function bajaComercio(id) {
    if (!confirm('¿Confirmás la baja lógica?')) return;
    try {
        const res = await fetch(`${API_URL}/comercios/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenGlobal}` } });
        if (res.ok) actualizarDatosGlobales();
        else { const data = await res.json(); alert(`El Backend rechazó la acción: ${data.error}`); }
    } catch (err) { alert('Error de conexión con el servidor.'); }
}

async function reactivarTienda(id) {
    if (!confirm('¿Reactivar esta Sucursal?')) return;
    try {
        const res = await fetch(`${API_URL}/tiendas/${id}/activar`, { method: 'PUT', headers: { 'Authorization': `Bearer ${tokenGlobal}` } });
        if (res.ok) actualizarDatosGlobales();
        else { const data = await res.json(); alert(`El Backend rechazó la acción: ${data.error}`); }
    } catch (err) { alert('Error de conexión con el servidor.'); }
}

async function bajaTienda(id) {
    if (!confirm('¿Confirmás la baja lógica?')) return;
    try {
        const res = await fetch(`${API_URL}/tiendas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenGlobal}` } });
        if (res.ok) actualizarDatosGlobales();
        else { const data = await res.json(); alert(`El Backend rechazó la acción: ${data.error}`); }
    } catch (err) { alert('Error de conexión con el servidor.'); }
}

// --- FORMULARIO DE PRODUCTOS ---
document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nombre: document.getElementById('nombreProducto').value,
        precio: Number(document.getElementById('precioProducto').value),
        stock: Number(document.getElementById('stockProducto').value),
        tiendaId: document.getElementById('selectTiendaProducto').value
    };

    const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenGlobal}` },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('¡Producto guardado/actualizado en el inventario con éxito!');
        document.getElementById('formProducto').reset();

        // Truco mágico: pegamos el ID de la tienda en el buscador y lo accionamos solos
        document.getElementById('inputTiendaId').value = payload.tiendaId;
        cargarStock();
    } else {
        const err = await res.json();
        alert(`Error al crear producto: ${err.error}`);
    }
});

// --- CARGA DE STOCK SEGURA ---
async function cargarStock() {
    // .trim() borra espacios en blanco accidentales al copiar y pegar el ID
    const id = document.getElementById('inputTiendaId').value.trim();
    if (!id) return alert('Por favor, ingresá o copiá un ID de Tienda válido.');

    try {
        // Inyectamos el Token por si la ruta está protegida
        const res = await fetch(`${API_URL}/productos/tienda/${id}`, {
            headers: { 'Authorization': `Bearer ${tokenGlobal}` }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`El backend rechazó la búsqueda: ${data.error || 'Error desconocido'}`);
            return;
        }

        const jsonStock = extraerArray(data);
        const grid = document.getElementById('gridStock');
        grid.innerHTML = '';

        if (jsonStock && jsonStock.length > 0) {
            jsonStock.forEach(p => {
                grid.innerHTML += `
                        <div class="bg-white border border-gray-200 p-4 rounded-lg flex justify-between items-center shadow-sm hover:shadow transition">
                            <div>
                                <p class="font-extrabold text-gray-800 text-lg">${p.nombre}</p>
                                <p class="text-sm text-emerald-600 font-bold mb-1">$${p.precio.toLocaleString()}</p>
                                <p class="text-xs text-gray-400 font-mono bg-gray-50 inline p-1 rounded select-all" title="Doble clic para copiar">ID: ${p._id}</p>
                            </div>
                            <div class="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-black text-2xl shadow-inner border border-amber-200">
                                ${p.stock} <span class="text-xs font-bold block text-center uppercase tracking-widest mt-0.5">Uds</span>
                            </div>
                        </div>`;
            });
        } else {
            grid.innerHTML = '<div class="col-span-2 bg-red-50 border border-red-200 p-4 rounded"><p class="text-red-600 font-bold text-center">No se encontraron productos en esta sucursal.</p></div>';
        }
    } catch (err) {
        alert('Error crítico de conexión al consultar el stock.');
    }
}

// --- FORMULARIO DE VENTAS (PUNTO DE VENTA) ---
        document.getElementById('formVenta').addEventListener('submit', async (e) => {
            e.preventDefault();
                        const payload = {
                productoId: document.getElementById('productoIdVenta').value.trim(),
                cantidad: Number(document.getElementById('cantidadVenta').value)
            };

            try {
                const res = await fetch(`${API_URL}/ventas`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenGlobal}` },
                    body: JSON.stringify(payload)
                });

                if (res.ok) { 
                    alert('¡Venta registrada con éxito! El stock se ha descontado.');
                    document.getElementById('formVenta').reset(); 
                    cargarVentas(); 
                } else { 
                    const err = await res.json();
                    alert(`Error al procesar la venta: ${err.error}`); 
                }
            } catch (err) {
                alert('Error crítico de conexión al intentar registrar la venta.');
            }
        });
        async function cargarVentas() {
            const res = await fetch(`${API_URL}/ventas`, { headers: { 'Authorization': `Bearer ${tokenGlobal}` } });
            const data = await res.json();
            const jsonVentas = extraerArray(data);
            const tbody = document.getElementById('tablaVentas');
            tbody.innerHTML = '';

            if(jsonVentas && jsonVentas.length > 0) {
                jsonVentas.forEach(v => {
                    const prodNombre = v.productoId ? v.productoId.nombre : 'Producto Removido';
                    const vendedorEmail = v.usuarioId ? v.usuarioId.email : 'Sistema';
                    const vendedorRol = v.usuarioId ? v.usuarioId.rol : '';

                    tbody.innerHTML += `
                        <tr class="hover:bg-gray-50 border-b border-gray-100">
                            <td class="p-3 text-sm text-gray-500">${new Date(v.createdAt).toLocaleDateString()}</td>
                            
                            <td class="p-3">
                                <span class="font-bold text-gray-700">${vendedorEmail}</span><br>
                                <span class="text-xs text-blue-500">${vendedorRol}</span>
                            </td>

                            <td class="p-3"><span class="font-semibold text-gray-800">${prodNombre}</span></td>
                            <td class="p-3 text-center font-bold text-gray-700">${v.cantidad}</td>
                            <td class="p-3 text-right font-bold text-emerald-600">$${v.total.toLocaleString()}</td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">No hay registros de transacciones comerciales.</td></tr>';
            }
        }