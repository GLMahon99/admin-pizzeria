import { useCallback, useEffect, useRef, useState } from 'react';
import { registrarHost } from '../utils/feedback';

const ESTILOS = {
    success: { barra: 'bg-emerald-500', icono: '✓', texto: 'text-emerald-600' },
    error: { barra: 'bg-red-500', icono: '!', texto: 'text-red-600' },
    info: { barra: 'bg-slate-700', icono: 'i', texto: 'text-slate-700' },
};

function Toast({ toast, onCerrar }) {
    const e = ESTILOS[toast.tipo] || ESTILOS.info;
    return (
        <div
            role={toast.tipo === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex items-start gap-3 w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200"
        >
            <div className={`${e.barra} w-1.5 self-stretch shrink-0`} />
            <span className={`mt-3 w-5 h-5 shrink-0 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold ${e.texto}`}>
                {e.icono}
            </span>
            <p className="flex-1 py-3 text-sm text-slate-800 whitespace-pre-line break-words">{toast.mensaje}</p>
            <button
                type="button"
                onClick={onCerrar}
                aria-label="Cerrar aviso"
                className="p-3 text-slate-400 hover:text-slate-700 text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
}

function Dialogo({ dialogo, onCerrar }) {
    const { tipo, mensaje, opciones = {} } = dialogo;
    const [valor, setValor] = useState(opciones.valorInicial ?? '');
    const inputRef = useRef(null);
    const confirmarRef = useRef(null);

    useEffect(() => {
        (tipo === 'prompt' ? inputRef : confirmarRef).current?.focus();
    }, [tipo]);

    const aceptar = () => onCerrar(tipo === 'prompt' ? valor : true);
    const cancelar = () => onCerrar(tipo === 'prompt' ? null : false);

    useEffect(() => {
        const onKey = (ev) => {
            if (ev.key === 'Escape') cancelar();
            if (ev.key === 'Enter' && tipo === 'confirm') aceptar();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valor]);

    return (
        <div
            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onMouseDown={(ev) => ev.target === ev.currentTarget && cancelar()}
        >
            <div role="dialog" aria-modal="true" className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                {opciones.titulo && <h3 className="text-lg font-bold text-slate-900 mb-2">{opciones.titulo}</h3>}
                <p className="text-sm text-slate-700 whitespace-pre-line break-words">{mensaje}</p>
                {tipo === 'prompt' && (
                    <input
                        ref={inputRef}
                        value={valor}
                        onChange={(ev) => setValor(ev.target.value)}
                        onKeyDown={(ev) => ev.key === 'Enter' && aceptar()}
                        className="mt-4 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                )}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={cancelar}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        {opciones.textoCancelar || 'Cancelar'}
                    </button>
                    <button
                        type="button"
                        ref={confirmarRef}
                        onClick={aceptar}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${opciones.peligro ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        {opciones.textoConfirmar || 'Aceptar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FeedbackHost() {
    const [toasts, setToasts] = useState([]);
    const [dialogos, setDialogos] = useState([]);
    const idRef = useRef(0);

    const quitarToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

    const agregarToast = useCallback((t) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
        const ms = t.duracion ?? (t.tipo === 'error' ? 7000 : 4000);
        setTimeout(() => quitarToast(id), ms);
    }, [quitarToast]);

    const abrirDialogo = useCallback((d) => {
        setDialogos((prev) => [...prev, { ...d, id: ++idRef.current }]);
    }, []);

    useEffect(() => {
        registrarHost({ agregarToast, abrirDialogo });
    }, [agregarToast, abrirDialogo]);

    const dialogoActual = dialogos[0];
    const cerrarDialogo = (resultado) => {
        dialogoActual.resolve(resultado);
        setDialogos((prev) => prev.slice(1));
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-[1100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
                {toasts.map((t) => (
                    <Toast key={t.id} toast={t} onCerrar={() => quitarToast(t.id)} />
                ))}
            </div>
            {dialogoActual && <Dialogo key={dialogoActual.id} dialogo={dialogoActual} onCerrar={cerrarDialogo} />}
        </>
    );
}
