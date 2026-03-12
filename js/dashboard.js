
let inquilinos = JSON.parse(localStorage.getItem('eduspace_inquilinos') || '[]');
let habitaciones = JSON.parse(localStorage.getItem('eduspace_habitaciones') || '[]');
let pagos = JSON.parse(localStorage.getItem('eduspace_pagos') || '[]');
let reportes = JSON.parse(localStorage.getItem('eduspace_reportes') || '[]');

let editandoId = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    const sesion = JSON.parse(localStorage.getItem('eduspace_sesion') || 'null');
    if (!sesion) {
        window.location.href = 'index.html';
        return;
    }

    // Mostrar info usuario
    document.getElementById('welcomeName').textContent = sesion.nombre.split(' ')[0];
    document.getElementById('suNombre').textContent = sesion.nombre;
    document.getElementById('suRol').textContent = sesion.rol === 'admin' ? '⚙️ Administrador' : '🏠 Inquilino';
    document.getElementById('suAvatar').textContent = sesion.nombre.charAt(0).toUpperCase();

    // Fecha
    const hoy = new Date();
    document.getElementById('fechaHoy').textContent = hoy.toLocaleDateString('es-CO', {
        weekday: 'short', day: 'numeric', month: 'short'
    });

    // Si no hay datos demo, cargar algunos de ejemplo
    if (inquilinos.length === 0) cargarDatosDemo();

    // Renderizar todo
    actualizarKPIs();
    renderInquilinos();
    renderHabitaciones();
    renderPagos();
    renderReportes();
    actualizarActividad();
    actualizarGraficoOcupacion();
    actualizarNotificaciones();

    // Mes actual en el form de pagos
    const hoyMes = new Date().toISOString().slice(0, 7);
    const inputMes = document.getElementById('pago-mes');
    if (inputMes) inputMes.value = hoyMes;
});

// ===== DATOS DEMO =====
function cargarDatosDemo() {
    inquilinos = [
        { id: 1, nombre: 'María García', email: 'maria@email.com', tel: '+57 310 123 4567', habitacion: 'Hab. 101', pago: 'al_dia' },
        { id: 2, nombre: 'Carlos Pérez', email: 'carlos@email.com', tel: '+57 315 987 6543', habitacion: 'Hab. 203', pago: 'mora' },
        { id: 3, nombre: 'Laura Martínez', email: 'laura@email.com', tel: '+57 318 456 7890', habitacion: 'Hab. 305', pago: 'al_dia' },
    ];
    habitaciones = [
        { id: 1, numero: 'Hab. 101', casa: 'Casa Central', precio: 450000, estado: 'ocupada' },
        { id: 2, numero: 'Hab. 102', casa: 'Casa Central', precio: 450000, estado: 'mantenimiento' },
        { id: 3, numero: 'Hab. 203', casa: 'Coliving Norte', precio: 320000, estado: 'ocupada' },
        { id: 4, numero: 'Hab. 305', casa: 'Residencia Univ.', precio: 580000, estado: 'ocupada' },
        { id: 5, numero: 'Hab. 401', casa: 'Coliving Sur', precio: 650000, estado: 'disponible' },
    ];
    pagos = [
        { id: 1, fecha: '01/03/2026', inquilino: 'María García', habitacion: 'Hab. 101', monto: 450000, mes: '2026-03', estado: 'pagado' },
        { id: 2, fecha: '28/02/2026', inquilino: 'Laura Martínez', habitacion: 'Hab. 305', monto: 580000, mes: '2026-02', estado: 'pagado' },
        { id: 3, fecha: '01/03/2026', inquilino: 'Carlos Pérez', habitacion: 'Hab. 203', monto: 320000, mes: '2026-03', estado: 'pendiente' },
    ];
    if (reportes.length === 0) {
        reportes = [
            { id: 1, nombre: 'María García', habitacion: 'Hab. 101', tipo: 'plomeria', prioridad: 'alta', descripcion: 'El grifo del baño tiene una fuga desde hace 2 días.', fecha: '28/02/2026', hora: '09:30', estado: 'pendiente' },
            { id: 2, nombre: 'Carlos Pérez', habitacion: 'Hab. 203', tipo: 'electrico', prioridad: 'media', descripcion: 'El tomacorriente del lado derecho no funciona.', fecha: '01/03/2026', hora: '11:00', estado: 'pendiente' },
        ];
    }
    guardarTodo();
}

