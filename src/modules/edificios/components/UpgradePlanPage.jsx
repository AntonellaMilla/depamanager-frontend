// src/modules/edificios/components/UpgradePlanPage.jsx
import { useState } from 'react';
import {
    CheckCircle, Zap, Crown, TrendingUp, AlertCircle,
    CreditCard, Calendar, FileText, Download, Copy,
    Check, Building2, Activity, BarChart3,
    Camera, Image, History, Home, ChevronRight, Wallet
} from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { edificiosService } from '../services/edificiosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuconfig";

import Ellipse4 from '../../../assets/images/yapelogo.png';

import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

// Configuración de planes según el seed actualizado
const PLANES = {
    GRATUITO: {
        nombre: 'Gratuito',
        icon: Zap,
        precio: 0,
        color: 'gray',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        badgeColor: 'bg-gray-100 text-gray-600',
        features: [
            { icon: Home, text: 'Hasta 10 unidades', included: true },
            { icon: Camera, text: 'IA reconocimiento de placas', included: true },
            { icon: History, text: '7 días de historial', included: true },
            { icon: Image, text: '50 imágenes IA/mes', included: true },
            { icon: BarChart3, text: 'Métricas financieras', included: false },
            { icon: Activity, text: 'Reportes avanzados', included: false }
        ]
    },
    ESTANDAR: {
        nombre: 'Estándar',
        icon: TrendingUp,
        precio: 9.90,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-700',
        features: [
            { icon: Home, text: 'Hasta 30 unidades', included: true },
            { icon: Camera, text: 'IA reconocimiento de placas', included: true },
            { icon: History, text: '180 días de historial (6 meses)', included: true },
            { icon: Image, text: '500 imágenes IA/mes', included: true },
            { icon: BarChart3, text: 'Métricas financieras', included: false },
            { icon: Activity, text: 'Reportes básicos', included: true }
        ]
    },
    PREMIUM: {
        nombre: 'Premium',
        icon: Crown,
        precio: 19.90,
        color: 'teal',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        textColor: 'text-teal-700',
        badgeColor: 'bg-teal-100 text-teal-700',
        features: [
            { icon: Home, text: 'Hasta 100 unidades', included: true },
            { icon: Camera, text: 'IA reconocimiento de placas', included: true },
            { icon: History, text: '365 días de historial (1 año)', included: true },
            { icon: Image, text: '1000 imágenes IA/mes', included: true },
            { icon: BarChart3, text: 'Métricas financieras', included: true },
            { icon: Activity, text: 'Reportes avanzados', included: true }
        ]
    }
};

