import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const inputClass = 'w-full p-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-bold text-sm';

/**
 * Lista editable de opciones (gustos, toppings, aderezos, guarniciones).
 * Enter agrega; si se pegan varias separadas por coma, agrega todas.
 * items: [{ id?, nombre, disponible, precio_extra? }]
 */
const ListaEditable = ({ titulo, items, onChange, conPrecio = false, placeholder }) => {
    const [texto, setTexto] = useState('');

    const agregar = () => {
        const existentes = new Set(items.map(i => i.nombre.trim().toLowerCase()));
        const nuevos = texto.split(/[,\n]/)
            .map(t => t.trim())
            .filter(t => t && !existentes.has(t.toLowerCase()))
            .map(nombre => ({ nombre, disponible: true, ...(conPrecio ? { precio_extra: '' } : {}) }));
        if (nuevos.length) onChange([...items, ...nuevos]);
        setTexto('');
    };

    const setItem = (idx, cambios) => onChange(items.map((it, i) => (i === idx ? { ...it, ...cambios } : it)));

    return (
        <div className="space-y-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {titulo} <span className="text-gray-300">({items.length})</span>
            </p>

            {items.length > 0 && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {items.map((it, idx) => (
                        <div key={it.id || `n-${idx}`} className={`flex items-center gap-2 ${it.disponible ? '' : 'opacity-60'}`}>
                            <input
                                type="text"
                                value={it.nombre}
                                onChange={(e) => setItem(idx, { nombre: e.target.value })}
                                className={`${inputClass} flex-1`}
                                maxLength={80}
                            />
                            {conPrecio && (
                                <div className="relative w-24 shrink-0">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">+$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={it.precio_extra}
                                        onChange={(e) => setItem(idx, { precio_extra: e.target.value })}
                                        className={`${inputClass} pl-7`}
                                        placeholder="0"
                                        title="Precio extra (vacío = sin cargo)"
                                    />
                                </div>
                            )}
                            <label className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 cursor-pointer shrink-0" title="Desmarcá si no hay stock">
                                <input
                                    type="checkbox"
                                    checked={it.disponible}
                                    onChange={(e) => setItem(idx, { disponible: e.target.checked })}
                                    className="accent-green-600"
                                />
                                Hay
                            </label>
                            <button
                                type="button"
                                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                title="Quitar"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                        // Enter agrega a la lista en vez de enviar el formulario del producto
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            agregar();
                        }
                    }}
                    className={inputClass}
                    placeholder={placeholder || 'Escribí y apretá Enter (o pegá varios separados por coma)'}
                />
                <button
                    type="button"
                    onClick={agregar}
                    className="bg-gold-600 text-white px-3 rounded-xl hover:bg-gold-700 active:scale-95 transition-all shrink-0"
                    aria-label={`Agregar a ${titulo}`}
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>
    );
};

export default ListaEditable;
