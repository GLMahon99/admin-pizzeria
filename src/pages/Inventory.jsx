import { useState, useEffect } from 'react';
import { Plus, ImagePlus, Utensils, DollarSign, Tag, Trash2, Edit, Save, X, Beaker, IceCream, Beef } from 'lucide-react';
import api from '../api/axiosConfig';
import ListaEditable from '../components/ListaEditable';

// Tipos de producto fijos: cada uno con sus propios campos (ver productoTiposService en el backend)
const TIPOS = [
    { id: 'PIZZA', label: 'Pizza', categoria: 'Pizzas' },
    { id: 'HELADO', label: 'Helado', categoria: 'Helados' },
    { id: 'HAMBURGUESA', label: 'Hamburguesa', categoria: 'Hamburguesas' },
    { id: 'OTRO', label: 'Otro', categoria: '' }
];
const CATEGORIAS_DEFAULT = TIPOS.map(t => t.categoria).filter(Boolean);

// Lista del backend -> estado editable
const listaParaEditar = (lista = [], conPrecio = false) => lista.map(o => ({
    id: o.id,
    nombre: o.nombre,
    disponible: o.disponible,
    ...(conPrecio ? { precio_extra: o.precio_extra ? String(o.precio_extra) : '' } : {})
}));

const CampoPrecio = ({ label, name, value, onChange, required = false }) => (
    <div>
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
                type="number"
                name={name}
                min="0"
                step="0.01"
                required={required}
                value={value}
                className="w-full pl-9 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-black text-gold-600"
                placeholder="0.00"
                onChange={onChange}
            />
        </div>
    </div>
);

