import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProps, RoutePropType } from '../components/types';
import GroupCard from '../components/Subject/Item';
import { styles } from '../styles/GroupsScreen.styles';
import {
  loadGroups,
  toggleGroupSelection,
  handleAddGroups,
  handleDelGroups,
  getSelectedCount,
} from '../utils/GroupsScreen.functions';

export default function GroupsScreen() {
  const navigation = useNavigation<NavigationProps<'Groups'>>();
  const route = useRoute<RoutePropType<'Groups'>>();

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [groups, setGroups] = useState<{ id: number; numberGroup: number }[]>([]);
  const [otherGroups, setOtherGroups] = useState<
    { id: number; numberGroup: number; selected: boolean }[]
  >([]);
  const [currentGroups, setCurrentGroups] = useState<
    { id: number; numberGroup: number; selected: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');

  const { subjectId, userData } = route.params;

  useEffect(() => {
    loadGroups({
      userId: userData.id,
      setGroups,
      setCurrentGroups,
      setOtherGroups,
      setError,
      setLoading,
    });
  }, [subjectId, userData.id]);

  const filteredData = groups.filter(group =>
    group.numberGroup.toString().toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredModalGroups =
    activeTab === 'add'
      ? otherGroups.filter(group =>
          group.numberGroup.toString().toLowerCase().includes(modalSearchQuery.toLowerCase()),
        )
      : currentGroups.filter(group =>
          group.numberGroup.toString().toLowerCase().includes(modalSearchQuery.toLowerCase()),
        );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка групп...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/sloy1.png')} style={styles.backgroundImage} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Список групп</Text>
      </View>

      <View style={styles.searchAdd}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск..."
          placeholderTextColor="#012FA7"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleShowModal} style={styles.addGroupButton}>
          <Image source={require('../assets/gear.png')} style={styles.gearIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredData}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <GroupCard
              title={item.numberGroup.toString()}
              onPress={() => {
                console.log('Переданный ID группы:', item.id.toString());
                navigation.navigate('Students', {
                  subjectId: subjectId,
                  groupId: item.id.toString(),
                  userData: userData,
                });
              }}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Управление группами</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'add' && styles.activeTab]}
                onPress={() => setActiveTab('add')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'add' && styles.activeTabText,
                  ]}
                >
                  Добавить группы
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'remove' && styles.activeTab]}
                onPress={() => setActiveTab('remove')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'remove' && styles.activeTabText,
                  ]}
                >
                  Удалить группы
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalSearchInput}
              placeholder={
                activeTab === 'add'
                  ? 'Поиск группы для добавления...'
                  : 'Поиск группы для удаления...'
              }
              placeholderTextColor="#012FA7"
              value={modalSearchQuery}
              onChangeText={setModalSearchQuery}
            />

            <View style={styles.tabContent}>
              <ScrollView style={styles.groupsList}>
                {filteredModalGroups.map(group => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.groupItem,
                      group.selected && styles.groupItemSelected,
                    ]}
                    onPress={() =>
                      toggleGroupSelection({
                        activeTab,
                        groupId: group.id,
                        otherGroups,
                        setOtherGroups,
                        currentGroups,
                        setCurrentGroups,
                      })
                    }
                  >
                    <View style={styles.checkbox}>
                      {group.selected && <View style={styles.checkboxSelected} />}
                    </View>
                    <Text style={styles.groupItemText}>
                      Группа {group.numberGroup}
                    </Text>
                  </TouchableOpacity>
                ))}

                {filteredModalGroups.length === 0 && (
                  <Text style={styles.noGroupsText}>
                    {activeTab === 'add'
                      ? 'Нет доступных групп для добавления'
                      : 'Нет групп для удаления'}
                  </Text>
                )}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  activeTab === 'add' ? styles.addButton : styles.removeButton,
                  getSelectedCount({ activeTab, otherGroups, currentGroups }) === 0 &&
                    styles.buttonDisabled,
                ]}
                onPress={() =>
                  activeTab === 'add'
                    ? handleAddGroups({
                        subjectId,
                        otherGroups,
                        setShowModal,
                        setGroups,
                        setCurrentGroups,
                        setOtherGroups,
                        setError,
                        setLoading,
                        userId: userData.id,
                      })
                    : handleDelGroups({
                        subjectId,
                        currentGroups,
                        setShowModal,
                        setGroups,
                        setCurrentGroups,
                        setOtherGroups,
                        setError,
                        setLoading,
                        userId: userData.id,
                      })
                }
                disabled={
                  getSelectedCount({ activeTab, otherGroups, currentGroups }) === 0
                }
              >
                <Text style={styles.modalButtonText}>
                  {activeTab === 'add'
                    ? `Добавить выбранные группы (${getSelectedCount({
                        activeTab,
                        otherGroups,
                        currentGroups,
                      })})`
                    : `Удалить выбранные группы (${getSelectedCount({
                        activeTab,
                        otherGroups,
                        currentGroups,
                      })})`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
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