function guardarTodo() {
    localStorage.setItem('eduspace_inquilinos', JSON.stringify(inquilinos));
    localStorage.setItem('eduspace_habitaciones', JSON.stringify(habitaciones));
    localStorage.setItem('eduspace_pagos', JSON.stringify(pagos));
    localStorage.setItem('eduspace_reportes', JSON.stringify(reportes));
}

// ===== KPIs =====
function actualizarKPIs() {
    document.getElementById('totalInquilinos').textContent = inquilinos.length;
    document.getElementById('totalHabitaciones').textContent = habitaciones.length;

    const totalRecaudo = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0);
    document.getElementById('totalPagos').textContent = '$' + totalRecaudo.toLocaleString('es-CO');

    const pendientes = reportes.filter(r => r.estado === 'pendiente').length;
    document.getElementById('totalReportes').textContent = pendientes;

    // Badge notificaciones
    document.getElementById('notifBadge').textContent = pendientes;
}

// ===== GRÁFICO OCUPACIÓN =====
function actualizarGraficoOcupacion() {
    const total = habitaciones.length;
    const ocupadas = habitaciones.filter(h => h.estado === 'ocupada').length;
    const libres = habitaciones.filter(h => h.estado === 'disponible').length;
    const mant = habitaciones.filter(h => h.estado === 'mantenimiento').length;

    document.getElementById('ocuOcupadas').textContent = ocupadas;
    document.getElementById('ocuLibres').textContent = libres;
    document.getElementById('ocuMant').textContent = mant;

    if (total === 0) return;

    const pct = Math.round((ocupadas / total) * 100);
    const circumference = 251.2;
    const dash = (pct / 100) * circumference;

    document.getElementById('ocuLabel').textContent = pct + '%';

    // Animar el círculo
    setTimeout(() => {
        const circle = document.getElementById('ocuCircle');
        if (circle) circle.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
    }, 400);
}

// ===== ACTIVIDAD =====
function actualizarActividad() {
    const lista = document.getElementById('actividadLista');
    const actividades = [];

    pagos.slice(0, 2).forEach(p => {
        actividades.push({ icon: '💳', titulo: `Pago registrado · ${p.inquilino}`, sub: `$${p.monto.toLocaleString()} · ${p.fecha}` });
    });
    reportes.filter(r => r.estado === 'pendiente').slice(0, 2).forEach(r => {
        actividades.push({ icon: '🔧', titulo: `Reporte · ${r.habitacion}`, sub: `${r.tipo} · ${r.prioridad}` });
    });
    inquilinos.slice(0, 1).forEach(i => {
        actividades.push({ icon: '👤', titulo: `Inquilino activo · ${i.nombre}`, sub: `${i.habitacion}` });
    });

    if (actividades.length === 0) {
        lista.innerHTML = '<div class="actividad-item"><span class="act-icon">📝</span><div><strong>Sistema iniciado</strong><small>Bienvenido a EduSpace</small></div></div>';
        return;
    }

    lista.innerHTML = actividades.slice(0, 4).map(a => `
        <div class="actividad-item">
            <span class="act-icon">${a.icon}</span>
            <div>
                <strong>${a.titulo}</strong>
                <small>${a.sub}</small>
            </div>
        </div>
    `).join('');
}

// ===== NOTIFICACIONES =====
function actualizarNotificaciones() {
    const pendientes = reportes.filter(r => r.estado === 'pendiente').length;
    document.getElementById('notifBadge').textContent = pendientes;
}

