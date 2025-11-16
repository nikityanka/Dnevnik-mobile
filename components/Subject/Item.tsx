// components/Subject/Item.tsx
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default function SubjectCard({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderColor: '#012FA7',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#012FA7',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});