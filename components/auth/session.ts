import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, Teacher } from '../types';

const SESSION_KEY = 'user_session_v1';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

export type SessionUser = Student | Teacher;

type SessionPayload = {
  userData: SessionUser;
  createdAt: number;
};

export async function saveSession(userData: SessionUser) {
  const payload: SessionPayload = {
    userData,
    createdAt: Date.now(),
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export async function loadSession(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);

  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as SessionPayload;
    const isExpired = Date.now() - payload.createdAt > SESSION_TTL_MS;

    if (isExpired) {
      await AsyncStorage.removeItem(SESSION_KEY);
      return null;
    }

    return payload.userData;
  } catch {
    // если вдруг что-то сломалось в формате
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
