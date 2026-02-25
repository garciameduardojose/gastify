import React, { useState } from 'react';
import { Transaction, storage, HouseholdMember } from '../lib/storage';
import { ArrowLeft, Filter, Trash2, Edit3, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

interface TransactionListProps {
    members: HouseholdMember[];
    onBack: () => void;
    onEdit: (t: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ members, onBack, onEdit }) => {
    const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions().sort((a, b) => b.date.localeCompare(a.date)));
    const [filter, setFilter] = useState<'all' | 'expense' | 'income' | 'usd_purchase'>('all');

    const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Anon';

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar este movimiento?')) {
            const updated = transactions.filter(t => t.id !== id);
            storage.saveTransactions(updated);
            setTransactions(updated);
        }
    };

    const filtered = transactions.filter(t => filter === 'all' || t.type === filter);

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 glass rounded-full"><ArrowLeft size={20} /></button>
                    <h1 className="text-xl font-black">Historial</h1>
                </div>
                <div className="flex bg-secondary/50 p-1 rounded-xl">
                    {(['all', 'expense', 'income', 'usd_purchase'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                                }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'expense' ? 'G' : f === 'income' ? 'I' : '$'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No hay movimientos registrados.</p>
                    </div>
                ) : (
                    filtered.map(t => (
                        <div key={t.id} className="glass p-4 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' :
                                        t.type === 'usd_purchase' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                    {t.type === 'income' ? <ArrowUpRight size={20} /> :
                                        t.type === 'usd_purchase' ? <Wallet size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black">{t.business || t.category}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                        {new Date(t.date).toLocaleDateString()} • {getMemberName(t.memberId)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex items-center space-x-4">
                                <div>
                                    <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-400' :
                                            t.type === 'usd_purchase' ? 'text-amber-400' : 'text-foreground'
                                        }`}>
                                        {t.type === 'usd_purchase' ? `+$${t.usdReceived}` :
                                            `${t.currency === 'USD' ? '$' : 'Bs.'}${t.amount.toLocaleString()}`}
                                    </p>
                                    {t.currency === 'VES' && t.amountUsdComputed && (
                                        <p className="text-[10px] text-muted-foreground">≈ ${t.amountUsdComputed.toFixed(2)}</p>
                                    )}
                                </div>
                                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEdit(t)} className="text-muted-foreground hover:text-primary"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
