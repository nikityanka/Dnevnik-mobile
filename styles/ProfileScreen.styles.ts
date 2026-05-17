import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingTop: 32,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#012FA7',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#012FA7',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#000000',
    marginTop: 2,
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#012FA7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Стили для настроек безопасности
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
