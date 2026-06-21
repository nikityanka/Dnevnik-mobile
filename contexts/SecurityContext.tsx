import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenCapture from 'expo-screen-capture';

const SCREENSHOT_KEY = 'screenshot_protection';
const MINIMIZE_KEY = 'minimize_protection';

interface SecurityContextType {
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
  const loaded = useRef(false);
  const prevAppState = useRef<AppStateStatus>('active');
  const [showOverlay, setShowOverlay] = useState(false);

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
    loaded.current = true;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (prevAppState.current === 'active' && (nextAppState === 'background' || nextAppState === 'inactive')) {
        setShowOverlay(true);
      } else if (nextAppState === 'active') {
        setShowOverlay(false);
      }
      prevAppState.current = nextAppState;
    });
    return () => subscription.remove();
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
      {showOverlay && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.overlayText}>Защита экрана</Text>
          </View>
        </View>
      )}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => useContext(SecurityContext);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#012FA7',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 64,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  overlayText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
