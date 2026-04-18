import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const CLASSES_KEY = 'classes';

const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#A78BFA', '#FCD34D', '#F97316', '#EC4899',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const loadClasses = async () => {
  try {
    const data = await AsyncStorage.getItem(CLASSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveClasses = async (classes) => {
  try {
    await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  } catch (e) { console.error(e); }
};

export default function ClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [className, setClassName] = useState('');
  const [professor, setProfessor] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        const loaded = await loadClasses();
        setClasses(loaded);
      };
      fetch();
    }, [])
  );

  const openAddModal = () => {
    setEditingClass(null);
    setClassName('');
    setProfessor('');
    setRoom('');
    setStartTime('');
    setEndTime('');
    setSelectedDays([]);
    setSelectedColor('#FF6B6B');
    setModalVisible(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setProfessor(cls.professor || '');
    setRoom(cls.room || '');
    setStartTime(cls.startTime || '');
    setEndTime(cls.endTime || '');
    setSelectedDays(cls.days || []);
    setSelectedColor(cls.color);
    setModalVisible(true);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!className.trim()) {
      Alert.alert('Oops!', 'Please enter a class name');
      return;
    }

    if (editingClass) {
      const updated = classes.map(c =>
        c.id === editingClass.id ? {
          ...c,
          name: className.trim(),
          professor: professor.trim(),
          room: room.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          days: selectedDays,
          color: selectedColor,
        } : c
      );
      setClasses(updated);
      await saveClasses(updated);
    } else {
      const newClass = {
        id: Date.now().toString(),
        name: className.trim(),
        professor: professor.trim(),
        room: room.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        days: selectedDays,
        color: selectedColor,
      };
      const updated = [...classes, newClass];
      setClasses(updated);
      await saveClasses(updated);
    }

    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = classes.filter(c => c.id !== id);
            setClasses(updated);
            await saveClasses(updated);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Classes</Text>
        <Text style={styles.headerSub}>
          {classes.length} class{classes.length !== 1 ? 'es' : ''} this semester
        </Text>
      </View>

      {classes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No classes yet!</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first class</Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: item.color }]}>
              <View style={styles.cardLeft}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <View style={styles.cardInfo}>
                  <Text style={styles.className}>{item.name}</Text>
                  {item.professor ? (
                    <Text style={styles.cardDetail}>{'👤 ' + item.professor}</Text>
                  ) : null}
                  {item.room ? (
                    <Text style={styles.cardDetail}>{'📍 ' + item.room}</Text>
                  ) : null}
                  {item.days && item.days.length > 0 ? (
                    <Text style={styles.cardDetail}>{'📅 ' + item.days.join(', ')}</Text>
                  ) : null}
                  {item.startTime && item.endTime ? (
                    <Text style={styles.cardDetail}>{'⏰ ' + item.startTime + ' - ' + item.endTime}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={openAddModal}
      >
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.label}>Class Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Calculus 101"
              value={className}
              onChangeText={setClassName}
            />

            <Text style={styles.label}>Professor</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dr. Smith"
              value={professor}
              onChangeText={setProfessor}
            />

            <Text style={styles.label}>Room</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Building A, Room 203"
              value={room}
              onChangeText={setRoom}
            />

            <Text style={styles.label}>Meeting Days</Text>
            <View style={styles.daysRow}>
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayBtn,
                    selectedDays.includes(day) && { backgroundColor: selectedColor }
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[
                    styles.dayBtnText,
                    selectedDays.includes(day) && styles.dayBtnTextActive
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Start Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9:00 AM"
              value={startTime}
              onChangeText={setStartTime}
            />

            <Text style={styles.label}>End Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:30 AM"
              value={endTime}
              onChangeText={setEndTime}
            />

            <Text style={styles.label}>Class Color</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {editingClass ? 'Save Changes' : 'Add Class'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#C4C0FF', fontSize: 13, marginTop: 2 },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#94A3B8' },
  emptySubtext: { fontSize: 14, color: '#CBD5E1', marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4 },
  cardInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  cardDetail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  deleteBtnText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  addBtn: {
    position: 'absolute',
    bottom: 30, right: 30,
    backgroundColor: '#6C63FF',
    width: 60, height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 36, lineHeight: 40 },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalClose: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
  modalBody: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0' },
  dayBtnText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  dayBtnTextActive: { color: '#fff' },
  colorRow: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#1E293B', transform: [{ scale: 1.2 }] },
  saveBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});