import { useState, useEffect } from 'react';
import { Plus, ImagePlus, Pizza, DollarSign, Tag, Trash2, Edit, Save, X } from 'lucide-react';
import api from '../api/axiosConfig';

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialFormState = {
        nombre: '',
        descripcion: '',
        categoria: 'Pizzas',
        precio: '',
        precio_chica: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/productos');
            setProducts(response.data);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            alert('Hubo un error al cargar los productos de la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
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

    const openEditForm = (prod) => {
        setFormData({
            nombre: prod.nombre,
            descripcion: prod.descripcion || '',
            categoria: prod.categoria || 'Pizzas',
            precio: prod.precio || '',
            precio_chica: prod.precio_chica || ''
        });
        setImagePreview(prod.img || null);
        setImageFile(null); // Reiniciamos el archivo a subir
        setEditingId(prod.id_producto);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Evitar doble click
        setIsSubmitting(true);
        
        try {
            const dataToUpload = new FormData();
            dataToUpload.append('nombre', formData.nombre);
            dataToUpload.append('descripcion', formData.descripcion);
            dataToUpload.append('categoria', formData.categoria);
            dataToUpload.append('precio', parseFloat(formData.precio));
            
            // Si es pizzas, mandamos precio_chica incluso si está vacío (así se puede borrar)
            if (formData.categoria === 'Pizzas') {
                if (formData.precio_chica !== '') {
                    dataToUpload.append('precio_chica', parseFloat(formData.precio_chica));
                } else {
                    dataToUpload.append('precio_chica', '');
                }
            }

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
            setImagePreview(null);
            setImageFile(null);
            fetchProducts();
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('No se pudo guardar el producto. Verificá los datos.');
        } finally {
            setIsSubmitting(false); // Liberar el botón
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que querés eliminar este producto?')) return;
        try {
            await api.delete(`/productos/${id}`);
            fetchProducts();
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
                    <h1 className="text-3xl font-extrabold text-gray-800">Inventario de <span className="text-orange-600">Productos</span></h1>
                    <p className="text-gray-500">Gestioná el menú y los precios de tu pizzería</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData(initialFormState);
                        setImagePreview(null);
                        setImageFile(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </header>

            {/* Modal / Formulario de Carga */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-auto max-h-[90vh] overflow-y-auto">
                        <div className="bg-orange-600 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Pizza /> {editingId ? 'Editar Producto' : 'Cargar Nuevo Producto'}</h2>
                            <button onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData(initialFormState);
                                setImagePreview(null);
                                setImageFile(null);
                            }} className="hover:bg-orange-500 p-1 rounded-full"><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sección Foto */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Foto del Producto</label>
                                <div className="relative group border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 overflow-hidden hover:border-orange-400 transition-colors">
                                    {imagePreview ? (
                                        <div className="relative w-full h-full">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">Cambiar Imagen</div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImagePlus className="mx-auto text-gray-400 mb-2" size={40} />
                                            <p className="text-xs text-gray-500 font-medium">Click para subir o arrastrá una imagen</p>
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

                            {/* Sección Datos */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        required
                                        value={formData.nombre}
                                        className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ej: Napolitana con Ajo"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Categoría</label>
                                    <select
                                        name="categoria"
                                        value={formData.categoria}
                                        className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        onChange={handleChange}
                                    >
                                        <option value="Pizzas">Pizzas</option>
                                        <option value="Empanadas">Empanadas</option>
                                        <option value="Bebidas">Bebidas</option>
                                        <option value="Postres">Postres</option>
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Descripción (Opcional)</label>
                                    <textarea
                                        name="descripcion"
                                        rows="2"
                                        value={formData.descripcion || ''}
                                        className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Contanos qué trae esta delicia..."
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="text-sm font-bold text-gray-700">{formData.categoria === 'Pizzas' ? 'Precio (Grande)' : 'Precio de Venta'}</label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                            <input
                                                type="number"
                                                name="precio"
                                                required
                                                step="0.01"
                                                value={formData.precio}
                                                className="w-full pl-10 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-orange-600"
                                                placeholder="0.00"
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {formData.categoria === 'Pizzas' && (
                                        <div className="w-1/2 animate-in fade-in zoom-in duration-200">
                                            <label className="text-sm font-bold text-gray-700">Precio (Chica)</label>
                                            <div className="relative mt-1">
                                                <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                                <input
                                                    type="number"
                                                    name="precio_chica"
                                                    step="0.01"
                                                    value={formData.precio_chica}
                                                    className="w-full pl-10 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-bold text-slate-700"
                                                    placeholder="0.00"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4 flex gap-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`flex-1 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        <>
                                            <Save size={20} /> {editingId ? 'Guardar Cambios' : 'Guardar en Menú'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de Productos Existentes */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 font-bold">Cargando productos...</div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 font-bold">No hay productos en tu menú. ¡Creá uno!</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Precio(s)</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((prod) => (
                                <tr key={prod.id_producto} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {prod.img ? (
                                                <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shadow-sm shrink-0">
                                                    <img src={prod.img} alt={prod.nombre} className="w-full h-full object-cover border border-gray-100" />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                                    <Pizza size={24} />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-lg leading-tight">{prod.nombre}</span>
                                                <span className="text-xs text-gray-400 max-w-[200px] truncate mt-1">{prod.descripcion}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{prod.categoria}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-orange-600 text-lg">
                                                ${parseFloat(prod.precio).toLocaleString()}
                                            </span>
                                            {prod.precio_chica && (
                                                <span className="text-xs text-gray-500 font-bold mt-0.5">
                                                    CH: ${parseFloat(prod.precio_chica).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditForm(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(prod.id_producto)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
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