import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface StudentCardProps {
  student: {
    id: number;
    lastName: string;
    name: string;
    patronymic: string;
    telephone?: string | null;
    email?: string | null;
    birthDate?: string | null;
  };
  onPress?: () => void;
}

export default function StudentCard({ student, onPress }: StudentCardProps) {
  const initials = `${student.lastName} ${student.name.charAt(0)}.${student.patronymic ? ' ' + student.patronymic.charAt(0) + '.' : ''}`;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.lastName.charAt(0)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{initials}</Text>
          <Text style={styles.subtitle}>Студент</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
      <View style={styles.details}>
        {student.telephone && (
          <Text style={styles.detailText}>Тел: {student.telephone}</Text>
        )}
        {student.email && (
          <Text style={styles.detailText}>Email: {student.email}</Text>
        )}
        {student.birthDate && (
          <Text style={styles.detailText}>Дата рождения: {student.birthDate}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#012FA7',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#012FA7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#012FA7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: '#012FA7',
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  detailText: {
    color: '#333',
    fontSize: 13,
    marginBottom: 4,
  },
});