function toggleNotif() {
    const pendientes = reportes.filter(r => r.estado === 'pendiente').length;
    mostrarToastDash(`🔔 Tienes ${pendientes} reporte(s) pendiente(s)`, 'info');
}

// ===== PANELES =====
function mostrarPanel(nombre) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('activo'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    const panel = document.getElementById('panel-' + nombre);
    if (panel) panel.classList.add('activo');

    const link = document.querySelector(`[data-panel="${nombre}"]`);
    if (link) link.classList.add('active');

    const titulos = {
        resumen: 'Dashboard',
        inquilinos: 'Gestión de Inquilinos',
        habitaciones: 'Control de Habitaciones',
        pagos: 'Gestión de Pagos',
        reportes: 'Reportes de Mantenimiento'
    };
    document.getElementById('topbarTitle').textContent = titulos[nombre] || 'Dashboard';

    // Cerrar sidebar en mobile
    document.getElementById('sidebar').classList.remove('abierta');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('abierta');
}

// ===== CERRAR SESIÓN =====
function cerrarSesion() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
        localStorage.removeItem('eduspace_sesion');
        window.location.href = 'index.html';
    }
}

// ===== INQUILINOS =====
function renderInquilinos() {
    const buscar = (document.getElementById('buscarInquilino')?.value || '').toLowerCase();
    const filtrados = inquilinos.filter(i =>
        i.nombre.toLowerCase().includes(buscar) ||
        i.email.toLowerCase().includes(buscar) ||
        i.habitacion.toLowerCase().includes(buscar)
    );

    const tbody = document.getElementById('bodyInquilinos');
    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-row">No se encontraron inquilinos</td></tr>';
        return;
    }

    tbody.innerHTML = filtrados.map(i => `
        <tr>
            <td><strong>${i.nombre}</strong></td>
            <td>${i.email}</td>
            <td>${i.habitacion}</td>
            <td><span class="badge badge-${i.pago}">${badgePago(i.pago)}</span></td>
            <td>
                <button class="btn-edit" onclick="editarInquilino(${i.id})">✏️ Editar</button>
                <button class="btn-del" onclick="eliminarInquilino(${i.id})">🗑️ Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function badgePago(estado) {
    const map = { al_dia: '✅ Al día', mora: '⚠️ Mora', pendiente: '🕐 Pendiente' };
    return map[estado] || estado;
}

function abrirModalInquilino() {
    editandoId = null;
    document.getElementById('formInquilino').reset();
    document.getElementById('inq-id').value = '';
    document.getElementById('modalInquilinoTitulo').textContent = 'Agregar Inquilino';
    document.getElementById('modalInquilino').classList.add('abierto');
}

function editarInquilino(id) {
    const inq = inquilinos.find(i => i.id === id);
    if (!inq) return;
    editandoId = id;
    document.getElementById('inq-id').value = id;
    document.getElementById('inq-nombre').value = inq.nombre;
    document.getElementById('inq-email').value = inq.email;
    document.getElementById('inq-tel').value = inq.tel || '';
    document.getElementById('inq-hab').value = inq.habitacion;
    document.getElementById('inq-pago').value = inq.pago;
    document.getElementById('modalInquilinoTitulo').textContent = 'Editar Inquilino';
    document.getElementById('modalInquilino').classList.add('abierto');
}

function guardarInquilino(event) {
    event.preventDefault();
    const datos = {
        id: editandoId || Date.now(),
        nombre: document.getElementById('inq-nombre').value.trim(),
        email: document.getElementById('inq-email').value.trim(),
        tel: document.getElementById('inq-tel').value.trim(),
        habitacion: document.getElementById('inq-hab').value.trim(),
        pago: document.getElementById('inq-pago').value
    };

    if (editandoId) {
        const idx = inquilinos.findIndex(i => i.id === editandoId);
        inquilinos[idx] = datos;
        mostrarToastDash('✅ Inquilino actualizado correctamente', 'success');
    } else {
        inquilinos.push(datos);
        mostrarToastDash('✅ Inquilino registrado exitosamente', 'success');
    }

    localStorage.setItem('eduspace_inquilinos', JSON.stringify(inquilinos));
    document.getElementById('modalInquilino').classList.remove('abierto');
    renderInquilinos();
    actualizarKPIs();
    actualizarActividad();
}

function eliminarInquilino(id) {
    if (!confirm('¿Eliminar este inquilino?')) return;
    inquilinos = inquilinos.filter(i => i.id !== id);
    localStorage.setItem('eduspace_inquilinos', JSON.stringify(inquilinos));
    renderInquilinos();
    actualizarKPIs();
    mostrarToastDash('🗑️ Inquilino eliminado', 'error');
}

// ===== HABITACIONES =====
function renderHabitaciones() {
    const grid = document.getElementById('habitacionesGrid');
    if (habitaciones.length === 0) {
        grid.innerHTML = '<div class="empty-state">No hay habitaciones. Haz clic en "+ Nueva Habitación" para comenzar.</div>';
        return;
    }

    const iconos = { ocupada: '🔴', disponible: '🟢', mantenimiento: '🟡' };
    grid.innerHTML = habitaciones.map(h => `
        <div class="hab-card ${h.estado}">
            <button class="hab-del" onclick="eliminarHabitacion(${h.id})" title="Eliminar">✕</button>
            <div class="hab-emoji">${iconos[h.estado] || '🏠'}</div>
            <div class="hab-num">${h.numero}</div>
            <div class="hab-casa">${h.casa}</div>
            <span class="badge badge-${h.estado}">${h.estado.charAt(0).toUpperCase() + h.estado.slice(1)}</span>
            <div class="hab-precio" style="margin-top:8px">$${h.precio.toLocaleString()}/mes</div>
        </div>
    `).join('');
}

function abrirModalHabitacion() {
    document.getElementById('formHabitacion').reset();
    document.getElementById('modalHabitacion').classList.add('abierto');
}

function guardarHabitacion(event) {
    event.preventDefault();
    const hab = {
        id: Date.now(),
        numero: document.getElementById('hab-num').value.trim(),
        casa: document.getElementById('hab-casa').value.trim(),
        precio: parseInt(document.getElementById('hab-precio').value),
        estado: document.getElementById('hab-estado').value
    };
    habitaciones.push(hab);
    localStorage.setItem('eduspace_habitaciones', JSON.stringify(habitaciones));
    document.getElementById('modalHabitacion').classList.remove('abierto');
    renderHabitaciones();
    actualizarKPIs();
    actualizarGraficoOcupacion();
    mostrarToastDash('🏠 Habitación registrada', 'success');
}

function eliminarHabitacion(id) {
    if (!confirm('¿Eliminar esta habitación?')) return;
    habitaciones = habitaciones.filter(h => h.id !== id);
    localStorage.setItem('eduspace_habitaciones', JSON.stringify(habitaciones));
    renderHabitaciones();
    actualizarKPIs();
    actualizarGraficoOcupacion();
    mostrarToastDash('🗑️ Habitación eliminada', 'error');
}

// ===== PAGOS =====
function renderPagos() {
    const tbody = document.getElementById('bodyPagos');
    if (pagos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-row">No hay pagos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = pagos.map(p => `
        <tr>
            <td>${p.fecha}</td>
            <td><strong>${p.inquilino}</strong></td>
            <td>${p.habitacion}</td>
            <td><strong>$${p.monto.toLocaleString()}</strong></td>
            <td><span class="badge badge-${p.estado}">${badgePagoEstado(p.estado)}</span></td>
            <td>
                ${p.estado !== 'pagado' ? `<button class="btn-edit" onclick="marcarPagado(${p.id})">✅ Marcar pagado</button>` : '<span style="color:#28a745;font-size:0.8rem">✅ Confirmado</span>'}
                <button class="btn-del" onclick="eliminarPago(${p.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function badgePagoEstado(estado) {
    const map = { pagado: '✅ Pagado', pendiente: '🕐 Pendiente', mora: '⚠️ Mora' };
    return map[estado] || estado;
}

