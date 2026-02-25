import React, { useState } from 'react';
import { authService } from '../lib/auth';

interface LoginProps {
    onLogin: (household: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [memberNames, setMemberNames] = useState(['', '']);
    const [error, setError] = useState('');

    const handleAction = () => {
        if (!username || pin.length !== 4) {
            setError('Usuario y PIN de 4 dígitos requeridos');
            return;
        }

        if (isRegistering) {
            const filteredMembers = memberNames.filter(name => name.trim() !== '');
            if (filteredMembers.length === 0) {
                setError('Al menos un miembro es requerido');
                return;
            }
            const household = authService.register(username, pin, filteredMembers);
            onLogin(household);
        } else {
            const household = authService.login(username, pin);
            if (household) {
                onLogin(household);
            } else {
                setError('Usuario o PIN incorrectos');
            }
        }
    };

    const addMember = () => setMemberNames([...memberNames, '']);
    const updateMember = (index: number, name: string) => {
        const newMembers = [...memberNames];
        newMembers[index] = name;
        setMemberNames(newMembers);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-sm mx-auto">
            <div className="w-full space-y-8 glass p-8 rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight">Hogar Finanzas</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isRegistering ? 'Crea un nuevo hogar' : 'Ingresa a tu cuenta'}
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Usuario</label>
                        <input
                            type="text"
                            className="w-full bg-secondary/50 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="Nombre del hogar"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">PIN (4 dígitos)</label>
                        <input
                            type="password"
                            maxLength={4}
                            className="w-full bg-secondary/50 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none text-center tracking-[1em] font-mono text-xl"
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    {isRegistering && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Miembros</label>
                            {memberNames.map((name, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder={`Miembro ${index + 1}`}
                                    value={name}
                                    onChange={(e) => updateMember(index, e.target.value)}
                                />
                            ))}
                            <button
                                onClick={addMember}
                                className="text-xs text-primary underline py-1"
                            >
                                + Añadir persona
                            </button>
                        </div>
                    )}

                    {error && <p className="text-destructive text-xs text-center font-medium">{error}</p>}

                    <button
                        onClick={handleAction}
                        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                        {isRegistering ? 'Crear Hogar' : 'Entrar'}
                    </button>

                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isRegistering ? '¿Ya tienes un hogar? Entra aquí' : '¿No tienes cuenta? Registra tu hogar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
