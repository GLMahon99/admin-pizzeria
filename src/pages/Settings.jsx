import {
    Globe,
    Palette,
    Image as ImageIcon,
    Phone,


    MessageCircle,
    Save,
    Layout
} from 'lucide-react';
import { useState } from 'react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'apariencia', label: 'Apariencia', icon: <Palette size={18} /> },
        { id: 'contacto', label: 'Contacto y Redes', icon: <Phone size={18} /> },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Coonfiguración de la <span className="text-orange-600">Tienda</span></h1>
                    <p className="text-gray-500">Personalizá cómo se ve y funciona tu pizzería online.</p>
                </div>
                <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-orange-100 transition-all active:scale-95">
                    <Save size={20} /> Guardar Cambios
                </button>
            </header>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-white text-gray-800 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">

                {/* --- SECCIÓN GENERAL --- */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nombre del Sitio</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Pizza App Florida"
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                                />
                                <p className="text-[10px] text-gray-400 font-medium">Este es el título que verán los usuarios en su navegador.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Eslogan o Frase</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Las mejores pizzas de zona norte"
                                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                                />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Logo de la Marca</label>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center px-2">Subir Logo (PNG)</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-800">Avatar del Dashboard</p>
                                    <p className="text-xs text-gray-400 pr-10">Se recomienda una imagen cuadrada con fondo transparente (PNG).</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* --- SECCIÓN APARIENCIA --- */}
                {activeTab === 'apariencia' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette size={16} className="text-orange-500" /> Paleta de Colores
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ColorBox label="Primario" color="#ea580c" name="Naranja Pizza" />
                                <ColorBox label="Secundario" color="#0f172a" name="Slate Deep" />
                                <ColorBox label="Acento" color="#22c55e" name="Verde Éxito" />
                                <ColorBox label="Fondo" color="#f8fafc" name="Gris Nube" />
                            </div>
                        </section>

                        <section className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-600 p-2 rounded-xl text-white">
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-orange-900 uppercase tracking-tight">Modo Oscuro Automático</p>
                                    <p className="text-xs text-orange-700/60 font-medium">Activar según preferencia del navegador del cliente.</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-orange-200 rounded-full relative cursor-not-allowed">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </section>
                    </div>
                )}

                {/* --- SECCIÓN CONTACTO --- */}
                {activeTab === 'contacto' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">WhatsApp de Pedidos</label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-4 top-4 text-green-500" size={18} />
                                    <input
                                        type="tel"
                                        placeholder="+54 9 11 1234 5678"
                                        className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Número Local (Fijo)</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-4 text-blue-500" size={18} />
                                    <input
                                        type="tel"
                                        placeholder="011 4765-XXXX"
                                        className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="divider h-px bg-gray-100 w-full" />

                        <section className="space-y-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Redes Sociales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-pink-200 transition-all group">
                                    <div className="bg-white p-3 rounded-xl text-pink-500 shadow-sm group-hover:scale-110 transition-transform">

                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Username de Instagram"
                                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-blue-200 transition-all group">
                                    <div className="bg-white p-3 rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">

                                    </div>
                                    <input
                                        type="text"
                                        placeholder="/pizzerianombre"
                                        className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

            </div>
        </div>
    );
};

// Sub-componente para los cuadros de colores
const ColorBox = ({ label, color, name }) => (
    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 group hover:-translate-y-1 transition-all cursor-pointer">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl shadow-inner border border-white" style={{ background: color }} />
            <div>
                <p className="text-xs font-black text-gray-800">{color}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{name}</p>
            </div>
        </div>
    </div>
);

export default Settings;
