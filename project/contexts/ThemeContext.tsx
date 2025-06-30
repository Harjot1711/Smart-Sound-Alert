import React, { createContext, useContext, ReactNode } from 'react';
import { useSoundAlert } from './SoundAlertContext';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  gradient: string[];
  cardBackground: string;
  overlay: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  text: '#1A202C',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  border: '#E2E8F0',
  gradient: ['#FFFFFF', '#F7FAFC', '#EDF2F7'],
  cardBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  primary: '#2B6CB0',
  secondary: '#4C51BF',
  accent: '#805AD5',
  success: '#38A169',
  warning: '#D69E2E',
  error: '#E53E3E',
};

const darkTheme: ThemeColors = {
  background: '#1A202C',
  surface: '#2D3748',
  surfaceSecondary: '#4A5568',
  text: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#A0AEC0',
  border: '#4A5568',
  gradient: ['#1A202C', '#2D3748', '#4A5568'],
  cardBackground: '#2D3748',
  overlay: 'rgba(0, 0, 0, 0.7)',
  primary: '#63B3ED',
  secondary: '#7C3AED',
  accent: '#B794F6',
  success: '#68D391',
  warning: '#F6E05E',
  error: '#FC8181',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { alertSettings } = useSoundAlert();
  const isDark = alertSettings.darkMode;
  
  const colors = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    colors,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}