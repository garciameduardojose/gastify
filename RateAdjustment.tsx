import React, { useState } from 'react';
import { rateService } from '../lib/rates';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';

interface RateAdjustmentProps {
    onBack: () => void;
    onSave: () => void;
}

export const RateAdjustment: React.FC<RateAdjustmentProps> = ({ onBack, onSave }) => {
    const [rate, setRate] = useState(rateService.getLatestSavedRate().rate.toString());
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSave = () => {
        const val = parseFloat(rate);
        if (!isNaN(val) && val > 0) {
            rateService.saveRate(date, val);
            onSave();
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex items-center space-x-4 mb-8">
                <button onClick={onBack} className="p-2 glass rounded-full"><ArrowLeft size={20} /></button>
                <h1 className="text-xl font-black">Ajustar Tasa BCV</h1>
            </header>

            <div className="space-y-6 max-w-sm mx-auto">
                <div className="glass p-8 rounded-3xl space-y-6 text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp size={40} className="text-primary" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Fecha de Aplicación</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Tasa Oficial (VES por 1 USD)</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="w-full bg-secondary/50 border-none rounded-xl px-4 py-4 text-3xl font-black text-center focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                        Esta tasa se usará para convertir tus gastos en Bolívares a Dólares y calcular tus balances equivalentes.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                    <Save size={20} />
                    <span>GUARDAR TASA</span>
                </button>
            </div>
        </div>
    );
};
