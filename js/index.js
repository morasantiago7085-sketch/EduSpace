
function navegar(idSeccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const seccion = document.getElementById(idSeccion);
    if (seccion) seccion.classList.add('activa');

    const link = document.querySelector(`[data-page="${idSeccion}"]`);
    if (link) link.classList.add('active');

    document.getElementById('navLinks').classList.remove('open');

    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Acciones especiales por sección
    if (idSeccion === 'inicio') iniciarContadores();
    if (idSeccion === 'contacto') cargarReportesRecientes();

    // Guardar posición
    history.pushState(null, '', '#' + idSeccion);
}

// ===== MENÚ HAMBURGER =====
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('open');
}

// ===== SCROLL HEADER =====
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== MODAL AUTH =====
function abrirModal(tipo = 'login') {
    const modal = document.getElementById('authModal');
    modal.classList.add('abierto');
    cambiarTab(tipo);
}

function cerrarModal() {
    document.getElementById('authModal').classList.remove('abierto');
    limpiarMensajes();
}

function cerrarModalFuera(event) {
    if (event.target.id === 'authModal') cerrarModal();
}

function cambiarTab(tipo) {
    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');
    const tabLogin = document.getElementById('tab-login');
    const tabRegistro = document.getElementById('tab-registro');

    if (tipo === 'login') {
        formLogin.classList.add('activa');
        formRegistro.classList.remove('activa');
        tabLogin.classList.add('active');
        tabRegistro.classList.remove('active');
    } else {
        formLogin.classList.remove('activa');
        formRegistro.classList.add('activa');
        tabLogin.classList.remove('active');
        tabRegistro.classList.add('active');
    }
    limpiarMensajes();
}

