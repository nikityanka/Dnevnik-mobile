import { Alert, ActivityIndicator } from 'react-native';

export const showError = (message: string) => {
  Alert.alert('Ошибка', message);
};

export const showSuccess = (message: string) => {
  Alert.alert('Успешно', message);
};

export const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <ActivityIndicator 
      size="large" 
      color="#012FA7" 
      style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 999 
      }} 
    />
  );
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};