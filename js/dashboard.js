
function verificarSesionDashboard(rolEsperado = null) {
    
    const sesion = JSON.parse(localStorage.getItem('eduspace_sesion') || 'null');

    if (!sesion) {
        
        window.location.href = 'index.html';
        return null;
    }

    if (rolEsperado && sesion.rol !== rolEsperado) {
        
        
        alert('No tienes permiso para acceder a esta página.');
        window.location.href = 'index.html';
        return null;
    }

    return sesion; 
}






function cerrarSesion() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
        localStorage.removeItem('eduspace_sesion');
        window.location.href = 'index.html';
    }
}











function mostrarToastDash(mensaje, tipo = 'info') {
    const toast = document.getElementById('toastDash');
    if (!toast) return; 

    toast.textContent = mensaje;

    
    const colores = { success: '#28a745', error: '#BF1120', info: '#034C8C' };
    toast.style.background = colores[tipo] || colores.info;

    
    toast.classList.add('show');

    
    setTimeout(() => toast.classList.remove('show'), 3500);
}











function cerrarModalExtra(event, modalId) {
    
    
    if (event.target.id === modalId) {
        document.getElementById(modalId).classList.remove('abierto');
    }
}








function obtenerDatos(clave) {
    return JSON.parse(localStorage.getItem(clave) || '[]');
}


function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}












function textoBadge(tipo, valor) {
    const mapas = {
        pago:    { al_dia: '✅ Al día', mora: '⚠️ Mora', pendiente: '🕐 Pendiente', pagado: '✅ Pagado' },
        reporte: { pendiente: '🕐 Pendiente', resuelto: '✅ Resuelto' },
        hab:     { ocupada: '🔴 Ocupada', disponible: '🟢 Disponible', mantenimiento: '🟡 Mantenimiento' }
    };
    
    return mapas[tipo]?.[valor] || valor;
}
