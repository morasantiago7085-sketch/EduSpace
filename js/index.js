
function navegar(idSeccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const seccion = document.getElementById(idSeccion);
    if (seccion) seccion.classList.add('activa');

    const link = document.querySelector(`[data-page="${idSeccion}"]`);
    if (link) link.classList.add('active');

    
    document.getElementById('navLinks').classList.remove('open');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    
    if (idSeccion === 'inicio') iniciarContadores();

    
    if (idSeccion === 'inmuebles') cargarInmueblesPublicos();

    
    history.pushState(null, '', '#' + idSeccion);
}




function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}




window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});




function abrirModal(tipo = 'login') {
    document.getElementById('authModal').classList.add('abierto');
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
    const formLogin    = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');
    const tabLogin     = document.getElementById('tab-login');
    const tabRegistro  = document.getElementById('tab-registro');

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
    ['login-error', 'login-success', 'reg-error', 'reg-success'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}



function togglePass(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}





function dashboardPorRol(rol) {
    const rutas = {
        admin:        'dashboard_admin.html',
        arrendatario: 'dashboard_arrendatario.html',
        estudiante:   'dashboard_estudiante.html',
        tecnico:      'dashboard_tecnico.html'
    };
    
    return rutas[rol] || 'index.html';
}



document.addEventListener('DOMContentLoaded', () => {

    
    
    
    
    
    
    
    
    
    const usuariosDemo = [
        { id: 1, nombre: 'Admin EduSpace',      email: 'admin@demo.com',        password: 'demo123', rol: 'admin',        tel: '+57 310 000 001', fecha: '01/01/2025' },
        { id: 2, nombre: 'Carlos Arrendatario', email: 'arrendatario@demo.com', password: 'demo123', rol: 'arrendatario', tel: '+57 310 000 002', fecha: '01/01/2025' },
        { id: 3, nombre: 'María Estudiante',    email: 'estudiante@demo.com',   password: 'demo123', rol: 'estudiante',   tel: '+57 310 000 003', fecha: '01/01/2025' },
        { id: 4, nombre: 'Juan Técnico',        email: 'tecnico@demo.com',      password: 'demo123', rol: 'tecnico',      tel: '+57 310 000 004', fecha: '01/01/2025' },
    ];

    
    
    const sesionActual = JSON.parse(localStorage.getItem('eduspace_sesion') || 'null');
    if (sesionActual && ['arrendador', 'inquilino'].includes(sesionActual.rol)) {
        localStorage.removeItem('eduspace_sesion');
    }

    const usuariosGuardados = JSON.parse(localStorage.getItem('eduspace_usuarios') || '[]');

    
    
    const usuariosLimpios = usuariosGuardados.filter(u =>
        !['arrendador', 'inquilino'].includes(u.rol) &&
        !usuariosDemo.find(d => d.id === u.id)
    );

    
    const usuariosFinales = [...usuariosDemo, ...usuariosLimpios];
    localStorage.setItem('eduspace_usuarios', JSON.stringify(usuariosFinales));

    
    const regPass = document.getElementById('reg-pass');
    if (regPass) {
        regPass.addEventListener('input', function () {
            const val = this.value;
            const strength = document.getElementById('passStrength');
            let score = 0;

            if (val.length >= 6)           score++; 
            if (val.length >= 10)          score++; 
            if (/[A-Z]/.test(val))         score++; 
            if (/[0-9]/.test(val))         score++; 
            if (/[^a-zA-Z0-9]/.test(val)) score++; 

            let color, width;
            if (score <= 1)      { color = '#BF1120'; width = '20%'; }  
            else if (score <= 3) { color = '#F2AB27'; width = '60%'; }  
            else                 { color = '#28a745'; width = '100%'; } 

            strength.innerHTML = `<div style="width:${width}; background:${color}; height:100%;"></div>`;
        });
    }

    
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        navegar(hash);
    } else {
        iniciarContadores();
    }

    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .stat-card, .team-card, .inmuebles-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    verificarSesion();
});



function handleLogin(event) {
    event.preventDefault();

    const email     = document.getElementById('login-email').value.trim();
    const pass      = document.getElementById('login-pass').value;
    const errorEl   = document.getElementById('login-error');
    const successEl = document.getElementById('login-success');

    const usuarios = JSON.parse(localStorage.getItem('eduspace_usuarios') || '[]');
    const usuario  = usuarios.find(u => u.email === email && u.password === pass);

    if (!usuario) {
        mostrarMsg(errorEl, '❌ Correo o contraseña incorrectos.');
        return;
    }

    
    
    
    

    
    localStorage.setItem('eduspace_sesion', JSON.stringify({
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol
    }));

    mostrarMsg(successEl, `✅ ¡Bienvenido, ${usuario.nombre}! Redirigiendo...`);

    
    setTimeout(() => {
        window.location.href = dashboardPorRol(usuario.rol);
    }, 1200);
}





