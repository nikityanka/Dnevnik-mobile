import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { useState } from 'react';
import { updateMark, addMark, deleteMark } from '../FetchData/marksApi';
import { StudentRowProps } from '../types';

export default function StudentRow({ student, onUpdateRating, subjectId, groupId, onDataUpdate }: StudentRowProps) {
  const [editingMark, setEditingMark] = useState<{ number: number, value: number | null } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isAddingMark, setIsAddingMark] = useState(false);

  const getRatingBackgroundColor = (rating: number | null): string => {
    if (rating === null || rating === undefined || rating.toString() === '-') return 'lightgray';
    if (rating >= 5) return '#4AB47B';
    if (rating >= 4) return '#4B9B70';
    if (rating >= 3) return '#FFA742';
    return '#CE3E3E';
  };

  const handleShowModal = (markNumber: number, markValue: number | null) => {
    setEditingMark({ number: markNumber, value: markValue });
    setInputValue(markValue?.toString() || '');
    setShowModal(true);
    setIsAddingMark(false);
  };

  const handleEditMark = async () => {
    if (!editingMark) return;

    const parsedRating = parseFloat(inputValue);
    if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
      try {
        await updateMark(student.id, subjectId, parsedRating, editingMark.number);

        if (onUpdateRating) {
          onUpdateRating(student.id, editingMark.number, parsedRating);
        }

        if (onDataUpdate) {
          setTimeout(() => {
            onDataUpdate();
          }, 100);
        }

        setShowModal(false);
        setEditingMark(null);
        setInputValue('');
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось обновить оценку.');
      }
    } else {
      Alert.alert('Ошибка', 'Оценка должна быть числом от 1 до 5.');
    }
  };

  const handleAddMark = async () => {
    const parsedRating = parseFloat(inputValue);
    if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
      try {
        const existingNumbers = student.ratings.map((m: any) => m.number);
        const newMarkNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

        await addMark(student.id, subjectId, parsedRating, groupId, newMarkNumber);

        if (onUpdateRating) {
          onUpdateRating(student.id, newMarkNumber, parsedRating);
        }

        if (onDataUpdate) {
          setTimeout(() => {
            onDataUpdate();
          }, 100);
        }

        setIsAddingMark(false);
        setShowModal(false);
        setInputValue('');
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось добавить оценку.');
      }
    } else {
      Alert.alert('Ошибка', 'Оценка должна быть числом от 1 до 5.');
    }
  };

  const handleDeleteMark = async () => {
    if (!editingMark) return;

    try {
      await deleteMark(student.id, subjectId, editingMark.number);

      if (onUpdateRating) {
        onUpdateRating(student.id, editingMark.number, null);
      }

      if (onDataUpdate) {
        setTimeout(() => {
          onDataUpdate();
        }, 100);
      }

      setShowModal(false);
      setEditingMark(null);
      setInputValue('');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось удалить оценку.');
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.marksContainer}
      >
        {onUpdateRating && (
          <TouchableOpacity
            style={[styles.markCell, styles.addMarkCell]}
            onPress={() => {
              setIsAddingMark(true);
              setEditingMark(null);
              setInputValue('');
              setShowModal(true);
            }}
          >
            <Text style={styles.addMarkText}>+</Text>
          </TouchableOpacity>
        )}

        {student.ratings
          .map((mark: any) => (
            <TouchableOpacity
              key={`mark-${mark.number}`}
              style={[
                styles.markCell,
                { backgroundColor: getRatingBackgroundColor(mark.value) },
              ]}
              onPress={() => {
                if (onUpdateRating) {
                  handleShowModal(mark.number, mark.value);
                }
              }}
            >
              <Text style={styles.markText}>
                {mark.value !== null && mark.value !== undefined ? mark.value.toString() : ''}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isAddingMark ? 'Добавление оценки' : 'Редактирование оценки'}
            </Text>

            {!isAddingMark && editingMark && (
              <View>
                <Text style={styles.markNumberText}>
                  Номер оценки: {editingMark.number}
                </Text>
                <Text style={styles.currentValueText}>
                  Текущее значение: {editingMark.value || 'нет'}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Введите оценку от 1 до 5"
              placeholderTextColor="#012FA7"
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
              maxLength={4}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              {isAddingMark ? (
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.addButton,
                    (!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5) && styles.buttonDisabled
                  ]}
                  onPress={handleAddMark}
                  disabled={!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5}
                >
                  <Text style={styles.modalButtonText}>Добавить оценку</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.editButton,
                      (!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5) && styles.buttonDisabled
                    ]}
                    onPress={handleEditMark}
                    disabled={!inputValue || parseInt(inputValue) < 1 || parseInt(inputValue) > 5}
                  >
                    <Text style={styles.modalButtonText}>Изменить оценку</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteMark}
                  >
                    <Text style={styles.modalButtonText}>Удалить оценку</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsAddingMark(false);
                  setEditingMark(null);
                  setShowModal(false);
                  setInputValue('');
                }}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  markCell: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
  },
  markText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addMarkCell: {
    backgroundColor: '#012FA7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMarkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderColor: '#012FA7',
    borderWidth: 2,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#012FA7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  markNumberText: {
    color: '#012FA7',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  currentValueText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    color: '#012FA7',
    borderWidth: 1,
    borderColor: '#012FA7',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  editButton: {
    backgroundColor: '#012FA7',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});