function limpiarMensajes() {
    ['login-error','login-success','reg-error','reg-success'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// ===== TOGGLE PASSWORD =====
function togglePass(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ===== FORTALEZA DE CONTRASEÑA =====
document.addEventListener('DOMContentLoaded', () => {
    const regPass = document.getElementById('reg-pass');
    if (regPass) {
        regPass.addEventListener('input', function() {
            const val = this.value;
            const strength = document.getElementById('passStrength');
            let score = 0;
            let color = '#ccc';
            let width = '0%';

            if (val.length >= 6) score++;
            if (val.length >= 10) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^a-zA-Z0-9]/.test(val)) score++;

            if (score <= 1) { color = '#BF1120'; width = '20%'; }
            else if (score === 2) { color = '#F2AB27'; width = '40%'; }
            else if (score === 3) { color = '#F2AB27'; width = '65%'; }
            else { color = '#28a745'; width = '100%'; }

            strength.innerHTML = `<div style="width:${width}; background:${color}; height:100%;"></div>`;
        });
    }

    // Cargar sección desde URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash) navegar(hash);
    else iniciarContadores();

    // Cargar datos del usuario si está logueado
    verificarSesion();
});

// ===== AUTH · LOGIN =====
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('login-error');
    const successEl = document.getElementById('login-success');

    // Obtener usuarios del localStorage
    const usuarios = JSON.parse(localStorage.getItem('eduspace_usuarios') || '[]');
    const usuario = usuarios.find(u => u.email === email && u.password === pass);

    if (!usuario) {
        mostrarMsg(errorEl, '❌ Correo o contraseña incorrectos. ¿No tienes cuenta? Regístrate.');
        return;
    }

    // Guardar sesión
    localStorage.setItem('eduspace_sesion', JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    }));

    mostrarMsg(successEl, `✅ ¡Bienvenido, ${usuario.nombre}! Redirigiendo...`);
    setTimeout(() => {
        if (usuario.rol === 'inquilino') {
            window.location.href = 'dashboard_inquilino.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }, 1200);
}

// ===== AUTH · REGISTRO =====
function handleRegistro(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const rol = document.getElementById('reg-rol').value;
    const tel = document.getElementById('reg-tel').value;
    const errorEl = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');

    // Validaciones
    if (pass.length < 6) {
        mostrarMsg(errorEl, '❌ La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('eduspace_usuarios') || '[]');

    if (usuarios.find(u => u.email === email)) {
        mostrarMsg(errorEl, '❌ Este correo ya está registrado. Inicia sesión.');
        return;
    }

    // Crear usuario
    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        email,
        password: pass,
        rol,
        tel,
        fecha: new Date().toLocaleDateString('es-CO')
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('eduspace_usuarios', JSON.stringify(usuarios));

    mostrarMsg(successEl, `🎉 ¡Cuenta creada exitosamente! Redirigiendo a tu panel...`);
    document.getElementById('form-registro').reset();
    // Guardar sesión y redirigir automáticamente
    localStorage.setItem('eduspace_sesion', JSON.stringify({
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
    }));
    setTimeout(() => {
        if (nuevoUsuario.rol === 'inquilino') {
            window.location.href = 'dashboard_inquilino.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }, 1200);
}

// ===== MOSTRAR MENSAJE =====
function mostrarMsg(el, texto) {
    el.textContent = texto;
    el.style.display = 'block';
}

// ===== VERIFICAR SESIÓN =====
function verificarSesion() {
    const sesion = JSON.parse(localStorage.getItem('eduspace_sesion') || 'null');
    if (sesion) {
        // Usuario logueado: cambiar botón
        const btnLogin = document.querySelector('.btn-login');
        const btnReg = document.querySelector('.btn-registro');
        const destino = sesion.rol === 'admin' ? 'dashboard.html' : 'dashboard_inquilino.html';
        if (btnLogin) {
            btnLogin.textContent = 'Mi Panel →';
            btnLogin.onclick = () => window.location.href = destino;
        }
        if (btnReg) {
            btnReg.textContent = `👤 ${sesion.nombre.split(' ')[0]}`;
            btnReg.onclick = () => window.location.href = destino;
        }
    }
}

// ===== GALERÍA · FILTROS =====
function filtrarGaleria(estado, boton) {
    // Actualizar botones
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    // Filtrar cards
    document.querySelectorAll('.galeria-card').forEach(card => {
        if (estado === 'todas' || card.dataset.estado === estado) {
            card.classList.remove('oculta');
            card.style.animation = 'fadeSlide 0.4s ease';
        } else {
            card.classList.add('oculta');
        }
    });
}

// ===== CONTACTO · ENVIAR REPORTE =====
function enviarReporte(event) {
    event.preventDefault();
    const nombre = document.getElementById('rep-nombre').value.trim();
    const hab = document.getElementById('rep-hab').value.trim();
    const tipo = document.getElementById('rep-tipo').value;
    const prioridad = document.querySelector('input[name="prioridad"]:checked').value;
    const desc = document.getElementById('rep-desc').value.trim();

    const reporte = {
        id: Date.now(),
        nombre,
        habitacion: hab,
        tipo,
        prioridad,
        descripcion: desc,
        fecha: new Date().toLocaleDateString('es-CO'),
        hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        estado: 'pendiente'
    };

    // Guardar en localStorage
    const reportes = JSON.parse(localStorage.getItem('eduspace_reportes') || '[]');
    reportes.unshift(reporte);
    localStorage.setItem('eduspace_reportes', JSON.stringify(reportes));

    // Feedback
    const btn = document.getElementById('btnReporteText');
    btn.textContent = '✅ ¡Reporte enviado!';
    mostrarToast('🔧 Reporte guardado. El administrador fue notificado.', 'success');

    setTimeout(() => {
        btn.textContent = '📤 Enviar Reporte al Sistema';
    }, 3000);

    event.target.reset();
    cargarReportesRecientes();
}

// ===== CARGAR REPORTES RECIENTES =====
function cargarReportesRecientes() {
    const reportes = JSON.parse(localStorage.getItem('eduspace_reportes') || '[]');
    const contenedor = document.getElementById('reportesRecientes');
    const lista = document.getElementById('listaReportes');

    if (reportes.length === 0) {
        if (contenedor) contenedor.style.display = 'none';
        return;
    }

    contenedor.style.display = 'block';
    lista.innerHTML = reportes.slice(0, 3).map(r => `
        <div class="reporte-item">
            <div>
                <strong>${r.habitacion}</strong> · ${r.tipo}
                <small style="display:block; color:#999">${r.fecha} · ${r.nombre}</small>
            </div>
            <span class="badge-prioridad badge-${r.prioridad}">${r.prioridad.toUpperCase()}</span>
        </div>
    `).join('');
}

// ===== FAQ TOGGLE =====
function toggleFaq(item) {
    item.classList.toggle('abierto');
}

// ===== CONTADORES ANIMADOS =====
function iniciarContadores() {
    // Counters de stats
    animarContadores(document.querySelectorAll('.counter'));

    // Mock numbers en hero
    animarContadores(document.querySelectorAll('.mock-num'));

    // Barra del mock
    setTimeout(() => {
        const bar = document.querySelector('.mock-bar');
        if (bar) bar.style.width = bar.dataset.width || '75%';
    }, 500);
}

function animarContadores(elementos) {
    elementos.forEach(el => {
        const target = parseInt(el.dataset.target);
        if (!target || el.dataset.animado === 'true') return;
        el.dataset.animado = 'true';

        let start = 0;
        const duration = 1800;
        const step = Math.ceil(target / (duration / 16));

        const timer = setInterval(() => {
            start = Math.min(start + step, target);
            el.textContent = target > 100 ? start.toLocaleString() : start;
            if (start >= target) clearInterval(timer);
        }, 16);
    });
}

// ===== TOAST =====
function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensaje;
    toast.style.background = tipo === 'success' ? '#28a745' : tipo === 'error' ? '#BF1120' : '#034C8C';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== INTERSECTION OBSERVER para animaciones al scroll =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.feature-card, .stat-card, .team-card, .galeria-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});