function abrirModalPago() {
    document.getElementById('formPago').reset();
    const hoyMes = new Date().toISOString().slice(0, 7);
    document.getElementById('pago-mes').value = hoyMes;
    document.getElementById('modalPago').classList.add('abierto');
}

function guardarPago(event) {
    event.preventDefault();
    const pago = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString('es-CO'),
        inquilino: document.getElementById('pago-inquilino').value.trim(),
        habitacion: document.getElementById('pago-hab').value.trim(),
        monto: parseInt(document.getElementById('pago-monto').value),
        mes: document.getElementById('pago-mes').value,
        estado: document.getElementById('pago-estado').value
    };
    pagos.unshift(pago);
    localStorage.setItem('eduspace_pagos', JSON.stringify(pagos));
    document.getElementById('modalPago').classList.remove('abierto');
    renderPagos();
    actualizarKPIs();
    actualizarActividad();
    mostrarToastDash('💳 Pago registrado exitosamente', 'success');
}

function marcarPagado(id) {
    const idx = pagos.findIndex(p => p.id === id);
    if (idx !== -1) {
        pagos[idx].estado = 'pagado';
        localStorage.setItem('eduspace_pagos', JSON.stringify(pagos));
        renderPagos();
        actualizarKPIs();
        mostrarToastDash('✅ Pago marcado como confirmado', 'success');
    }
}