const CampoNumero = ({ label, value, onChange, min, max }) => (
    <div>
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <input
            type="number"
            min={min}
            max={max}
            step="1"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-black"
        />
    </div>
);

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

    // Estado para la receta que estamos armando
    const [recetaItems, setRecetaItems] = useState([]);
    const [nuevoIngrediente, setNuevoIngrediente] = useState({ id_insumo: '', cantidad: '' });

    const initialFormState = {
        nombre: '',
        descripcion: '',
        tipo: 'PIZZA',
        categoria: 'Pizzas',
        precio: '',
        // Pizza
        precio_grande: '',
        precio_chica: '',
        // Helado
        max_gustos: '1',
        gustos: [],
        // Hamburguesa
        max_toppings: '0',
        max_aderezos: '0',
        precio_carne_extra: '',
        max_carnes_extra: '0',
        toppings: [],
        aderezos: [],
        guarniciones: []
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, insRes, catRes] = await Promise.all([
                api.get('/productos'),
                api.get('/insumos'),
                api.get('/productos/categorias')
            ]);
            setProducts(prodRes.data);
            setInsumosDisponibles(insRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Hubo un error al cargar los datos de la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const setTipo = (tipo) => {
        setFormData((prev) => {
            const sugerida = TIPOS.find(t => t.id === tipo).categoria;
            const categoriaEraSugerida = !prev.categoria || CATEGORIAS_DEFAULT.includes(prev.categoria);
            return { ...prev, tipo, categoria: categoriaEraSugerida ? sugerida : prev.categoria };
        });
    };

    const setCampo = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }));

    const openEditForm = async (prod) => {
        try {
            // Buscamos el detalle completo (que ahora incluye la receta)
            const response = await api.get(`/productos/${prod.id_producto}`);
            const data = response.data;

            setFormData({
                ...initialFormState,
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                tipo: data.tipo || 'OTRO',
                categoria: data.categoria || '',
                precio: data.tipo === 'PIZZA' ? '' : (data.precio || ''),
                precio_grande: data.pizza?.precio_grande ?? '',
                precio_chica: data.pizza?.precio_chica ?? '',
                max_gustos: String(data.helado?.max_gustos ?? 1),
                gustos: listaParaEditar(data.helado?.gustos),
                max_toppings: String(data.hamburguesa?.max_toppings ?? 0),
                max_aderezos: String(data.hamburguesa?.max_aderezos ?? 0),
                precio_carne_extra: data.hamburguesa?.precio_carne_extra ? String(data.hamburguesa.precio_carne_extra) : '',
                max_carnes_extra: String(data.hamburguesa?.max_carnes_extra ?? 0),
                toppings: listaParaEditar(data.hamburguesa?.toppings),
                aderezos: listaParaEditar(data.hamburguesa?.aderezos),
                guarniciones: listaParaEditar(data.hamburguesa?.guarniciones, true)
            });
            
            // Mapeamos la receta del backend al estado local (con check de seguridad || [])
            const itemsReceta = (data.receta || []).map(ri => ({
                id_insumo: ri.id_insumo,
                nombre: ri.nombre_insumo,
                cantidad_usada: ri.cantidad_usada,
                unidad: ri.unidad_medida // Cambiado ri.unidad a ri.unidad_medida
            }));
            
            setRecetaItems(itemsReceta);
            setImagePreview(data.img || null);
            setImageFile(null);
            setEditingId(data.id_producto);
            setShowForm(true);
        } catch (error) {
            console.error("Error al cargar detalle del producto:", error);
            alert("No se pudo cargar la información completa del producto.");
        }
    };

    // Funciones para la Receta
    const agregarIngrediente = () => {
        if (!nuevoIngrediente.id_insumo || !nuevoIngrediente.cantidad) return;
        
        const insumo = insumosDisponibles.find(i => i.id_insumo === parseInt(nuevoIngrediente.id_insumo));
        if (!insumo) return;

        const exists = recetaItems.find(item => item.id_insumo === insumo.id_insumo);
        if (exists) {
            alert("Este insumo ya está en la receta.");
            return;
        }

        setRecetaItems([...recetaItems, {
            id_insumo: insumo.id_insumo,
            nombre: insumo.nombre,
            cantidad_usada: nuevoIngrediente.cantidad,
            unidad: insumo.unidad_medida
        }]);
        setNuevoIngrediente({ id_insumo: '', cantidad: '' });
    };

    const eliminarIngrediente = (id) => {
        setRecetaItems(recetaItems.filter(item => item.id_insumo !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        setIsSubmitting(true);
        
        try {
            const dataToUpload = new FormData();
            dataToUpload.append('nombre', formData.nombre);
            dataToUpload.append('descripcion', formData.descripcion);
            dataToUpload.append('categoria', formData.categoria);
            dataToUpload.append('tipo', formData.tipo);
            if (formData.tipo !== 'PIZZA' && formData.precio !== '') {
                dataToUpload.append('precio', parseFloat(formData.precio));
            }

            // Datos propios del tipo (el backend los valida)
            const lista = (items, conPrecio = false) => items.map(it => ({
                id: it.id,
                nombre: it.nombre,
                disponible: it.disponible,
                ...(conPrecio ? { precio_extra: it.precio_extra === '' ? 0 : Number(it.precio_extra) } : {})
            }));
            let detalle = {};
            if (formData.tipo === 'PIZZA') {
                detalle = { precio_grande: formData.precio_grande, precio_chica: formData.precio_chica };
            } else if (formData.tipo === 'HELADO') {
                detalle = { max_gustos: Number(formData.max_gustos), gustos: lista(formData.gustos) };
            } else if (formData.tipo === 'HAMBURGUESA') {
                detalle = {
                    max_toppings: Number(formData.max_toppings),
                    max_aderezos: Number(formData.max_aderezos),
                    precio_carne_extra: formData.precio_carne_extra,
                    max_carnes_extra: Number(formData.max_carnes_extra),
                    toppings: lista(formData.toppings),
                    aderezos: lista(formData.aderezos),
                    guarniciones: lista(formData.guarniciones, true)
                };
            }
            dataToUpload.append('detalle', JSON.stringify(detalle));

            // Enviamos la receta simplificada (solo IDs y cantidades)
            const recetaParaEnviar = recetaItems.map(item => ({
                id_insumo: item.id_insumo,
                cantidad_usada: parseFloat(item.cantidad_usada)
            }));
            dataToUpload.append('receta', JSON.stringify(recetaParaEnviar));

            if (imageFile) {
                dataToUpload.append('imagen', imageFile);
            }

            if (editingId) {
                await api.put(`/productos/${editingId}`, dataToUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/productos', dataToUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            setShowForm(false);
            setEditingId(null);
            setFormData(initialFormState);
            setRecetaItems([]);
            setImagePreview(null);
            setImageFile(null);
            fetchData();
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert(error.response?.data?.message || 'No se pudo guardar el producto. Verificá los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;
        try {
            await api.delete(`/productos/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al intentar eliminar el producto.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Inventario de <span className="text-gold-600">Productos</span></h1>
                    <p className="text-gray-500">Gestioná el menú y los precios de tu local</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData(initialFormState);
                        setRecetaItems([]);
                        setImagePreview(null);
                        setImageFile(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-gold-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </header>

            {/* Modal / Formulario de Carga */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 h-auto max-h-[95vh] flex flex-col">
                        <div className="bg-gold-600 p-6 text-white flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Utensils /> {editingId ? 'Editar Producto' : 'Cargar Nuevo Producto'}</h2>
                            <button onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData(initialFormState);
                                setRecetaItems([]);
                                setImagePreview(null);
                                setImageFile(null);
                            }} className="hover:bg-gold-500 p-1 rounded-full"><X /></button>
                        </div>

                        <div className="overflow-y-auto p-8">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Columna Izquierda: Datos Básicos */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black text-gray-800 border-b pb-2 flex items-center gap-2"><Tag size={20} className="text-gold-500"/> Información General</h3>
                                        
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombre</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                required
                                                value={formData.nombre}
                                                className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-bold"
                                                placeholder="Ej: Napolitana con Ajo"
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tipo de producto</label>
                                            <div className="grid grid-cols-4 gap-1 mt-1 bg-gray-100 p-1 rounded-xl" role="radiogroup">
                                                {TIPOS.map(t => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={formData.tipo === t.id}
                                                        onClick={() => setTipo(t.id)}
                                                        className={`py-2 rounded-lg text-xs font-black transition-all ${formData.tipo === t.id ? 'bg-white text-gold-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Categoría (como se ve en la tienda)</label>
                                            <input
                                                list="categories-list"
                                                name="categoria"
                                                value={formData.categoria}
                                                className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-bold"
                                                placeholder={formData.tipo === 'OTRO' ? 'Ej: Bebidas, Empanadas...' : 'Elegí o escribí...'}
                                                onChange={handleChange}
                                                autoComplete="off"
                                                required
                                            />
                                            <datalist id="categories-list">
                                                {[...new Set([...categories, ...CATEGORIAS_DEFAULT, 'Bebidas', 'Postres', 'Entradas'])].map(cat => (
                                                    <option key={cat} value={cat} />
                                                ))}
                                            </datalist>
                                        </div>

                                        {formData.tipo === 'PIZZA' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                <CampoPrecio label="Precio grande" name="precio_grande" value={formData.precio_grande} onChange={handleChange} required />
                                                <CampoPrecio label="Precio chica (opcional)" name="precio_chica" value={formData.precio_chica} onChange={handleChange} />
                                            </div>
                                        ) : (
                                            <CampoPrecio label="Precio" name="precio" value={formData.precio} onChange={handleChange} required />
                                        )}

                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Descripción</label>
                                            <textarea
                                                name="descripcion"
                                                rows="2"
                                                value={formData.descripcion || ''}
                                                className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-gold-500 outline-none"
                                                placeholder="Ingredientes principales..."
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Imagen del Producto</label>
                                        <div className="relative group border-2 border-dashed border-gray-200 rounded-3xl h-44 flex flex-col items-center justify-center bg-gray-50/50 overflow-hidden hover:border-gold-400 transition-all">
                                            {imagePreview ? (
                                                <div className="relative w-full h-full">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase tracking-widest">Cambiar Imagen</div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImagePlus className="mx-auto text-gray-300 mb-2" size={32} />
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Click para subir foto</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha: Receta / Insumos */}
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-black text-gray-800 border-b pb-2 flex items-center gap-2"><Utensils size={20} className="text-gold-500"/> Receta (Descuento de Stock)</h3>
                                        
                                        {/* Selector de Insumos */}
                                        <div className="bg-gold-50 p-4 rounded-2xl space-y-3">
                                            <p className="text-[10px] font-black text-gold-800 uppercase tracking-widest">Agregar ingrediente a la receta</p>
                                            <div className="flex gap-2">
                                                <select 
                                                    className="flex-1 p-2.5 bg-white border-none rounded-xl text-sm font-bold outline-none ring-1 ring-gold-100 focus:ring-2 focus:ring-gold-500 transition-all"
                                                    value={nuevoIngrediente.id_insumo}
                                                    onChange={(e) => setNuevoIngrediente({...nuevoIngrediente, id_insumo: e.target.value})}
                                                >
                                                    <option value="">Seleccionar Insumo...</option>
                                                    {insumosDisponibles.map(ins => (
                                                        <option key={ins.id_insumo} value={ins.id_insumo}>
                                                            {ins.nombre} ({ins.unidad_medida})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="w-24 relative">
                                                    <input 
                                                        type="number"
                                                        placeholder="Cant."
                                                        className="w-full p-2.5 bg-white border-none rounded-xl text-sm font-black outline-none ring-1 ring-gold-100 focus:ring-2 focus:ring-gold-500 transition-all"
                                                        value={nuevoIngrediente.cantidad}
                                                        onChange={(e) => setNuevoIngrediente({...nuevoIngrediente, cantidad: e.target.value})}
                                                    />
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={agregarIngrediente}
                                                    className="bg-gold-600 text-white p-2.5 rounded-xl hover:bg-gold-700 active:scale-95 transition-all shadow-md shadow-gold-100"
                                                >
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lista de Ingredientes en la Receta */}
                                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                            {recetaItems.length === 0 ? (
                                                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                                    <Beaker className="mx-auto text-gray-300 mb-2" size={24} />
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sin ingredientes todavía</p>
                                                </div>
                                            ) : (
                                                recetaItems.map((item) => (
                                                    <div key={item.id_insumo} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-all animate-in slide-in-from-right-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-700">{item.nombre}</span>
                                                            <span className="text-[10px] font-black text-gold-500 uppercase">Gasto: {item.cantidad_usada} {item.unidad}</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => eliminarIngrediente(item.id_insumo)}
                                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {formData.tipo === 'HELADO' && (
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="text-lg font-black text-gray-800 border-b pb-2 flex items-center gap-2"><IceCream size={20} className="text-gold-500" /> Gustos</h3>
                                        <CampoNumero
                                            label="Máxima cantidad de gustos que puede elegir el cliente"
                                            value={formData.max_gustos} min={1} max={20}
                                            onChange={(v) => setCampo('max_gustos', v)}
                                        />
                                        <ListaEditable
                                            titulo="Gustos disponibles en este producto"
                                            items={formData.gustos}
                                            onChange={(v) => setCampo('gustos', v)}
                                            placeholder="Ej: Chocolate (Enter para agregar, o pegá varios separados por coma)"
                                        />
                                    </div>
                                )}

                                {formData.tipo === 'HAMBURGUESA' && (
                                    <div className="md:col-span-2 space-y-6">
                                        <h3 className="text-lg font-black text-gray-800 border-b pb-2 flex items-center gap-2"><Beef size={20} className="text-gold-500" /> Opciones de la hamburguesa</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <CampoNumero label="Máximo de toppings" value={formData.max_toppings} min={0} max={30} onChange={(v) => setCampo('max_toppings', v)} />
                                                <ListaEditable titulo="Toppings (sin cargo)" items={formData.toppings} onChange={(v) => setCampo('toppings', v)} placeholder="Ej: Cheddar, Lechuga, Tomate" />
                                            </div>
                                            <div className="space-y-3">
                                                <CampoNumero label="Máximo de aderezos" value={formData.max_aderezos} min={0} max={30} onChange={(v) => setCampo('max_aderezos', v)} />
                                                <ListaEditable titulo="Aderezos (sin cargo)" items={formData.aderezos} onChange={(v) => setCampo('aderezos', v)} placeholder="Ej: Mayonesa, Ketchup" />
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[11px] text-gray-400 font-bold">Si cargás guarniciones, el cliente elige una. Poné +$0 a la que viene incluida.</p>
                                                <ListaEditable titulo="Guarniciones" items={formData.guarniciones} onChange={(v) => setCampo('guarniciones', v)} conPrecio placeholder="Ej: Papas chicas, Papas grandes" />
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Carne extra</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <CampoNumero label="Máximo de carnes extra" value={formData.max_carnes_extra} min={0} max={10} onChange={(v) => setCampo('max_carnes_extra', v)} />
                                                    <CampoPrecio label="Precio por carne" name="precio_carne_extra" value={formData.precio_carne_extra} onChange={handleChange} required={Number(formData.max_carnes_extra) > 0} />
                                                </div>
                                                <p className="text-[11px] text-gray-400 font-bold">Ej: máximo 2 a $500 → el cliente puede sumar +1 (+$500) o +2 (+$1.000). Con 0 no se ofrece.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="md:col-span-2 pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className={`w-full text-white py-4 rounded-3xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gold-400 cursor-not-allowed' : 'bg-gold-600 hover:bg-gold-700 shadow-gold-100 hover:-translate-y-1'}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                                Procesando menú...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={24} /> {editingId ? 'Actualizar Producto' : 'Guardar Producto en el Menú'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de Productos Existentes */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-gray-400">
                         <div className="animate-bounce mb-4 text-gold-500"><Utensils size={40} className="mx-auto" /></div>
                         <p className="font-black uppercase tracking-widest text-sm">Cocinando tu lista de productos...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-20 text-center">
                         <div className="mb-4 text-gray-200"><Utensils size={60} className="mx-auto" /></div>
                         <p className="font-bold text-gray-400">Tu menú está vacío. ¡Empezá a cargar delicias!</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                            <tr>
                                <th className="px-8 py-6">Detalles del Producto</th>
                                <th className="px-8 py-6">Categoría</th>
                                <th className="px-8 py-6">Lista de Precios</th>
                                <th className="px-8 py-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((prod) => (
                                <tr key={prod.id_producto} className="group hover:bg-gold-50/20 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            {prod.img ? (
                                                <div className="w-20 h-20 bg-gray-100 rounded-[1.5rem] overflow-hidden shadow-sm shrink-0 border-4 border-white group-hover:scale-105 transition-transform">
                                                    <img src={prod.img} alt={prod.nombre} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-300 shrink-0 border-4 border-white group-hover:scale-105 transition-transform">
                                                    <Utensils size={32} />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-800 text-xl leading-tight group-hover:text-gold-600 transition-colors">{prod.nombre}</span>
                                                <span className="text-xs text-gray-400 max-w-[250px] line-clamp-2 mt-2 font-medium leading-relaxed">{prod.descripcion}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-slate-100 group-hover:bg-gold-100 group-hover:text-gold-700 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">
                                            {prod.categoria}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col justify-center">
                                            {prod.tipo === 'PIZZA' && prod.pizza ? (
                                                <>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xs font-bold text-gray-400">G:</span>
                                                        <span className="font-black text-gray-900 text-2xl tracking-tighter">${prod.pizza.precio_grande.toLocaleString()}</span>
                                                    </div>
                                                    {prod.pizza.precio_chica != null && (
                                                        <div className="flex items-baseline gap-1 mt-1 opacity-60">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">CH:</span>
                                                            <span className="font-black text-slate-700 text-sm">${prod.pizza.precio_chica.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="font-black text-gray-900 text-2xl tracking-tighter">${parseFloat(prod.precio || 0).toLocaleString()}</span>
                                            )}
                                            {prod.tipo === 'HELADO' && prod.helado && (
                                                <span className="text-[10px] font-black text-gold-700 mt-1">{prod.helado.gustos.length} gustos · hasta {prod.helado.max_gustos}</span>
                                            )}
                                            {prod.tipo === 'HAMBURGUESA' && prod.hamburguesa && (
                                                <span className="text-[10px] font-black text-gold-700 mt-1">
                                                    {prod.hamburguesa.toppings.length} toppings · {prod.hamburguesa.aderezos.length} aderezos · {prod.hamburguesa.guarniciones.length} guarniciones
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center gap-3">
                                            <button 
                                                onClick={() => openEditForm(prod)} 
                                                className="p-3 text-slate-400 hover:text-gold-600 hover:bg-white hover:shadow-lg hover:shadow-gold-100 rounded-2xl transition-all active:scale-95"
                                                title="Editar Receta y Datos"
                                            >
                                                <Edit size={22} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(prod.id_producto)} 
                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-lg hover:shadow-red-50 rounded-2xl transition-all active:scale-95"
                                                title="Eliminar del Menú"
                                            >
                                                <Trash2 size={22} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Inventory;