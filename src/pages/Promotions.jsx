import { useState, useEffect, useMemo } from 'react';
import {
    Percent,
    Plus,
    X,
    Edit2,
    Trash2,
    Check,
    AlertCircle,
    CalendarDays,
    Search,
    Pause,
    Play,
    Tag
} from 'lucide-react';
import api from '../api/axiosConfig';

const TZ = 'America/Argentina/Buenos_Aires';
const hoyAR = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const formatFecha = (ymd) => {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
};

const ESTADOS = {
    vigente: { label: 'Vigente', clase: 'bg-green-50 text-green-700 border-green-200', borde: 'border-t-green-500' },
    programada: { label: 'Programada', clase: 'bg-blue-50 text-blue-700 border-blue-200', borde: 'border-t-blue-400' },
    pausada: { label: 'Pausada', clase: 'bg-amber-50 text-amber-700 border-amber-200', borde: 'border-t-amber-400' },
    vencida: { label: 'Vencida', clase: 'bg-gray-100 text-gray-500 border-gray-200', borde: 'border-t-gray-300' }
};

const PRESETS_NXM = [
    { label: '2x1', lleva: 2, paga: 1 },
    { label: '3x2', lleva: 3, paga: 2 },
    { label: 'Otra', lleva: null, paga: null }
];

const tituloPromo = (p) => (p.tipo === 'PORCENTAJE' ? `${Number(p.porcentaje)}% OFF` : `${p.lleva}x${p.paga}`);

const formVacio = () => ({
    nombre: '',
    tipo: 'PORCENTAJE',
    porcentaje: '',
    lleva: 2,
    paga: 1,
    aplica_a: 'TODOS',
    producto_ids: [],
    fecha_desde: hoyAR(),
    fecha_hasta: '',
    sinFin: true
});

