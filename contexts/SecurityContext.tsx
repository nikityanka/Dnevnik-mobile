import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenCapture from 'expo-screen-capture';

const SCREENSHOT_KEY = 'screenshot_protection';
const MINIMIZE_KEY = 'minimize_protection';

export interface SecurityContextType {
  screenshotProtection: boolean;
  minimizeProtection: boolean;
  toggleScreenshotProtection: () => void;
  toggleMinimizeProtection: () => void;
}

const SecurityContext = createContext<SecurityContextType>({
  screenshotProtection: false,
  minimizeProtection: false,
  toggleScreenshotProtection: () => {},
  toggleMinimizeProtection: () => {},
});

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [screenshotProtection, setScreenshotProtection] = useState(false);
  const [minimizeProtection, setMinimizeProtection] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SCREENSHOT_KEY).then(val => {
      if (val === 'true') {
        setScreenshotProtection(true);
        ScreenCapture.preventScreenCaptureAsync().catch(() => {});
      }
    });
    AsyncStorage.getItem(MINIMIZE_KEY).then(val => {
      if (val === 'true') setMinimizeProtection(true);
    });
  }, []);

  const toggleScreenshotProtection = useCallback(async () => {
    const next = !screenshotProtection;
    setScreenshotProtection(next);
    await AsyncStorage.setItem(SCREENSHOT_KEY, String(next));
    if (next) {
      await ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    } else {
      await ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    }
  }, [screenshotProtection]);

  const toggleMinimizeProtection = useCallback(async () => {
    const next = !minimizeProtection;
    setMinimizeProtection(next);
    await AsyncStorage.setItem(MINIMIZE_KEY, String(next));
  }, [minimizeProtection]);

  return (
    <SecurityContext.Provider
      value={{
        screenshotProtection,
        minimizeProtection,
        toggleScreenshotProtection,
        toggleMinimizeProtection,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => useContext(SecurityContext);
