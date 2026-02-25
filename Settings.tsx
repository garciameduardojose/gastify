import React, { useState } from 'react';
import { authService } from '../lib/auth';
import { ArrowLeft, UserPlus, Trash2, Key, LogOut } from 'lucide-react';

interface SettingsProps {
    household: any;
    onUpdate: () => void;
    onBack: () => void;
    onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ household, onUpdate, onBack, onLogout }) => {
    const [memberNames, setMemberNames] = useState(household.members.map((m: any) => m.name));
    const [newPin, setNewPin] = useState('');
    const [message, setMessage] = useState('');

    const handleUpdateMembers = () => {
        const filtered = memberNames.filter((n: string) => n.trim() !== '');
        if (filtered.length === 0) return;
        authService.updateMembers(filtered);
        setMessage('Miembros actualizados');
        onUpdate();
    };

    const handleChangePin = () => {
        if (newPin.length === 4) {
            authService.updatePin(newPin);
            setMessage('PIN actualizado');
            setNewPin('');
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <header className="flex items-center space-x-4 mb-8">
                <button onClick={onBack} className="p-2 glass rounded-full"><ArrowLeft size={20} /></button>
                <h1 className="text-xl font-black">Ajustes del Hogar</h1>
            </header>

            <div className="space-y-8 max-w-md mx-auto">
                {/* Members Management */}
                <div className="glass p-6 rounded-3xl space-y-4">
                    <div className="flex items-center space-x-2 text-primary mb-2">
                        <UserPlus size={18} />
                        <h2 className="text-xs font-black uppercase tracking-widest">Miembros de {household.username}</h2>
                    </div>
                    <div className="space-y-3">
                        {memberNames.map((name: string, index: number) => (
                            <div key={index} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        const next = [...memberNames];
                                        next[index] = e.target.value;
                                        setMemberNames(next);
                                    }}
                                    className="flex-1 bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm outline-none"
                                />
                                <button
                                    onClick={() => setMemberNames(memberNames.filter((_: any, i: number) => i !== index))}
                                    className="p-3 text-rose-400 hover:bg-rose-400/10 rounded-xl"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => setMemberNames([...memberNames, ''])}
                            className="w-full py-3 bg-secondary/30 rounded-xl text-xs font-bold text-muted-foreground uppercase"
                        >
                            + Añadir otra persona
                        </button>
                        <button
                            onClick={handleUpdateMembers}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-black shadow-lg"
                        >
                            Guardar Miembros
                        </button>
                    </div>
                </div>

                {/* PIN Management */}
                <div className="glass p-6 rounded-3xl space-y-4">
                    <div className="flex items-center space-x-2 text-primary mb-2">
                        <Key size={18} />
                        <h2 className="text-xs font-black uppercase tracking-widest">Cambiar PIN</h2>
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="Nuevo PIN 4 dígitos"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 bg-secondary/50 border-none rounded-xl px-4 py-3 text-sm outline-none font-mono tracking-widest"
                        />
                        <button
                            onClick={handleChangePin}
                            className="px-6 py-3 bg-secondary rounded-xl font-bold text-xs uppercase"
                        >
                            Cambiar
                        </button>
                    </div>
                </div>

                {message && <p className="text-emerald-400 text-xs text-center font-bold tracking-tight">{message}</p>}

                {/* Danger Zone */}
                <button
                    onClick={onLogout}
                    className="w-full py-5 rounded-2xl border border-rose-500/20 text-rose-400 font-extrabold flex items-center justify-center space-x-2 hover:bg-rose-500/5 transition-colors"
                >
                    <LogOut size={20} />
                    <span>CERRAR SESIÓN</span>
                </button>
            </div>
        </div>
    );
};
