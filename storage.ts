export type Currency = 'VES' | 'USD';
export type TransactionType = 'income' | 'expense' | 'usd_purchase';

export interface HouseholdMember {
    id: string;
    name: string;
}

export interface Household {
    id: string;
    username: string;
    pinHash: string;
    members: HouseholdMember[];
}

export interface Transaction {
    id: string;
    date: string; // ISO string
    type: TransactionType;
    category: string;
    amount: number;
    currency: Currency;
    memberId: string;
    business?: string;
    notes?: string;
    rateSnapshot?: number;
    amountUsdComputed?: number;
    // For usd_purchase
    vesPaid?: number;
    usdReceived?: number;
}

export interface ExchangeRate {
    date: string; // YYYY-MM-DD
    rate: number;
}

const STORAGE_KEYS = {
    HOUSEHOLD: 'hf_household',
    TRANSACTIONS: 'hf_transactions',
    RATES: 'hf_rates',
    SESSION: 'hf_session',
};

export const storage = {
    getHousehold: (): Household | null => {
        const data = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD);
        return data ? JSON.parse(data) : null;
    },
    saveHousehold: (household: Household) => {
        localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(household));
    },
    getTransactions: (): Transaction[] => {
        const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    },
    saveTransactions: (transactions: Transaction[]) => {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },
    getRates: (): Record<string, number> => {
        const data = localStorage.getItem(STORAGE_KEYS.RATES);
        return data ? JSON.parse(data) : {};
    },
    saveRates: (rates: Record<string, number>) => {
        localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
    },
    clear: () => {
        localStorage.clear();
    },
};
