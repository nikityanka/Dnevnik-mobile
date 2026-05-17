import React, { useState, useEffect, useCallback } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet,
  AppState,
  AppStateStatus,
  Platform,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView as ExpoBlurView } from 'expo-blur';
import * as ScreenCapture from 'expo-screen-capture';

const SECURITY_SETTINGS_KEY = 'security_settings';

interface SecuritySettings {
  blockScreenshots: boolean;
  enableBlurOnBackground: boolean;
}

interface SecurityWrapperProps {
  children: React.ReactNode;
  currentRoute?: string;
}

export default function SecurityWrapper({ children, currentRoute }: SecurityWrapperProps) {
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    blockScreenshots: true,
    enableBlurOnBackground: true,
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadSettings();
  }, []);

  // Применяем защиту после загрузки настроек
  useEffect(() => {
    if (settingsLoaded && Platform.OS !== 'web') {
      initScreenProtection();
    }
  }, [settingsLoaded, settings.blockScreenshots]);

  // Подписка на AppState - используем более надежный подход
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (Platform.OS === 'web') {
        return;
      }

      // Не показываем размытие на экране авторизации
      if (currentRoute === 'Login') {
        return;
      }

      // Если размытие отключено в настройках
      if (!settings.enableBlurOnBackground) {
        return;
      }

      // Показываем blur при любом неактивном состоянии
      if (nextAppState !== 'active') {
        setIsBlurVisible(true);
      } else {
        setIsBlurVisible(false);
      }
    };

    // Подписка на изменение состояния приложения
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Также проверяем текущее состояние при монтировании
    if (AppState.currentState !== 'active') {
      setIsBlurVisible(true);
    }
    
    return () => {
      subscription.remove();
    };
  }, [settings.enableBlurOnBackground, currentRoute]);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({
          blockScreenshots: parsed.blockScreenshots ?? true,
          enableBlurOnBackground: parsed.enableBlurOnBackground ?? true,
        });
      }
      setSettingsLoaded(true);
    } catch (error) {
      console.error('Error loading security settings:', error);
      setSettingsLoaded(true);
    }
  };

  const initScreenProtection = async () => {
    // Включаем защиту от скриншотов (только для нативных платформ)
    if (ScreenCapture && Platform.OS !== 'web' && settings.blockScreenshots) {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
      }
    }
  };

  // Для веб-версии - просто возвращаем children без защиты
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  // Показываем размытый экран при сворачивании
  if (isBlurVisible && settings.enableBlurOnBackground) {
    const { width, height } = Dimensions.get('window');
    
    return (
      <View style={stylesBlur.container}>
        <View style={stylesBlur.protectionLayer}>
          <ExpoBlurView 
            intensity={100} 
            tint="dark"
            style={[stylesBlur.blurView, { width, height }]} 
          />
        </View>
        <View style={stylesBlur.fallbackBlur}>
          <Text style={stylesBlur.blurEmoji}>🔒</Text>
          <Text style={stylesBlur.blurText}>Приложение защищено</Text>
          <Text style={stylesBlur.blurSubtext}>Данные скрыты</Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const stylesBlur = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#012FA7',
  },
  protectionLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallbackBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#012FA7',
  },
  blurEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  blurText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  blurSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});