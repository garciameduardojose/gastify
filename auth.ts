import { storage, Household, HouseholdMember } from './storage';

// Simple hash implementation for PIN (in a real app, use a proper crypto library)
const hashPin = (pin: string) => {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
};

export const authService = {
    register: (username: string, pin: string, memberNames: string[]): Household => {
        const household: Household = {
            id: crypto.randomUUID(),
            username,
            pinHash: hashPin(pin),
            members: memberNames.map(name => ({ id: crypto.randomUUID(), name })),
        };
        storage.saveHousehold(household);
        localStorage.setItem('hf_session', household.id);
        return household;
    },

    login: (username: string, pin: string): Household | null => {
        const household = storage.getHousehold();
        if (household && household.username === username && household.pinHash === hashPin(pin)) {
            localStorage.setItem('hf_session', household.id);
            return household;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem('hf_session');
    },

    getCurrentSession: (): string | null => {
        return localStorage.getItem('hf_session');
    },

    updateMembers: (memberNames: string[]) => {
        const household = storage.getHousehold();
        if (household) {
            household.members = memberNames.map(name => ({ id: crypto.randomUUID(), name }));
            storage.saveHousehold(household);
        }
    },

    updatePin: (newPin: string) => {
        const household = storage.getHousehold();
        if (household) {
            household.pinHash = hashPin(newPin);
            storage.saveHousehold(household);
        }
    }
};
