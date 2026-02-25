import React, { useState, useEffect } from 'react';
import { Transaction, storage, HouseholdMember, Currency } from '../lib/storage';
import { rateService } from '../lib/rates';
import { Plus, List, Settings as SettingsIcon, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface DashboardProps {
    household: any;
    onLogout: () => void;
    onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ household, onLogout, onNavigate }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [latestRate, setLatestRate] = useState(rateService.getLatestSavedRate());
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        setTransactions(storage.getTransactions());
    }, []);

    const filteredTransactions = transactions.filter(t => t.date.startsWith(month));

    const totals = filteredTransactions.reduce((acc, t) => {
        if (t.type === 'income') {
            if (t.currency === 'VES') acc.vesIncome += t.amount;
            else acc.usdIncome += t.amount;
        } else if (t.type === 'expense') {
            if (t.currency === 'VES') acc.vesExpense += t.amount;
            else acc.usdExpense += t.amount;
        } else if (t.type === 'usd_purchase') {
            acc.vesExpense += t.vesPaid || 0;
            acc.usdIncome += t.usdReceived || 0;
        }
        return acc;
    }, { vesIncome: 0, vesExpense: 0, usdIncome: 0, usdExpense: 0 });

    const currentVesBalance = totals.vesIncome - totals.vesExpense;
    const currentUsdBalance = totals.usdIncome - totals.usdExpense;
    const vesBalanceInUsd = currentVesBalance / latestRate.rate;

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Resumen de</p>
                    <h1 className="text-2xl font-black">{household.username}</h1>
                </div>
                <button onClick={() => onNavigate('settings')} className="p-2 glass rounded-full">
                    <SettingsIcon size={20} />
                </button>
            </header>

            <section className="space-y-6">
                {/* Balances */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="glass p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-primary/10 group-hover:scale-110 transition-transform">
                            <Wallet size={120} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Balance en USD</p>
                        <h3 className="text-4xl font-black text-primary">${currentUsdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        <div className="mt-4 flex items-center text-xs space-x-2">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full flex items-center">
                                <ArrowUpCircle size={10} className="mr-1" /> +${totals.usdIncome.toFixed(2)}
                            </span>
                            <span className="bg-rose-500/20 text-rose-400 px-2 py-1 rounded-full flex items-center">
                                <ArrowDownCircle size={10} className="mr-1" /> -${totals.usdExpense.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-3xl relative overflow-hidden group">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-tighter">Balance en Bolívares</p>
                        <h3 className="text-3xl font-black">Bs. {currentVesBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            ≈ ${vesBalanceInUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Tasa: {latestRate.rate})
                        </p>
                    </div>
                </div>

                {/* BCV Rate Card */}
                <div className="flex items-center justify-between p-4 glass rounded-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <TrendingUp className="text-primary" size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Tasa BCV Oficial</p>
                            <p className="text-sm font-bold">{latestRate.rate} VES/USD</p>
                        </div>
                    </div>
                    <button onClick={() => onNavigate('rates')} className="text-[10px] bg-secondary px-3 py-1 rounded-full font-bold">
                        AJUSTAR
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onNavigate('add')}
                        className="flex flex-col items-center justify-center p-6 glass rounded-2xl space-y-2 hover:bg-white/10 transition-colors"
                    >
                        <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20">
                            <Plus size={24} />
                        </div>
                        <span className="text-xs font-bold">Nuevo</span>
                    </button>
                    <button
                        onClick={() => onNavigate('transactions')}
                        className="flex flex-col items-center justify-center p-6 glass rounded-2xl space-y-2 hover:bg-white/10 transition-colors"
                    >
                        <div className="bg-secondary p-3 rounded-xl">
                            <List size={24} />
                        </div>
                        <span className="text-xs font-bold">Historial</span>
                    </button>
                </div>
            </section>

            {/* Navigation Bar */}
            <nav className="fixed bottom-6 left-6 right-6 h-16 glass rounded-2xl flex items-center justify-around px-6 shadow-2xl z-50">
                <button onClick={() => onNavigate('dashboard')} className="p-2 text-primary"><Wallet size={24} /></button>
                <button onClick={() => onNavigate('add')} className="p-4 bg-primary text-primary-foreground rounded-2xl -mt-12 shadow-xl shadow-primary/30 active:scale-90 transition-all"><Plus size={28} /></button>
                <button onClick={() => onNavigate('transactions')} className="p-2 text-muted-foreground"><List size={24} /></button>
            </nav>
        </div>
    );
};
