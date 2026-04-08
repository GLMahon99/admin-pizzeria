import { useState } from 'react';
import {
    Plus,
    PackageSearch,
    AlertTriangle,
    Database,
    Trash2,
    Edit3,
    Scale,
    ThermometerSnowflake,
    X,
    DollarSign,
    Save
} from 'lucide-react';

const Supplies = () => {
    const [showForm, setShowForm] = useState(false);

    // Datos mockeados basados en los parámetros de tu DB
    const [insumos] = useState([
        { id: 1, nombre: 'Harina 000', categoria: 'Secos', stock: 45, unidad: 'kg', min: 20, costo: 850 },
        { id: 2, nombre: 'Muzzarella', categoria: 'Lácteos', stock: 12, unidad: 'kg', min: 15, costo: 7200 },
        { id: 3, nombre: 'Salsa de Tomate', categoria: 'Conservas', stock: 30, unidad: 'L', min: 10, costo: 1200 },
        { id: 4, nombre: 'Aceitunas Verdes', categoria: 'Frascos', stock: 5, unidad: 'kg', min: 8, costo: 3500 },
    ]);

    return (
        <div className="space-y-8 pb-10">
            {/* Header con Stats Rápidos */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">
                        Control de <span className="text-orange-600">Insumos</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                        <Database size={14} /> Gestión de materia prima y abastecimiento
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                    <Plus size={20} /> Cargar Insumo
                </button>
            </header>
            {/* Modal de Carga de Insumos */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Header del Modal */}
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Database className="text-orange-500" size={20} />
                                <h2 className="text-xl font-bold">Nuevo Insumo</h2>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="hover:bg-slate-800 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form className="p-8 space-y-5">
                            {/* Nombre del Insumo */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nombre del Insumo</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Harina 000"
                                    className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Categoría */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Categoría</label>
                                    <select className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium">
                                        <option>Secos</option>
                                        <option>Lácteos</option>
                                        <option>Frescos</option>
                                        <option>Bebidas</option>
                                        <option>Limpieza</option>
                                    </select>
                                </div>
                                {/* Unidad de Medida */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Unidad</label>
                                    <select className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium">
                                        <option>kg</option>
                                        <option>litros</option>
                                        <option>unidades</option>
                                        <option>packs</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Stock Inicial */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock Inicial</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                                    />
                                </div>
                                {/* Stock Mínimo */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        placeholder="Alerta en..."
                                        className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-red-600"
                                    />
                                </div>
                            </div>

                            {/* Costo por Unidad */}
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Costo por Unidad ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full pl-10 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-green-700"
                                    />
                                </div>
                            </div>

                            {/* Botón de Guardar */}
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <Save size={20} /> Confirmar Ingreso
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Widgets de Estado de Almacén */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-2xl text-green-600"><PackageSearch /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Insumos</p>
                        <p className="text-2xl font-black text-gray-800">{insumos.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-2xl text-red-600 animate-pulse"><AlertTriangle /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bajo Stock</p>
                        <p className="text-2xl font-black text-red-600">
                            {insumos.filter(i => i.stock <= i.min).length} Críticos
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabla de Insumos */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Insumo</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Stock Actual</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Mínimo</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {insumos.map((insumo) => (
                                <tr key={insumo.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{insumo.nombre}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">COSTO: ${insumo.costo} / {insumo.unidad}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">
                                            {insumo.categoria}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg font-black ${insumo.stock <= insumo.min ? 'text-red-600' : 'text-gray-700'}`}>
                                                {insumo.stock}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 uppercase">{insumo.unidad}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-bold text-sm">
                                        {insumo.min} {insumo.unidad}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {insumo.stock <= insumo.min ? (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                                                    <AlertTriangle size={12} /> Reponer
                                                </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                                                    OK
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                                                <Edit3 size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer para el Analista */}
            <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-center gap-4">
                <div className="text-orange-600"><Scale size={32} /></div>
                <p className="text-sm text-orange-800 leading-relaxed">
                    <span className="font-bold">Sugerencia de Análisis:</span> Tu insumo más crítico es la <span className="font-black underline">Muzzarella</span>.
                    El stock actual está un <span className="font-black">20% por debajo</span> de tu reserva de seguridad.
                    Considerá realizar un pedido al proveedor hoy.
                </p>
            </div>
        </div>
    );
};

export default Supplies;