function handleRegistro(event) {
    event.preventDefault();

    const nombre    = document.getElementById('reg-nombre').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const pass      = document.getElementById('reg-pass').value;
    const rol       = document.getElementById('reg-rol').value;
    const tel       = document.getElementById('reg-tel').value;
    const errorEl   = document.getElementById('reg-error');
    const successEl = document.getElementById('reg-success');

    if (pass.length < 6) {
        mostrarMsg(errorEl, '❌ La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    
    
    const rolesPermitidos = ['estudiante', 'arrendatario'];
    if (!rolesPermitidos.includes(rol)) {
        mostrarMsg(errorEl, '❌ Este rol no puede registrarse aquí. Contacta al administrador.');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('eduspace_usuarios') || '[]');

    if (usuarios.find(u => u.email === email)) {
        mostrarMsg(errorEl, '❌ Este correo ya está registrado. Inicia sesión.');
        return;
    }

    const nuevoUsuario = {
        id:       Date.now(),
        nombre,
        email,
        password: pass,
        rol,       
        tel,
        fecha: new Date().toLocaleDateString('es-CO')
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('eduspace_usuarios', JSON.stringify(usuarios));

    
    localStorage.setItem('eduspace_sesion', JSON.stringify({
        id:     nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email:  nuevoUsuario.email,
        rol:    nuevoUsuario.rol
    }));

    mostrarMsg(successEl, `🎉 ¡Cuenta creada! Redirigiendo a tu panel...`);
    document.getElementById('form-registro').reset();

    setTimeout(() => {
        window.location.href = dashboardPorRol(nuevoUsuario.rol);
    }, 1200);
}



function mostrarMsg(el, texto) {
    el.textContent = texto;
    el.style.display = 'block';
}




function verificarSesion() {
    const sesion = JSON.parse(localStorage.getItem('eduspace_sesion') || 'null');
    if (!sesion) return;

    const destino = dashboardPorRol(sesion.rol);

    const btnLogin = document.querySelector('.btn-login');
    if (btnLogin) {
        btnLogin.textContent = 'Mi Panel →';
        btnLogin.onclick = () => window.location.href = destino;
    }

    const btnReg = document.querySelector('.btn-registro');
    if (btnReg) {
        btnReg.textContent = `👤 ${sesion.nombre.split(' ')[0]}`;
        btnReg.onclick = () => window.location.href = destino;
    }
}



function iniciarContadores() {
    animarContadores(document.querySelectorAll('.counter'));
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



function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensaje;
    const colores = { success: '#28a745', error: '#BF1120', info: '#034C8C' };
    toast.style.background = colores[tipo] || colores.info;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}



function enviarContacto(event) {
    event.preventDefault();
    const nombre = document.getElementById('cont-nombre').value.trim();
    const correo = document.getElementById('cont-correo').value.trim();
    const successEl = document.getElementById('cont-success');
    successEl.textContent = `✅ ¡Gracias, ${nombre}! Tu mensaje fue enviado. Te contactaremos a ${correo} pronto.`;
    successEl.style.display = 'block';
    document.getElementById('contactoForm').reset();
    setTimeout(() => { successEl.style.display = 'none'; }, 5000);
}





function cargarInmueblesPublicos() {
    const grid = document.getElementById('inmueblesGrid');
    if (!grid) return;

    
    const inmuebles = JSON.parse(localStorage.getItem('eduspace_inmuebles') || '[]');

    if (inmuebles.length === 0) {
        
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--texto-suave);">
                <div style="font-size:3rem; margin-bottom:16px">🏘️</div>
                <h3 style="font-weight:700; margin-bottom:8px; color:var(--texto)">Próximamente</h3>
                <p>Los arrendatarios están publicando sus espacios. ¡Vuelve pronto!</p>
            </div>`;
        return;
    }

    
    const emojis = { 'Casa': '🏠', 'Apartamento': '🏢', 'Habitación': '🛏️' };

    
    const badgeClase = {
        'disponible':   'disponible',
        'ocupado':      'ocupada',
        'mantenimiento':'mantenimiento'
    };
    const badgeTexto = {
        'disponible':    '🟢 Disponible',
        'ocupado':       '🔴 Ocupado',
        'mantenimiento': '🟡 Mantenimiento'
    };

    
    grid.innerHTML = inmuebles.map(inm => {
        const emoji    = emojis[inm.tipo] || '🏠';
        const badge    = badgeClase[inm.disponible] || 'disponible';
        const badgeTxt = badgeTexto[inm.disponible] || '🟢 Disponible';
        const precio   = inm.precio
            ? '$' + parseInt(inm.precio).toLocaleString('es-CO') + '/mes'
            : 'Consultar';
        const ocupado  = inm.disponible === 'ocupado';

        return `
        <div class="inmuebles-card">
            <div class="inmuebles-img" style="background:var(--gris); overflow:hidden; position:relative;">
                ${inm.foto
                    ? `<img src="${inm.foto}" alt="${inm.nombre}"
                            style="width:100%; height:100%; object-fit:cover; display:block;">`
                    : `<span class="inmuebles-emoji">${emoji}</span>`
                }
                <span class="inmuebles-badge ${badge}">${badgeTxt}</span>
            </div>
            <div class="inmuebles-info">
                <h3>${inm.nombre}</h3>
                <p>${inm.descripcion || 'Sin descripción disponible.'}</p>
                <div class="inmuebles-tags" id="tags-${inm.id || idx}"></div>
                <div class="inmuebles-footer">
                    <span class="precio">${precio}</span>
                    <button class="btn-ver ${ocupado ? 'ocupado' : ''}"
                        onclick="${ocupado ? '' : "abrirModal('login')"}"
                        ${ocupado ? 'disabled' : ''}>
                        ${ocupado ? 'No disponible' : 'Ver más →'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');

    
    
    
    
    
    inmuebles.forEach((inm, idx) => {
        const contenedor = document.getElementById(`tags-${inm.id || idx}`);
        if (!contenedor) return;

        
        const tags = [
            inm.tipo         ? `📋 ${inm.tipo}`                    : null,
            inm.ciudad       ? `📍 ${inm.ciudad}`                  : null,
            inm.barrio       ? `🏙️ ${inm.barrio}`                  : null,
            inm.habitaciones ? `🛏️ ${inm.habitaciones} hab.`       : null,
        ].filter(Boolean); 

        tags.forEach(texto => {
            
            const span = document.createElement('span');

            
            span.textContent = texto;

            
            
            contenedor.appendChild(span);
        });
    });
}
