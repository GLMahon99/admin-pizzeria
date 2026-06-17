import { useState, useEffect } from 'react';
import { 
    Bike, 
    Plus, 
    X, 
    Edit2, 
    Trash2, 
    Phone, 
    Key, 
    Check, 
    AlertCircle,
    UserCheck,
    UserX
} from 'lucide-react';
import api from '../api/axiosConfig';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        pin: '',
        activo: 1
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/repartidores');
            setDrivers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching drivers:', err);
            setError('No se pudieron cargar los repartidores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleOpenAddModal = () => {
        setEditingDriver(null);
        // Generar PIN aleatorio de 4 dígitos para comodidad
        const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
        setFormData({
            nombre: '',
            telefono: '',
            pin: randomPin,
            activo: 1
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (driver) => {
        setEditingDriver(driver);
        setFormData({
            nombre: driver.nombre,
            telefono: driver.telefono,
            pin: driver.pin,
            activo: driver.activo
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!formData.nombre || !formData.telefono || !formData.pin) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        const pinRegex = /^\d{4}$/;
        if (!pinRegex.test(formData.pin)) {
            alert('El PIN debe ser de exactamente 4 dígitos numéricos.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingDriver) {
                // Editar repartidor
                await api.put(`/repartidores/${editingDriver.id_repartidor}`, formData);
                alert('Repartidor actualizado con éxito.');
            } else {
                // Crear repartidor nuevo
                await api.post('/repartidores', formData);
                alert('Repartidor registrado con éxito.');
            }
            setShowModal(false);
            fetchDrivers();
        } catch (err) {
            console.error('Error saving driver:', err);
            alert(err.response?.data?.message || 'Error al guardar los datos del repartidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (driver) => {
        const confirmMsg = `¿Estás seguro de que deseas ${driver.activo ? 'desactivar' : 'activar'} a ${driver.nombre}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.put(`/repartidores/${driver.id_repartidor}`, {
                activo: driver.activo ? 0 : 1
            });
            fetchDrivers();
        } catch (err) {
            console.error('Error toggling driver status:', err);
            alert('No se pudo cambiar el estado del repartidor.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">
                        Gestión de <span className="text-gold-600">Repartidores</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Administración de cadetes y claves de acceso</p>
                </div>

                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-8 py-4 rounded-[2rem] font-black shadow-xl shadow-gold-100 transition-all hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wider"
                >
                    <Plus size={18} /> Nuevo Repartidor
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

            {/* Listado de Repartidores */}
            {loading ? (
                <div className="py-32 text-center text-gray-400">
                     <div className="animate-bounce mb-4 text-gold-500"><Bike size={40} className="mx-auto" /></div>
                     <p className="font-black uppercase tracking-widest text-sm text-gray-400">Cargando repartidores...</p>
                </div>
            ) : drivers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {drivers.map((driver) => (
                        <div 
                            key={driver.id_repartidor} 
                            className={`bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 border-t-8 ${
                                driver.activo ? 'border-t-gold-500' : 'border-t-gray-300'
                            }`}
                        >
                            <div className="p-8 flex-1 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            driver.activo ? 'bg-gold-100 text-gold-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Bike size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-800 text-xl leading-tight uppercase tracking-tight">{driver.nombre}</h3>
                                            <span className={`inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest ${
                                                driver.activo ? 'text-green-600' : 'text-gray-400'
                                            }`}>
                                                {driver.activo ? <UserCheck size={10} /> : <UserX size={10} />}
                                                {driver.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100/50 text-sm">
                                    <div className="flex items-center gap-3 text-gray-600 font-bold">
                                        <Phone size={16} className="text-gold-500" />
                                        <span>{driver.telefono}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 font-bold border-t border-gray-100/60 pt-3">
                                        <Key size={16} className="text-gold-500" />
                                        <span>PIN de Acceso: <strong className="text-slate-800 font-black tracking-widest font-mono text-base">{driver.pin}</strong></span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/30 border-t border-gray-100 flex gap-3">
                                <button 
                                    onClick={() => handleOpenEditModal(driver)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button 
                                    onClick={() => handleToggleStatus(driver)}
                                    className={`px-6 flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                                        driver.activo
                                        ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                        : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
                                    }`}
                                >
                                    {driver.activo ? 'Desactivar' : 'Activar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                    <Bike size={64} className="mx-auto text-gray-200 mb-6" />
                    <h4 className="text-xl font-black text-gray-400 uppercase tracking-widest">Sin repartidores registrados</h4>
                    <p className="text-gray-400 font-bold text-sm">Registra tu primer repartidor para habilitar el reparto por QR</p>
                </div>
            )}

            {/* Modal de Agregar / Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
                        {/* Header */}
                        <div className="bg-gold-600 p-8 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                    <Bike size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{editingDriver ? 'Editar Repartidor' : 'Registrar Repartidor'}</h2>
                                    <p className="text-gold-100 text-xs font-bold opacity-80 uppercase tracking-widest">Ingresa los datos del cadete</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all"><X size={24}/></button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    name="nombre"
                                    required
                                    placeholder="Ej. Juan Pérez" 
                                    className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none font-bold"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Teléfono de Contacto</label>
                                <input 
                                    type="tel" 
                                    name="telefono"
                                    required
                                    placeholder="Ej. 1122334455" 
                                    className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none font-bold"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">PIN de Acceso (4 dígitos)</label>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, pin: Math.floor(1000 + Math.random() * 9000).toString() })}
                                        className="text-[10px] font-black text-gold-600 uppercase tracking-wider hover:underline"
                                    >
                                        Generar otro
                                    </button>
                                </div>
                                <input 
                                    type="text" 
                                    name="pin"
                                    required
                                    maxLength={4}
                                    pattern="\d{4}"
                                    autoComplete="new-password"
                                    placeholder="Ej. 1234" 
                                    className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-gold-500 outline-none font-black tracking-widest text-center text-lg"
                                    value={formData.pin}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setFormData({
                                            ...formData,
                                            pin: value
                                        });
                                    }}
                                />
                            </div>

                            {editingDriver && (
                                <div className="flex items-center gap-3 pt-2">
                                    <input 
                                        type="checkbox"
                                        id="activo"
                                        name="activo"
                                        checked={formData.activo === 1}
                                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked ? 1 : 0 })}
                                        className="w-5 h-5 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
                                    />
                                    <label htmlFor="activo" className="text-sm font-bold text-gray-700">El repartidor se encuentra activo</label>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gold-600 hover:bg-gold-700 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-gold-100 flex items-center justify-center gap-2"
                            >
                                <Check size={20} /> {isSubmitting ? 'Guardando...' : (editingDriver ? 'Guardar Cambios' : 'Registrar Repartidor')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
