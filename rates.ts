import { storage } from './storage';

const DEFAULT_RATE = 407.38; // Last known BCV rate from my search

export const rateService = {
    fetchLatestRate: async (): Promise<number> => {
        try {
            // In a real browser environment, we'd use a proxy or a specialized API
            // For this MVP, we simulate the fetch.
            // If we had a backend edge function, it would scrape bcv.org.ve
            return DEFAULT_RATE;
        } catch (error) {
            console.error('Error fetching BCV rate:', error);
            return DEFAULT_RATE;
        }
    },

    getRateForDate: (date: string): number | null => {
        const rates = storage.getRates();
        return rates[date] || null;
    },

    saveRate: (date: string, rate: number) => {
        const rates = storage.getRates();
        rates[date] = rate;
        storage.saveRates(rates);
    },

    getLatestSavedRate: (): { rate: number; date: string } => {
        const rates = storage.getRates();
        const dates = Object.keys(rates).sort().reverse();
        if (dates.length > 0) {
            return { rate: rates[dates[0]], date: dates[0] };
        }
        const today = new Date().toISOString().split('T')[0];
        return { rate: DEFAULT_RATE, date: today };
    }
};
