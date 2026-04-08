import { useState } from 'react';
import { Plus, ImagePlus, Pizza, DollarSign, Tag, Trash2, Edit, Save, X } from 'lucide-react';

const Inventory = () => {
    const [showForm, setShowForm] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [products, setProducts] = useState([
        { id: 1, nombre: 'Muzzarella', categoria: 'Pizzas', precio: 8500, imagen: null },
        { id: 2, nombre: 'Coca Cola 1.5L', categoria: 'Bebidas', precio: 2500, imagen: null },
    ]);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: 'Pizzas',
        precio: ''
    });

    // Manejador de imagen para previsualización
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Datos a enviar al backend:", { ...formData, imagen: imagePreview });
        // Aquí iría tu llamado a la API
        setShowForm(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Inventario de <span className="text-orange-600">Productos</span></h1>
                    <p className="text-gray-500">Gestioná el menú y los precios de tu pizzería</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </header>

            {/* Modal / Formulario de Carga */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-orange-600 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Pizza /> Cargar Nuevo Producto</h2>
                            <button onClick={() => setShowForm(false)} className="hover:bg-orange-500 p-1 rounded-full"><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sección Foto */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Foto del Producto</label>
                                <div className="relative group border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 overflow-hidden hover:border-orange-400 transition-colors">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
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
                                        required
                                        className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Ej: Napolitana con Ajo"
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Categoría</label>
                                    <select
                                        className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    >
                                        <option>Pizzas</option>
                                        <option>Empanadas</option>
                                        <option>Bebidas</option>
                                        <option>Postres</option>
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Descripción</label>
                                    <textarea
                                        rows="2"
                                        className="w-full mt-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Contanos qué trae esta delicia..."
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="w-1/2">
                                    <label className="text-sm font-bold text-gray-700">Precio de Venta</label>
                                    <div className="relative mt-1">
                                        <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            required
                                            className="w-full pl-10 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-orange-600"
                                            placeholder="0.00"
                                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-4 flex gap-4">
                                <button type="submit" className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                                    <Save size={20} /> Guardar en Menú
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de Productos Existentes */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest font-bold">
                        <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-orange-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                            <Pizza size={20} />
                                        </div>
                                        <span className="font-bold text-gray-700">{prod.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{prod.categoria}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-orange-600">
                                    ${prod.precio.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;