const Promotions = () => {
    const [promos, setPromos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(formVacio());
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('');

    const cargar = async () => {
        try {
            setLoading(true);
            const [resPromos, resProductos] = await Promise.all([api.get('/promociones/gestion'), api.get('/productos')]);
            setPromos(resPromos.data);
            setProductos(resProductos.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar promociones:', err);
            setError('No se pudieron cargar las promociones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargar(); }, []);

    const nombreProducto = useMemo(() => new Map(productos.map(p => [p.id_producto, p.nombre])), [productos]);
    const categorias = useMemo(() => [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort(), [productos]);

    const productosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return productos.filter(p =>
            (!categoria || p.categoria === categoria) && (!q || p.nombre.toLowerCase().includes(q)));
    }, [productos, busqueda, categoria]);

    const abrirNueva = () => {
        setEditing(null);
        setForm(formVacio());
        setFormError('');
        setBusqueda('');
        setCategoria('');
        setShowModal(true);
    };

    const abrirEditar = (p) => {
        setEditing(p);
        setForm({
            nombre: p.nombre,
            tipo: p.tipo,
            porcentaje: p.porcentaje ?? '',
            lleva: p.lleva ?? 2,
            paga: p.paga ?? 1,
            aplica_a: p.aplica_a,
            producto_ids: p.producto_ids || [],
            fecha_desde: p.fecha_desde,
            fecha_hasta: p.fecha_hasta || '',
            sinFin: !p.fecha_hasta
        });
        setFormError('');
        setBusqueda('');
        setCategoria('');
        setShowModal(true);
    };

    const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

    const toggleProducto = (id) => setForm(f => ({
        ...f,
        producto_ids: f.producto_ids.includes(id) ? f.producto_ids.filter(x => x !== id) : [...f.producto_ids, id]
    }));

    // Nombre sugerido si el local no escribe uno
    const nombreAutomatico = () => {
        const base = form.tipo === 'PORCENTAJE' ? `${form.porcentaje}% OFF` : `${form.lleva}x${form.paga}`;
        return form.aplica_a === 'TODOS' ? `${base} en todo el menú` : base;
    };

    const guardar = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setFormError('');

        if (form.tipo === 'PORCENTAJE' && !(Number(form.porcentaje) > 0 && Number(form.porcentaje) <= 90)) {
            return setFormError('El descuento tiene que estar entre 1% y 90%.');
        }
        if (form.tipo === 'NXM' && !(form.paga >= 1 && form.paga < form.lleva)) {
            return setFormError('"Pagá" tiene que ser menor que "llevá".');
        }
        if (form.aplica_a === 'SELECCION' && form.producto_ids.length === 0) {
            return setFormError('Elegí al menos un producto.');
        }
        if (!form.fecha_desde) return setFormError('Poné la fecha de inicio.');
        if (!form.sinFin && !form.fecha_hasta) return setFormError('Poné la fecha de fin o elegí "Sin fecha de fin".');
        if (!form.sinFin && form.fecha_hasta < form.fecha_desde) return setFormError('La fecha de fin no puede ser anterior al inicio.');

        const body = {
            nombre: form.nombre.trim() || nombreAutomatico(),
            tipo: form.tipo,
            porcentaje: form.tipo === 'PORCENTAJE' ? Number(form.porcentaje) : null,
            lleva: form.tipo === 'NXM' ? Number(form.lleva) : null,
            paga: form.tipo === 'NXM' ? Number(form.paga) : null,
            aplica_a: form.aplica_a,
            producto_ids: form.aplica_a === 'SELECCION' ? form.producto_ids : [],
            fecha_desde: form.fecha_desde,
            fecha_hasta: form.sinFin ? null : form.fecha_hasta,
            activa: editing ? editing.activa : true
        };

        setIsSubmitting(true);
        try {
            if (editing) await api.put(`/promociones/${editing.id_promocion}`, body);
            else await api.post('/promociones', body);
            setShowModal(false);
            cargar();
        } catch (err) {
            console.error('Error al guardar promoción:', err);
            setFormError(err.response?.data?.message || 'No se pudo guardar la promoción.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const alternarPausa = async (p) => {
        try {
            await api.put(`/promociones/${p.id_promocion}/activa`, { activa: !p.activa });
            cargar();
        } catch (err) {
            console.error('Error al pausar promoción:', err);
            alert('No se pudo cambiar el estado de la promoción.');
        }
    };

    const eliminar = async (p) => {
        if (!window.confirm(`¿Eliminar la promoción "${p.nombre}"? Los pedidos anteriores conservan su descuento.`)) return;
        try {
            await api.delete(`/promociones/${p.id_promocion}`);
            cargar();
        } catch (err) {
            console.error('Error al eliminar promoción:', err);
            alert('No se pudo eliminar la promoción.');
        }
    };

    const resumenAlcance = (p) => {
        if (p.aplica_a === 'TODOS') return 'Todos los productos';
        const nombres = (p.producto_ids || []).map(id => nombreProducto.get(id)).filter(Boolean);
        if (nombres.length === 0) return 'Productos que ya no existen';
        return nombres.length <= 3 ? nombres.join(', ') : `${nombres.slice(0, 3).join(', ')} y ${nombres.length - 3} más`;
    };

    const inputClase = 'w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none font-bold';
    const etiquetaClase = 'text-xs font-black text-gray-400 uppercase tracking-wider';
    const chip = (activo) => `px-4 py-3 rounded-2xl text-sm font-black transition-all ${
        activo ? 'bg-gold-600 text-white shadow-lg shadow-gold-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`;

    return (
        <div className="max-w-7xl mx-auto space-y-5 md:space-y-8 pb-10">
            <header className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">
                        <span className="text-gold-600">Promociones</span> y descuentos
                    </h1>
                    <p className="text-gray-500 font-medium">Descuentos por porcentaje, 2x1, 3x2 y más, con fechas de vigencia</p>
                </div>
                <button
                    onClick={abrirNueva}
                    className="flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-[2rem] font-black shadow-xl shadow-gold-100 transition-all hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wider"
                >
                    <Plus size={18} /> Nueva promoción
                </button>
            </header>

            {error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-start gap-4 text-red-800">
                    <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-sm uppercase tracking-widest">Error al cargar datos</p>
                        <p className="text-xs font-bold text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-32 text-center text-gray-400">
                    <div className="animate-bounce mb-4 text-gold-500"><Percent size={40} className="mx-auto" /></div>
                    <p className="font-black uppercase tracking-widest text-sm">Cargando promociones...</p>
                </div>
            ) : promos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    {promos.map((p) => {
                        const estado = ESTADOS[p.estado] || ESTADOS.vigente;
                        return (
                            <div
                                key={p.id_promocion}
                                className={`bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 border-t-8 ${estado.borde}`}
                            >
                                <div className="p-5 md:p-8 flex-1 space-y-4">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <span className="text-3xl md:text-4xl font-black text-gold-600 tracking-tight">{tituloPromo(p)}</span>
                                            <h3 className="font-black text-gray-800 text-base md:text-lg leading-tight mt-1 break-words">{p.nombre}</h3>
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${estado.clase}`}>
                                            {estado.label}
                                        </span>
                                    </div>

                                    <div className="space-y-3 bg-gray-50/50 p-4 rounded-[1.5rem] border border-gray-100/50 text-sm font-bold text-gray-600">
                                        <div className="flex items-start gap-3">
                                            <Tag size={16} className="text-gold-500 shrink-0 mt-0.5" />
                                            <span>{resumenAlcance(p)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 border-t border-gray-100/60 pt-3">
                                            <CalendarDays size={16} className="text-gold-500 shrink-0" />
                                            <span>
                                                {p.fecha_hasta
                                                    ? `${formatFecha(p.fecha_desde)} al ${formatFecha(p.fecha_hasta)}`
                                                    : `Desde el ${formatFecha(p.fecha_desde)}, sin fecha de fin`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 bg-gray-50/30 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => abrirEditar(p)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button
                                        onClick={() => alternarPausa(p)}
                                        title={p.activa ? 'Pausar' : 'Reanudar'}
                                        aria-label={p.activa ? 'Pausar promoción' : 'Reanudar promoción'}
                                        className="px-4 flex items-center justify-center rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all active:scale-95"
                                    >
                                        {p.activa ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <button
                                        onClick={() => eliminar(p)}
                                        title="Eliminar"
                                        aria-label="Eliminar promoción"
                                        className="px-4 flex items-center justify-center rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all active:scale-95"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-16 md:py-32 px-4 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                    <Percent size={64} className="mx-auto text-gray-200 mb-6" />
                    <h4 className="text-xl font-black text-gray-400 uppercase tracking-widest">Todavía no tenés promociones</h4>
                    <p className="text-gray-400 font-bold text-sm">Creá un descuento o un 2x1 y se muestra solo en tu tienda</p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto border border-white/20">
                        <div className="bg-gold-600 p-5 sm:p-8 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Percent size={24} /></div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black">{editing ? 'Editar promoción' : 'Nueva promoción'}</h2>
                                    <p className="text-gold-100 text-xs font-bold opacity-80 uppercase tracking-widest">Descuento, productos y fechas</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} aria-label="Cerrar" className="bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all"><X size={24} /></button>
                        </div>

                        <form onSubmit={guardar} className="p-5 sm:p-8 space-y-6">
                            {/* Tipo */}
                            <div className="space-y-2">
                                <label className={etiquetaClase}>Tipo de promoción</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => set('tipo', 'PORCENTAJE')} className={`${chip(form.tipo === 'PORCENTAJE')} flex-1`}>% de descuento</button>
                                    <button type="button" onClick={() => set('tipo', 'NXM')} className={`${chip(form.tipo === 'NXM')} flex-1`}>2x1, 3x2…</button>
                                </div>
                            </div>

                            {form.tipo === 'PORCENTAJE' ? (
                                <div className="space-y-2">
                                    <label className={etiquetaClase}>Porcentaje de descuento</label>
                                    <div className="relative">
                                        <input
                                            type="number" min="1" max="90" step="0.5" inputMode="decimal"
                                            placeholder="Ej. 5"
                                            className={`${inputClase} pr-12`}
                                            value={form.porcentaje}
                                            onChange={(e) => set('porcentaje', e.target.value)}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className={etiquetaClase}>Cantidad</label>
                                    <div className="flex gap-2">
                                        {PRESETS_NXM.map(pr => {
                                            const activo = pr.lleva
                                                ? form.lleva === pr.lleva && form.paga === pr.paga
                                                : !PRESETS_NXM.some(o => o.lleva && o.lleva === form.lleva && o.paga === form.paga);
                                            return (
                                                <button
                                                    key={pr.label} type="button"
                                                    onClick={() => pr.lleva ? setForm(f => ({ ...f, lleva: pr.lleva, paga: pr.paga })) : setForm(f => ({ ...f, lleva: 4, paga: 3 }))}
                                                    className={`${chip(activo)} flex-1`}
                                                >
                                                    {pr.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <span>Llevá</span>
                                        <input
                                            type="number" min="2" max="10" inputMode="numeric"
                                            className="w-20 p-3 bg-gray-100 rounded-2xl text-center font-black outline-none focus:ring-2 focus:ring-gold-500"
                                            value={form.lleva}
                                            onChange={(e) => set('lleva', Number(e.target.value))}
                                        />
                                        <span>y pagá</span>
                                        <input
                                            type="number" min="1" max="9" inputMode="numeric"
                                            className="w-20 p-3 bg-gray-100 rounded-2xl text-center font-black outline-none focus:ring-2 focus:ring-gold-500"
                                            value={form.paga}
                                            onChange={(e) => set('paga', Number(e.target.value))}
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400">Cuenta unidades del mismo producto. La más barata es la que sale gratis.</p>
                                </div>
                            )}

                            {/* Alcance */}
                            <div className="space-y-2">
                                <label className={etiquetaClase}>Aplica a</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => set('aplica_a', 'TODOS')} className={`${chip(form.aplica_a === 'TODOS')} flex-1`}>Todos los productos</button>
                                    <button type="button" onClick={() => set('aplica_a', 'SELECCION')} className={`${chip(form.aplica_a === 'SELECCION')} flex-1`}>Elegir productos</button>
                                </div>
                            </div>

                            {form.aplica_a === 'SELECCION' && (
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex-1">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="search" placeholder="Buscar producto"
                                                className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold-500 font-bold text-sm"
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="px-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold-500 font-bold text-sm"
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400">
                                        <span>{form.producto_ids.length} seleccionados</span>
                                        <span className="flex gap-4">
                                            <button type="button" className="text-gold-600 hover:underline"
                                                onClick={() => setForm(f => ({ ...f, producto_ids: [...new Set([...f.producto_ids, ...productosFiltrados.map(p => p.id_producto)])] }))}>
                                                Marcar los de la lista
                                            </button>
                                            <button type="button" className="text-gray-500 hover:underline" onClick={() => set('producto_ids', [])}>Quitar todos</button>
                                        </span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-100 divide-y divide-gray-50">
                                        {productosFiltrados.length === 0 ? (
                                            <p className="p-6 text-center text-sm font-bold text-gray-400">No hay productos para mostrar</p>
                                        ) : productosFiltrados.map(prod => (
                                            <label key={prod.id_producto} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                                                    checked={form.producto_ids.includes(prod.id_producto)}
                                                    onChange={() => toggleProducto(prod.id_producto)}
                                                />
                                                <span className="flex-1 font-bold text-sm text-gray-700">{prod.nombre}</span>
                                                {prod.categoria && <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{prod.categoria}</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fechas */}
                            <div className="space-y-3">
                                <label className={etiquetaClase}>Vigencia</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-gray-500">Desde</span>
                                        <input type="date" className={inputClase} value={form.fecha_desde} onChange={(e) => set('fecha_desde', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-gray-500">Hasta (inclusive)</span>
                                        <input
                                            type="date" className={`${inputClase} disabled:opacity-40`}
                                            disabled={form.sinFin} min={form.fecha_desde}
                                            value={form.fecha_hasta}
                                            onChange={(e) => set('fecha_hasta', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                                        checked={form.sinFin}
                                        onChange={(e) => set('sinFin', e.target.checked)}
                                    />
                                    <span className="text-sm font-bold text-gray-700">Sin fecha de fin (la pausás cuando quieras)</span>
                                </label>
                            </div>

                            {/* Nombre */}
                            <div className="space-y-2">
                                <label className={etiquetaClase}>Nombre (opcional)</label>
                                <input
                                    type="text" maxLength={100}
                                    placeholder={`Ej. ${form.tipo === 'PORCENTAJE' ? 'Semana de la pizza' : 'Martes de 2x1'}`}
                                    className={inputClase}
                                    value={form.nombre}
                                    onChange={(e) => set('nombre', e.target.value)}
                                />
                                <p className="text-xs font-bold text-gray-400">Es el que ven tus clientes en la tienda y en el pedido.</p>
                            </div>

                            {formError && (
                                <div role="alert" className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-700 text-sm font-bold">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> {formError}
                                </div>
                            )}

                            <button
                                type="submit" disabled={isSubmitting}
                                className="w-full py-4 bg-gold-600 hover:bg-gold-700 disabled:opacity-60 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-gold-100 flex items-center justify-center gap-2"
                            >
                                <Check size={20} /> {isSubmitting ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Crear promoción')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;
