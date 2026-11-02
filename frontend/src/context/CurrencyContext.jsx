import React, { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

export const USD_EXCHANGE_RATE = 150; // 1 USD = 150 ETB

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('paradise_currency') || 'ETB';
    });

    useEffect(() => {
        localStorage.setItem('paradise_currency', currency);
    }, [currency]);

    const toggleCurrency = () => {
        setCurrency(prev => (prev === 'ETB' ? 'USD' : 'ETB'));
    };

    /**
     * Format price depending on active currency
     * @param {number|string} amountInETB Price in Ethiopian Birr
     * @param {object} options { showBoth?: boolean, forceCurrency?: string }
     */
    const formatPrice = (amountInETB, options = {}) => {
        const val = Number(amountInETB) || 0;
        const activeCurr = options.forceCurrency || currency;

        if (activeCurr === 'USD') {
            const usd = (val / USD_EXCHANGE_RATE).toFixed(2);
            if (options.showBoth) {
                return `$${usd} (${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB)`;
            }
            return `$${usd}`;
        }

        // ETB
        const formattedETB = `${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
        if (options.showBoth) {
            const usd = (val / USD_EXCHANGE_RATE).toFixed(2);
            return `${formattedETB} ($${usd})`;
        }
        return formattedETB;
    };

    const getUsdAmount = (amountInETB) => {
        return ((Number(amountInETB) || 0) / USD_EXCHANGE_RATE).toFixed(2);
    };

    const getEtbAmount = (amountInUSD) => {
        return ((Number(amountInUSD) || 0) * USD_EXCHANGE_RATE).toFixed(2);
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                setCurrency,
                toggleCurrency,
                formatPrice,
                getUsdAmount,
                getEtbAmount,
                exchangeRate: USD_EXCHANGE_RATE,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

