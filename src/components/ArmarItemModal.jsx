import { useState } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';

const nombresDe = (lista, ids) => lista.filter(o => ids.includes(o.id)).map(o => o.nombre);

/** Lista de opciones con máximo; `unica` = se elige exactamente una (guarnición) */
const Grupo = ({ titulo, regla, opciones, value, onChange, max, unica = false, conPrecio = false }) => {
    const lleno = !unica && value.length >= max;
    const toggle = (id) => {
        if (unica) return onChange([id]);
        if (value.includes(id)) return onChange(value.filter(x => x !== id));
        if (!lleno) onChange([...value, id]);
    };
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{titulo}</p>
                <span className="text-[10px] font-black text-gold-700">{regla}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {opciones.map(o => {
                    const marcada = value.includes(o.id);
                    const deshabilitada = !o.disponible || (!marcada && lleno);
                    return (
                        <button
                            key={o.id}
                            type="button"
                            disabled={deshabilitada}
                            onClick={() => toggle(o.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${marcada ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}
                        >
                            {marcada && <Check size={14} />}
                            {o.nombre}
                            {!o.disponible && <span className="text-[10px] font-black">· sin stock</span>}
                            {conPrecio && o.precio_extra > 0 && <span className="text-[11px] text-gray-400">+${o.precio_extra.toLocaleString()}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

/**
 * Armado de un ítem en la carga manual de pedidos: tamaño de pizza, gustos de helado,
 * guarnición / toppings / aderezos / carne extra de hamburguesa, y aclaración.
 * onAgregar(item) recibe el ítem listo para el pedido.
 */
const ArmarItemModal = ({ product, onAgregar, onClose }) => {
    const [variante, setVariante] = useState('Grande');
    const [gustos, setGustos] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [aderezos, setAderezos] = useState([]);
    const [guarnicion, setGuarnicion] = useState([]);
    const [carnes, setCarnes] = useState(0);
    const [observacion, setObservacion] = useState('');
    const [cantidad, setCantidad] = useState(1);

    const { tipo } = product;
    const pizza = product.pizza;
    const helado = product.helado;
    const burger = product.hamburguesa;

    let precio = Number(product.precio);
    let faltante = null;
    const detalleTexto = [];
    if (tipo === 'PIZZA') {
        precio = variante === 'Chica' ? pizza.precio_chica : pizza.precio_grande;
    } else if (tipo === 'HELADO') {
        if (gustos.length < 1) faltante = 'Elegí al menos un gusto';
        if (gustos.length) detalleTexto.push(`Gustos: ${nombresDe(helado.gustos, gustos).join(', ')}`);
    } else if (tipo === 'HAMBURGUESA') {
        const g = burger.guarniciones.find(o => o.id === guarnicion[0]);
        precio += (g?.precio_extra || 0) + carnes * burger.precio_carne_extra;
        if (burger.guarniciones.length > 0 && !g) faltante = 'Elegí la guarnición';
        if (g) detalleTexto.push(`Guarnición: ${g.nombre}`);
        if (toppings.length) detalleTexto.push(`Toppings: ${nombresDe(burger.toppings, toppings).join(', ')}`);
        if (aderezos.length) detalleTexto.push(`Aderezos: ${nombresDe(burger.aderezos, aderezos).join(', ')}`);
        if (carnes > 0) detalleTexto.push(`Carne extra: +${carnes}`);
    }
    precio = Math.round(precio * 100) / 100;

    const agregar = () => {
        if (faltante) return;
        const obs = observacion.trim().slice(0, 150);
        const esPizzaConTamano = tipo === 'PIZZA' && pizza?.precio_chica != null;
        onAgregar({
            key: [
                product.id_producto,
                esPizzaConTamano ? variante : '',
                [...gustos].sort().join('.'),
                guarnicion.join(''),
                [...toppings].sort().join('.'),
                [...aderezos].sort().join('.'),
                carnes,
                obs.toLowerCase()
            ].join('|'),
            id_producto: product.id_producto,
            nombre: product.nombre,
            precio,
            cantidad,
            variante: esPizzaConTamano ? variante : null,
            gustos: tipo === 'HELADO' ? gustos : undefined,
            toppings: tipo === 'HAMBURGUESA' ? toppings : undefined,
            aderezos: tipo === 'HAMBURGUESA' ? aderezos : undefined,
            guarnicion: tipo === 'HAMBURGUESA' ? (guarnicion[0] ?? null) : undefined,
            carnes_extra: tipo === 'HAMBURGUESA' ? carnes : undefined,
            observacion: obs || undefined,
            detalleTexto
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4 shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{product.nombre}</h3>
                        {product.descripcion && <p className="text-xs text-gray-400 font-bold mt-1 line-clamp-2">{product.descripcion}</p>}
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {tipo === 'PIZZA' && pizza?.precio_chica != null && (
                        <div className="grid grid-cols-2 gap-2">
                            {[['Chica', pizza.precio_chica], ['Grande', pizza.precio_grande]].map(([t, p]) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setVariante(t)}
                                    className={`p-4 rounded-2xl border-2 font-black transition-all ${variante === t ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-gray-100 text-gray-500'}`}
                                >
                                    {t} · ${p.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    )}

                    {tipo === 'HELADO' && (
                        <Grupo titulo="Gustos" regla={`${gustos.length}/${helado.max_gustos}`} opciones={helado.gustos} value={gustos} onChange={setGustos} max={helado.max_gustos} />
                    )}

                    {tipo === 'HAMBURGUESA' && (
                        <>
                            {burger.guarniciones.length > 0 && (
                                <Grupo titulo="Guarnición" regla="Obligatorio · 1" opciones={burger.guarniciones} value={guarnicion} onChange={setGuarnicion} unica conPrecio />
                            )}
                            {burger.toppings.length > 0 && burger.max_toppings > 0 && (
                                <Grupo titulo="Toppings" regla={`${toppings.length}/${burger.max_toppings}`} opciones={burger.toppings} value={toppings} onChange={setToppings} max={burger.max_toppings} />
                            )}
                            {burger.aderezos.length > 0 && burger.max_aderezos > 0 && (
                                <Grupo titulo="Aderezos" regla={`${aderezos.length}/${burger.max_aderezos}`} opciones={burger.aderezos} value={aderezos} onChange={setAderezos} max={burger.max_aderezos} />
                            )}
                            {burger.max_carnes_extra > 0 && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Carne extra</p>
                                        <p className="text-[11px] text-gray-400 font-bold">+${burger.precio_carne_extra.toLocaleString()} c/u · hasta {burger.max_carnes_extra}</p>
                                    </div>
                                    <div className="flex items-center bg-gray-100 rounded-xl">
                                        <button type="button" onClick={() => setCarnes(c => Math.max(0, c - 1))} className="p-3 text-gray-600"><Minus size={16} /></button>
                                        <span className="font-black w-8 text-center">+{carnes}</span>
                                        <button type="button" onClick={() => setCarnes(c => Math.min(burger.max_carnes_extra, c + 1))} className="p-3 text-gray-600"><Plus size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Aclaración (opcional)</p>
                        <input
                            type="text"
                            maxLength={150}
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            placeholder="Ej: sin rúcula"
                            className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-bold text-sm"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center gap-3 shrink-0">
                    <div className="flex items-center bg-gray-100 rounded-xl">
                        <button type="button" onClick={() => setCantidad(c => Math.max(1, c - 1))} className="p-3 text-gray-600"><Minus size={16} /></button>
                        <span className="font-black w-6 text-center">{cantidad}</span>
                        <button type="button" onClick={() => setCantidad(c => Math.min(99, c + 1))} className="p-3 text-gray-600"><Plus size={16} /></button>
                    </div>
                    <button
                        type="button"
                        onClick={agregar}
                        disabled={!!faltante}
                        className="flex-1 py-3.5 rounded-2xl font-black bg-gold-600 text-white hover:bg-gold-700 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {faltante || `Agregar · $${(precio * cantidad).toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArmarItemModal;
