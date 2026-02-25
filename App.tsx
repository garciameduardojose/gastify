import React, { useState, useEffect } from 'react';
import { storage, Household, Transaction } from './lib/storage';
import { authService } from './lib/auth';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Settings } from './components/Settings';
import { RateAdjustment } from './components/RateAdjustment';

type View = 'login' | 'dashboard' | 'add' | 'edit' | 'transactions' | 'settings' | 'rates';

function App() {
    const [view, setView] = useState<View>('login');
    const [household, setHousehold] = useState<Household | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        const sessionId = authService.getCurrentSession();
        const storedHousehold = storage.getHousehold();
        if (sessionId && storedHousehold && storedHousehold.id === sessionId) {
            setHousehold(storedHousehold);
            setView('dashboard');
        }
    }, []);

    const handleLogin = (data: Household) => {
        setHousehold(data);
        setView('dashboard');
    };

    const handleLogout = () => {
        authService.logout();
        setHousehold(null);
        setView('login');
    };

    const handleUpdate = () => {
        setHousehold(storage.getHousehold());
    };

    const navigateToEdit = (t: Transaction) => {
        setEditingTransaction(t);
        setView('edit');
    };

    if (!household && view !== 'login') {
        setView('login');
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {view === 'login' && <Login onLogin={handleLogin} />}

            {household && (
                <>
                    {view === 'dashboard' && (
                        <Dashboard
                            household={household}
                            onLogout={handleLogout}
                            onNavigate={(v) => setView(v as View)}
                        />
                    )}

                    {(view === 'add' || view === 'edit') && (
                        <TransactionForm
                            members={household.members}
                            onBack={() => setView('dashboard')}
                            onSave={() => setView('dashboard')}
                            initialData={view === 'edit' ? editingTransaction! : undefined}
                        />
                    )}

                    {view === 'transactions' && (
                        <TransactionList
                            members={household.members}
                            onBack={() => setView('dashboard')}
                            onEdit={navigateToEdit}
                        />
                    )}

                    {view === 'settings' && (
                        <Settings
                            household={household}
                            onUpdate={handleUpdate}
                            onBack={() => setView('dashboard')}
                            onLogout={handleLogout}
                        />
                    )}

                    {view === 'rates' && (
                        <RateAdjustment
                            onBack={() => setView('dashboard')}
                            onSave={() => setView('dashboard')}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;
