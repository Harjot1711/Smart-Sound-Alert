import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface SoundAlert {
  id: string;
  type: 'fire' | 'doorbell' | 'baby';
  message: string;
  timestamp: Date;
  confidence?: number;
  dismissed?: boolean;
}

interface SoundAlertContextType {
  currentAlert: SoundAlert | null;
  alertHistory: SoundAlert[];
  isListening: boolean;
  enabledSounds: {
    fire: boolean;
    doorbell: boolean;
    baby: boolean;
  };
  alertSettings: {
    vibration: boolean;
    flashScreen: boolean;
    soundFeedback: boolean;
    darkMode: boolean;
    demoMode: boolean;
  };
  triggerAlert: (type: 'fire' | 'doorbell' | 'baby', confidence?: number) => void;
  dismissAlert: () => void;
  setIsListening: (listening: boolean) => void;
  toggleSoundEnabled: (type: 'fire' | 'doorbell' | 'baby') => void;
  toggleAlertSetting: (setting: keyof SoundAlertContextType['alertSettings']) => void;
  clearHistory: () => void;
}

const SoundAlertContext = createContext<SoundAlertContextType | undefined>(undefined);

export function useSoundAlert() {
  const context = useContext(SoundAlertContext);
  if (!context) {
    throw new Error('useSoundAlert must be used within a SoundAlertProvider');
  }
  return context;
}

interface SoundAlertProviderProps {
  children: ReactNode;
}

export function SoundAlertProvider({ children }: SoundAlertProviderProps) {
  const [currentAlert, setCurrentAlert] = useState<SoundAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<SoundAlert[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [enabledSounds, setEnabledSounds] = useState({
    fire: true,
    doorbell: true,
    baby: true,
  });
  const [alertSettings, setAlertSettings] = useState({
    vibration: true,
    flashScreen: true,
    soundFeedback: true,
    darkMode: false,
    demoMode: false,
  });

  const getAlertMessage = (type: 'fire' | 'doorbell' | 'baby'): string => {
    switch (type) {
      case 'fire':
        return '🚨 Fire Alarm Detected!';
      case 'doorbell':
        return '🔔 Doorbell Detected!';
      case 'baby':
        return '👶 Baby Crying Detected!';
      default:
        return 'Sound Detected!';
    }
  };

  const triggerAlert = useCallback((type: 'fire' | 'doorbell' | 'baby', confidence = 1) => {
    const alert: SoundAlert = {
      id: Date.now().toString(),
      type,
      message: getAlertMessage(type),
      timestamp: new Date(),
      confidence,
    };

    setCurrentAlert(alert);
    setAlertHistory(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts

    // Enhanced vibration patterns
    if (alertSettings.vibration && 'vibrate' in navigator) {
      const pattern = type === 'fire' 
        ? [300, 150, 300, 150, 300, 150, 300] 
        : type === 'doorbell'
        ? [200, 100, 200, 100, 200]
        : [400, 200, 400];
      navigator.vibrate(pattern);
    }
  }, [alertSettings.vibration]);

  const dismissAlert = useCallback(() => {
    if (currentAlert) {
      setAlertHistory(prev => 
        prev.map(alert => 
          alert.id === currentAlert.id 
            ? { ...alert, dismissed: true }
            : alert
        )
      );
    }
    setCurrentAlert(null);
  }, [currentAlert]);

  const toggleSoundEnabled = useCallback((type: 'fire' | 'doorbell' | 'baby') => {
    setEnabledSounds(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  const toggleAlertSetting = useCallback((setting: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setAlertHistory([]);
  }, []);

  const value: SoundAlertContextType = {
    currentAlert,
    alertHistory,
    isListening,
    enabledSounds,
    alertSettings,
    triggerAlert,
    dismissAlert,
    setIsListening,
    toggleSoundEnabled,
    toggleAlertSetting,
    clearHistory,
  };

  return (
    <SoundAlertContext.Provider value={value}>
      {children}
    </SoundAlertContext.Provider>
  );
}