import { useState, useEffect } from 'react';
import { Save, X, Pizza } from 'lucide-react';

const ProductForm = ({ productToEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: 'Pizzas' // Valor por defecto
    });

    // Si nos pasan un producto para editar, llenamos el formulario
    useEffect(() => {
        if (productToEdit) {
            setFormData(productToEdit);
        }
    }, [productToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validamos que el precio sea un número positivo (mentalidad de analista)
        if (parseFloat(formData.precio) <= 0) {
            alert("El precio debe ser mayor a 0");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6 text-gold-600">
                <Pizza size={24} />
                <h2 className="text-xl font-bold">
                    {productToEdit ? 'Editar Producto' : 'Nueva Pizza / Producto'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del producto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Pizza</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2 border"
                        placeholder="Ej: Muzza con aceitunas"
                        required
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción / Ingredientes</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2 border"
                        placeholder="Mozzarella, salsa de tomate, orégano..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Precio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                        <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2 border"
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold-500 focus:ring-gold-500 p-2 border"
                        >
                            <option value="Pizzas">Pizzas</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Postres">Postres</option>
                            <option value="Entradas">Entradas</option>
                        </select>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        <X size={18} /> Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-gold-600 rounded-lg hover:bg-gold-700 transition shadow-md"
                    >
                        <Save size={18} /> Guardar Producto
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;