function eliminarPago(id) {
    if (!confirm('¿Eliminar este registro de pago?')) return;
    pagos = pagos.filter(p => p.id !== id);
    localStorage.setItem('eduspace_pagos', JSON.stringify(pagos));
    renderPagos();
    actualizarKPIs();
    mostrarToastDash('🗑️ Pago eliminado', 'error');
}

// ===== REPORTES =====
function renderReportes() {
    const lista = document.getElementById('reportesLista');
    const pendientes = reportes.filter(r => r.estado === 'pendiente');

    if (pendientes.length === 0) {
        lista.innerHTML = '<div class="empty-state">🎉 No hay reportes pendientes. ¡Todo está en orden!</div>';
        return;
    }

    lista.innerHTML = pendientes.map(r => `
        <div class="reporte-card ${r.prioridad}" id="reporte-${r.id}">
            <div>
                <h4>🔧 ${r.habitacion} · ${r.tipo}</h4>
                <p>${r.descripcion}</p>
                <small>👤 ${r.nombre} · ${r.fecha} ${r.hora}</small>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px">
                <span class="badge-${r.prioridad}">${r.prioridad.toUpperCase()}</span>
                <button class="btn-resolver" onclick="resolverReporte(${r.id})">✅ Resolver</button>
            </div>
        </div>
    `).join('');
}

function resolverReporte(id) {
    const idx = reportes.findIndex(r => r.id === id);
    if (idx !== -1) {
        reportes[idx].estado = 'resuelto';
        localStorage.setItem('eduspace_reportes', JSON.stringify(reportes));
        renderReportes();
        actualizarKPIs();
        actualizarNotificaciones();
        mostrarToastDash('✅ Reporte marcado como resuelto', 'success');
    }
}

// ===== MODAL CERRAR =====
function cerrarModalExtra(event, modalId) {
    if (event.target.id === modalId) {
        document.getElementById(modalId).classList.remove('abierto');
    }
}

// ===== TOAST =====
function mostrarToastDash(mensaje, tipo = 'info') {
    const toast = document.getElementById('toastDash');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.background = tipo === 'success' ? '#28a745' : tipo === 'error' ? '#BF1120' : '#034C8C';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}