const UpgradePlanPage = ({ edificio }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [step, setStep] = useState('select'); // select, payment, success
    const [paymentData, setPaymentData] = useState(null);
    const [copied, setCopied] = useState(false);

    const getUserRole = () => {
        if (!user?.rol) return null;
        const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
        return rolValue?.toUpperCase() || null;
    };
    const userRole = getUserRole();
    const roleColors = getRoleColors(userRole);

    const planActual = edificio?.suscripcion?.plan?.nombre || 'GRATUITO';
    const planInfo = PLANES[planActual] || PLANES.GRATUITO;
    const PlanIcon = planInfo.icon;

    const planesDisponibles = Object.entries(PLANES).filter(([key]) => key !== planActual);

    const handleSelectPlan = (planKey) => {
        setSelectedPlan(planKey);
    };

    const handleContinue = async () => {
        if (!selectedPlan) {
            toast.error('Selecciona un plan para continuar');
            return;
        }

        setLoading(true);
        try {
            const response = await edificiosService.upgradePlan({
                edificioId: edificio.id,
                nuevoPlan: selectedPlan,
                operacion: 'UPGRADE'
            });

            const data = response.data?.data || response.data;

            if (data?.tokenPago && data?.codigoPago) {
                setPaymentData({
                    tokenPago: data.tokenPago,
                    codigoPago: data.codigoPago,
                    monto: data.monto,
                    planNombre: selectedPlan,
                    expiraEnMinutos: data.expiraEnMinutos || 30
                });
                setStep('payment');
            } else {
                toast.success('Plan actualizado correctamente');
                setStep('success');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Error al iniciar el upgrade';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!paymentData?.tokenPago) return;

        setLoading(true);
        try {
            const response = await edificiosService.upgradePlan({
                edificioId: edificio.id,
                tokenPago: paymentData.tokenPago,
                operacion: 'UPGRADE'
            });

            toast.success('✅ Pago confirmado. Plan actualizado correctamente');
            setStep('success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            const message = error.response?.data?.message || 'Error al confirmar el pago';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(paymentData?.codigoPago || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Código copiado');
    };

    const handleReset = () => {
        setStep('select');
        setSelectedPlan(null);
        setPaymentData(null);
    };

    // Paso 1: Selección de Plan
    if (step === 'select') {
        return (
            <div className="space-y-6">
                {/* Plan Actual */}
                <div className={`rounded-2xl border-2 ${planInfo.borderColor} ${planInfo.bgColor} p-6`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl ${planInfo.bgColor} flex items-center justify-center`}>
                                <PlanIcon size={28} className={planInfo.textColor} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Plan {planInfo.nombre}</h3>
                                <p className="text-gray-500">Plan actual activo</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">S/ {planInfo.precio}</p>
                            <p className="text-xs text-gray-500">mensual</p>
                        </div>
                    </div>
                    {edificio.suscripcion?.fechaFin && planActual !== 'GRATUITO' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Próximo vencimiento: {new Date(edificio.suscripcion.fechaFin).toLocaleDateString('es-PE')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Planes disponibles */}
                <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Mejora tu plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {planesDisponibles.map(([key, plan]) => {
                            const Icon = plan.icon;
                            const isSelected = selectedPlan === key;
                            return (
                                <div
                                    key={key}
                                    className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${isSelected
                                        ? `border-[${roleColors.dark}] shadow-md`
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handleSelectPlan(key)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                                                <Icon size={22} className={plan.textColor} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{plan.nombre}</h4>
                                                <p className="text-xs text-gray-500">mensual</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-800">S/ {plan.precio}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {plan.features.slice(0, 3).map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                {feature.included ? (
                                                    <CheckCircle size={14} className="text-green-500" />
                                                ) : (
                                                    <div className="w-3.5" />
                                                )}
                                                <span className={feature.included ? 'text-gray-600' : 'text-gray-400'}>
                                                    {feature.text}
                                                </span>
                                            </div>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <p className="text-xs text-gray-400">+ {plan.features.length - 3} características más</p>
                                        )}
                                    </div>

                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? `border-[${roleColors.dark}]` : 'border-gray-300'
                                        }`}>
                                        {isSelected && <div className={`w-3 h-3 rounded-full bg-[${roleColors.dark}]`} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Botón continuar */}
                <div className="flex justify-end pt-4">
                    <Button
                        variant="primary"
                        role={userRole}
                        onClick={handleContinue}
                        loading={loading}
                        disabled={!selectedPlan}
                        icon={ChevronRight}
                    >
                        Continuar con el pago
                    </Button>
                </div>
            </div>
        );
    }

    // Paso 2: Simulación de Pago YAPE
    if (step === 'payment' && paymentData) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-2">
                            <Wallet size={18} className="text-teal-600" />
                            <h2 className="font-semibold text-gray-800">Pago por YAPE</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 overflow-hidden">
                                <img
                                    src={Ellipse4}
                                    alt="Yape"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Pago con YAPE</h3>
                            <p className="text-sm text-gray-500">Usa el código de pago para la transacción</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 mb-6">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Código de pago</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex flex-col items-center gap-3">
                                            <QRCodeCanvas
                                                value={paymentData.codigoPago}
                                                size={180}
                                                level="H"
                                                includeMargin={true}
                                            />

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-gray-700">
                                                    {paymentData.codigoPago}
                                                </span>

                                                <button
                                                    onClick={handleCopyCode}
                                                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    {copied
                                                        ? <Check size={16} className="text-green-500" />
                                                        : <Copy size={16} className="text-gray-500" />
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCopyCode}
                                            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Monto a pagar</p>
                                    <p className="text-2xl font-bold text-gray-800">S/ {paymentData.monto}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Instrucciones de pago</p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Para realizar el pago escanear el código QR y luego haz clic en "Confirmar Pago".
                                        La pasarela realizara la correspondiente verificación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-teal-50 rounded-xl p-4 mb-6 border border-teal-200">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                                    <Building2 size={14} className="text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-teal-800">Resumen del upgrade</p>
                                    <div className="mt-2 space-y-1 text-sm text-teal-700">
                                        <p>• Edificio: <strong>{edificio.nombre}</strong></p>
                                        <p>• Plan actual: <strong>{planActual}</strong></p>
                                        <p>• Nuevo plan: <strong>{paymentData.planNombre}</strong></p>
                                        <p>• Monto: <strong>S/ {paymentData.monto}</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={handleReset} fullWidth>
                                Volver
                            </Button>
                            <Button variant="primary" role={userRole} onClick={handleConfirmPayment} loading={loading} fullWidth>
                                Confirmar Pago
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 3: Éxito
    if (step === 'success') {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">¡Pago Confirmado!</h3>
                    <p className="text-gray-500 mb-6">
                        Tu plan ha sido actualizado exitosamente. Los nuevos límites ya están activos.
                    </p>
                    <Button variant="primary" role={userRole} onClick={() => window.location.reload()}>
                        Volver al edificio
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};

export default UpgradePlanPage;