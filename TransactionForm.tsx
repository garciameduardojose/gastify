import React, { useState } from 'react';
import { Transaction, TransactionType, Currency, storage, HouseholdMember } from '../lib/storage';
import { rateService } from '../lib/rates';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface TransactionFormProps {
    members: HouseholdMember[];
    onBack: () => void;
    onSave: () => void;
    initialData?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ members, onBack, onSave, initialData }) => {
    const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
    const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'VES');
    const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || '');
    const [vesPaid, setVesPaid] = useState<string>(initialData?.vesPaid?.toString() || '');
    const [usdReceived, setUsdReceived] = useState<string>(initialData?.usdReceived?.toString() || '');
    const [category, setCategory] = useState(initialData?.category || 'Comida');
    const [memberId, setMemberId] = useState(initialData?.memberId || members[0]?.id || '');
    const [business, setBusiness] = useState(initialData?.business || '');
    const [date, setDate] = useState(initialData?.date.split('T')[0] || new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');

    const categories = ['Comida', 'Servicios', 'Ocio', 'Salud', 'Hogar', 'Nómina', 'Otros'];

    const handleSubmit = () => {
        if (!memberId) {
            setError('Selecciona quién realiza el movimiento');
            return;
        }

        const currentRate = rateService.getRateForDate(date) || rateService.getLatestSavedRate().rate;

        let newTransaction: Transaction = {
            id: initialData?.id || crypto.randomUUID(),
            date: new Date(date).toISOString(),
            type,
            category: type === 'usd_purchase' ? 'Ahorro' : category,
            amount: type === 'usd_purchase' ? 0 : parseFloat(amount),
            currency: type === 'usd_purchase' ? 'VES' : currency,
            memberId,
            business,
            rateSnapshot: currentRate,
        };

        if (type === 'usd_purchase') {
            const paid = parseFloat(vesPaid);
            const received = parseFloat(usdReceived);
            if (isNaN(paid) || isNaN(received) || received === 0) {
                setError('Montos de compra inválidos');
                return;
            }
            newTransaction.vesPaid = paid;
            newTransaction.usdReceived = received;
            newTransaction.amount = paid;
        } else {
            if (isNaN(newTransaction.amount) || newTransaction.amount <= 0) {
                setError('Monto inválido');
                return;
            }
            if (currency === 'VES') {
                newTransaction.amountUsdComputed = newTransaction.amount / currentRate;
            }
        }

        const allTransactions = storage.getTransactions();
        if (initialData) {
            const index = allTransactions.findIndex(t => t.id === initialData.id);
            allTransactions[index] = newTransaction;
        } else {
            allTransactions.push(newTransaction);
        }

        storage.saveTransactions(allTransactions);
        onSave();
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex items-center space-x-4 mb-8">
                <button onClick={onBack} className="p-2 glass rounded-full"><ArrowLeft size={20} /></button>
                <h1 className="text-xl font-black">{initialData ? 'Editar' : 'Nuevo'} Movimiento</h1>
            </header>

            <div className="space-y-6 max-w-md mx-auto">
                <div className="flex p-1 glass rounded-xl">
                    {(['expense', 'income', 'usd_purchase'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase rounded-lg transition-all ${type === t ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground'
                                }`}
                        >
                            {t === 'expense' ? 'Gasto' : t === 'income' ? 'Ingreso' : 'Compra $'}
                        </button>
                    ))}
                </div>

                <div className="glass p-6 rounded-3xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Pagador/Recibidor</label>
                            <select
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)}
                                className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {type !== 'usd_purchase' ? (
                        <>
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Monto</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-secondary/50 border-none rounded-xl px-4 py-4 text-2xl font-black focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Moneda</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as Currency)}
                                        className="w-full h-[60px] mt-[2px] bg-secondary/50 border-none rounded-xl px-4 text-lg font-bold focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="VES">Bs.</option>
                                        <option value="USD">$</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Categoría</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {categories.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCategory(c)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${category === c ? 'bg-primary text-primary-foreground border-primary' : 'border-white/10 text-muted-foreground'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4 animate-in slide-in-from-right-4 transition-all duration-300">
                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                <div className="flex items-center space-x-2 text-primary mb-2">
                                    <AlertCircle size={14} />
                                    <span className="text-[10px] font-bold uppercase">Ahorro en Dólares</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">VES Pagados</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={vesPaid}
                                            onChange={(e) => setVesPaid(e.target.value)}
                                            className="w-full bg-secondary/30 border-none rounded-xl px-4 py-3 font-bold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">USD Recibidos</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={usdReceived}
                                            onChange={(e) => setUsdReceived(e.target.value)}
                                            className="w-full bg-secondary/30 border-none rounded-xl px-4 py-3 font-bold outline-none"
                                        />
                                    </div>
                                </div>
                                {vesPaid && usdReceived && (
                                    <p className="text-[10px] text-center mt-3 text-muted-foreground">
                                        Tasa efectiva: <span className="text-primary font-black">{(parseFloat(vesPaid) / parseFloat(usdReceived)).toFixed(2)} Bs/$</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Negocio / Detalle (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Automercado, Pago de Nómina..."
                            value={business}
                            onChange={(e) => setBusiness(e.target.value)}
                            className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                {error && <p className="text-destructive text-xs text-center font-bold animate-pulse">{error}</p>}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                    <Save size={20} />
                    <span>{initialData ? 'GUARDAR CAMBIOS' : 'REGISTRAR MOVIMIENTO'}</span>
                </button>
            </div>
        </div>
    );
};
