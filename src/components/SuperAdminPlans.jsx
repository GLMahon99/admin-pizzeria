import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Crown, Zap, Save, History, FileText } from 'lucide-react';

const formatARS = (value) => `$${parseFloat(value || 0).toLocaleString('es-AR')}`;

/**
 * Gestión de planes de suscripción desde el Super Admin:
 * editar precio, nombre, descripción y activar/desactivar cada plan.
 */
const SuperAdminPlans = ({ plans, historial, onSaved }) => {
    const [drafts, setDrafts] = useState({});
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        const initial = {};
        plans.forEach(p => {
            initial[p.id_plan] = {
                precio: String(parseFloat(p.precio)),
                nombre: p.nombre,
                descripcion: p.descripcion || '',
                activo: !!p.activo
            };
        });
        setDrafts(initial);
    }, [plans]);

    const setField = (id, field, value) => {
        setDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const isDirty = (plan) => {
        const d = drafts[plan.id_plan];
        if (!d) return false;
        return parseFloat(d.precio) !== parseFloat(plan.precio)
            || d.nombre !== plan.nombre
            || d.descripcion !== (plan.descripcion || '')
            || d.activo !== !!plan.activo;
    };

    const handleSave = async (plan) => {
        const d = drafts[plan.id_plan];
        const precio = parseFloat(d.precio);
        if (!Number.isFinite(precio) || precio <= 0) {
            alert('El precio debe ser un número mayor a 0.');
            return;
        }
        if (precio !== parseFloat(plan.precio) &&
            !window.confirm(`¿Cambiar el precio de "${plan.nombre}" de ${formatARS(plan.precio)} a ${formatARS(precio)}?\n\nAplica a las nuevas suscripciones. Las ya autorizadas en Mercado Pago no se modifican.`)) {
            return;
        }

        try {
            setSavingId(plan.id_plan);
            await api.put(`/superadmin/plans/${plan.id_plan}`, {
                precio,
                nombre: d.nombre,
                descripcion: d.descripcion,
                activo: d.activo
            });
            onSaved();
        } catch (error) {
            console.error('Error al actualizar plan:', error);
            alert('No se pudo actualizar el plan: ' + (error.response?.data?.message || error.message));
        } finally {
            setSavingId(null);
        }
    };

    const planName = (id) => plans.find(p => p.id_plan === id)?.nombre || id;

    return (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="text-gold-500 w-5 h-5" /> Planes y Precios
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                    Los cambios aplican a las nuevas suscripciones. Las suscripciones ya autorizadas en Mercado Pago mantienen su monto.
                </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(plan => {
                    const d = drafts[plan.id_plan];
                    if (!d) return null;
                    const isPremium = plan.tipo === 'PREMIUM';
                    const Icon = isPremium ? Crown : Zap;
                    return (
                        <div key={plan.id_plan} className={`bg-slate-950 rounded-2xl p-5 border ${d.activo ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-2 rounded-xl ${isPremium ? 'bg-gold-500/10 text-gold-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <input
                                            value={d.nombre}
                                            onChange={(e) => setField(plan.id_plan, 'nombre', e.target.value)}
                                            className="bg-transparent text-sm font-bold text-white w-full focus:outline-none focus:border-b focus:border-gold-500"
                                        />
                                        <div className="text-[10px] font-mono text-slate-500">{plan.id_plan}</div>
                                    </div>
                                </div>
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={d.activo}
                                        onChange={(e) => setField(plan.id_plan, 'activo', e.target.checked)}
                                        className="accent-amber-500"
                                    />
                                    Activo
                                </label>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-800 text-slate-300">
                                    {plan.frecuencia === 'years' ? 'ANUAL' : 'MENSUAL'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black flex items-center gap-1 ${plan.facturacion_automatica ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                    <FileText size={9} /> {plan.facturacion_automatica ? 'CON FACTURACIÓN AUTOMÁTICA' : 'SIN FACTURACIÓN AUTOMÁTICA'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400">
                                    {plan.empresas_activas} ACTIVAS
                                </span>
                            </div>

                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                Precio ({plan.frecuencia === 'years' ? 'por año' : 'por mes'})
                            </label>
                            <div className="relative mb-3">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={d.precio}
                                    onChange={(e) => setField(plan.id_plan, 'precio', e.target.value)}
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm font-mono font-bold focus:outline-none focus:border-gold-500"
                                />
                            </div>

                            <textarea
                                rows={2}
                                value={d.descripcion}
                                onChange={(e) => setField(plan.id_plan, 'descripcion', e.target.value)}
                                placeholder="Descripción del plan"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-gold-500 mb-3 resize-none"
                            />

                            <button
                                onClick={() => handleSave(plan)}
                                disabled={!isDirty(plan) || savingId === plan.id_plan}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Save size={14} />
                                {savingId === plan.id_plan ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {historial.length > 0 && (
                <div className="px-6 pb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <History size={13} /> Últimos cambios de precio
                    </h4>
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 divide-y divide-slate-800/60">
                        {historial.map((h, i) => (
                            <div key={i} className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="font-bold text-slate-200">{planName(h.id_plan)}</span>
                                <span className="font-mono text-slate-400">
                                    {formatARS(h.precio_anterior)} → <span className="text-white font-bold">{formatARS(h.precio_nuevo)}</span>
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {new Date(h.cambiado_en).toLocaleString('es-AR')} · {h.cambiado_por}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminPlans;
