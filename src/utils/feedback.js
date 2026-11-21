// Reemplazo de alert() / confirm() / prompt() nativos.
// Los diálogos nativos sacan al navegador de pantalla completa; estos se
// dibujan dentro de la página (ver components/FeedbackHost.jsx).

let host = null;
const pendientes = [];

export function registrarHost(api) {
    host = api;
    while (pendientes.length) pendientes.shift()(host);
}

function conHost(fn) {
    if (host) fn(host);
    else pendientes.push(fn);
}

const mostrar = (tipo) => (mensaje, duracion) =>
    conHost((h) => h.agregarToast({ tipo, mensaje: String(mensaje ?? ''), duracion }));

export const toast = {
    success: mostrar('success'),
    error: mostrar('error'),
    info: mostrar('info'),
};

// await confirmar('¿Seguro?')  ->  true / false
// opciones: { titulo, textoConfirmar, textoCancelar, peligro }
export function confirmar(mensaje, opciones = {}) {
    return new Promise((resolve) => {
        conHost((h) => h.abrirDialogo({ tipo: 'confirm', mensaje, opciones, resolve }));
    });
}

// await pedirTexto('Nota', { valorInicial: '' })  ->  string / null (cancelado)
export function pedirTexto(mensaje, opciones = {}) {
    return new Promise((resolve) => {
        conHost((h) => h.abrirDialogo({ tipo: 'prompt', mensaje, opciones, resolve }));
    });
}
