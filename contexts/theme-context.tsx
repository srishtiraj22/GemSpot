/**
 * Theme Context — App-wide dark/light mode support with AsyncStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Theme } from '@/constants/theme';

const THEME_KEY = '@gemspots_theme';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    theme: typeof Theme.light;
    colors: typeof Colors & {
        background: string;
        surface: string;
        card: string;
        cardElevated: string;
        border: string;
        text: string;
        textSecondary: string;
        textMuted: string;
    };
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => {},
    theme: Theme.light,
    colors: {
        ...Colors,
        background: Colors.backgroundLight,
        surface: Colors.surfaceLight,
        card: Colors.cardLight,
        cardElevated: Colors.cardLightElevated,
        border: Colors.borderLight,
        text: Colors.textPrimaryLight,
        textSecondary: Colors.textSecondaryLight,
        textMuted: Colors.textMutedLight,
    },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then((val) => {
            if (val === 'dark') setIsDark(true);
        });
    }, []);

    const toggleTheme = () => {
        const newVal = !isDark;
        setIsDark(newVal);
        AsyncStorage.setItem(THEME_KEY, newVal ? 'dark' : 'light');
    };

    const theme = isDark ? Theme.dark : Theme.light;

    const colors = {
        ...Colors,
        background: isDark ? Colors.backgroundDark : Colors.backgroundLight,
        surface: isDark ? Colors.surfaceDark : Colors.surfaceLight,
        card: isDark ? Colors.cardDark : Colors.cardLight,
        cardElevated: isDark ? Colors.cardDarkElevated : Colors.cardLightElevated,
        border: isDark ? Colors.borderDark : Colors.borderLight,
        text: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
        textSecondary: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight,
        textMuted: isDark ? Colors.textMutedDark : Colors.textMutedLight,
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}
