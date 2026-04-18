import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView, ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { scheduleTaskNotification } from '../src/services/notificationService';
import { loadTasks, saveTasks } from '../src/services/storageService';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [courseColor, setCourseColor] = useState('#FF6B6B');
  const [isTest, setIsTest] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminders, setReminders] = useState({
    week: false,
    day: true,
    hour: false,
    morning: false,
  });
  const [classes, setClasses] = useState([]);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await AsyncStorage.getItem('classes');
        setClasses(data ? JSON.parse(data) : []);
      } catch { setClasses([]); }
    };
    fetchClasses();
  }, []);

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Oops!', 'Please enter a title'); return; }
    if (!course.trim()) { Alert.alert('Oops!', 'Please select or enter a course'); return; }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      course: course.trim(),
      dueDate: formatDate(dueDate),
      isTest,
      reminderDate: reminderDate.toISOString(),
      reminders,
      priority,
      color: courseColor,
      pinned: isTest,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const existing = await loadTasks();
    await saveTasks([...existing, newTask]);
    await scheduleTaskNotification(newTask);

    Alert.alert('Success!', 'Assignment added!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Chapter 5 Essay"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Course</Text>
        {classes.length > 0 ? (
          <TouchableOpacity
            style={styles.coursePickerBtn}
            onPress={() => setShowClassPicker(true)}
          >
            {course ? (
              <View style={styles.courseSelected}>
                <View style={[styles.courseDot, { backgroundColor: courseColor }]} />
                <Text style={styles.courseSelectedText}>{course}</Text>
              </View>
            ) : (
              <Text style={styles.coursePlaceholder}>Select a class...</Text>
            )}
            <Text style={styles.courseArrow}>▾</Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="e.g. English (Add classes first!)"
            value={course}
            onChangeText={setCourse}
          />
        )}

        {classes.length > 0 && (
          <TouchableOpacity onPress={() => setShowClassPicker(true)}>
            <Text style={styles.addManually}>
              {course ? 'Change class' : 'Or type manually'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDuePicker(true)}
        >
          <Text style={styles.dateBtnText}>{'📅 ' + formatDate(dueDate)}</Text>
        </TouchableOpacity>

        {showDuePicker && (
          <View>
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="inline"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setDueDate(selectedDate);
                  setReminderDate(selectedDate);
                }
              }}
            />
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setShowDuePicker(false)}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showDuePicker && (
          <View style={styles.remindersBox}>
            <Text style={styles.remindersTitle}>{'⏰ Reminders'}</Text>
            {[
              { label: '1 week before', key: 'week' },
              { label: '1 day before', key: 'day' },
              { label: '1 hour before', key: 'hour' },
              { label: 'Morning of due date (9 AM)', key: 'morning' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={styles.reminderOption}
                onPress={() => {
                  setReminders(prev => ({
                    ...prev,
                    [option.key]: !prev[option.key]
                  }));
                }}
              >
                <View style={[
                  styles.reminderCheck,
                  reminders[option.key] && styles.reminderCheckActive
                ]}>
                  {reminders[option.key] && (
                    <Text style={styles.reminderCheckMark}>✓</Text>
                  )}
                </View>
                <Text style={styles.reminderOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {['High', 'Medium', 'Low'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.priorityBtn, priority === p && styles[`priority${p}`]]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                {p === 'High' ? '🔴 High' : p === 'Medium' ? '🟡 Medium' : '🟢 Low'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Test/Exam</Text>
            <Text style={styles.switchSub}>Auto pins this assignment</Text>
          </View>
          <Switch
            value={isTest}
            onValueChange={setIsTest}
            trackColor={{ false: '#CBD5E1', true: '#6C63FF' }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Assignment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal
        visible={showClassPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Class</Text>
            <TouchableOpacity onPress={() => setShowClassPicker(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={classes}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.classList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.classItem,
                  course === item.name && styles.classItemActive
                ]}
                onPress={() => {
                  setCourse(item.name);
                  setCourseColor(item.color);
                  setShowClassPicker(false);
                }}
              >
                <View style={[styles.classItemDot, { backgroundColor: item.color }]} />
                <View style={styles.classItemInfo}>
                  <Text style={styles.classItemName}>{item.name}</Text>
                  {item.professor ? (
                    <Text style={styles.classItemDetail}>{'👤 ' + item.professor}</Text>
                  ) : null}
                </View>
                {course === item.name && (
                  <Text style={styles.classItemCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 6, marginTop: 16 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  coursePickerBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseSelected: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courseDot: { width: 12, height: 12, borderRadius: 6 },
  courseSelectedText: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  coursePlaceholder: { fontSize: 15, color: '#94A3B8' },
  courseArrow: { fontSize: 16, color: '#94A3B8' },
  addManually: { fontSize: 12, color: '#6C63FF', marginTop: 6, fontWeight: '500' },
  dateBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  dateBtnText: { fontSize: 15, color: '#1E293B' },
  doneBtn: { backgroundColor: '#6C63FF', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8 },
  doneBtnText: { color: '#fff', fontWeight: '600' },
  remindersBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  remindersTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  reminderOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reminderCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  reminderCheckActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  reminderCheckMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  reminderOptionText: { fontSize: 14, color: '#1E293B' },
  priorityRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  priorityBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#E2E8F0' },
  priorityHigh: { backgroundColor: '#FEE2E2', borderColor: '#FF6B6B' },
  priorityMedium: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  priorityLow: { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' },
  priorityText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  priorityTextActive: { color: '#1E293B' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  switchSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  saveBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#94A3B8', fontSize: 15 },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalClose: { fontSize: 16, color: '#6C63FF', fontWeight: '600' },
  classList: { padding: 16 },
  classItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  classItemActive: { borderColor: '#6C63FF', backgroundColor: '#EEF2FF' },
  classItemDot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  classItemInfo: { flex: 1 },
  classItemName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  classItemDetail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  classItemCheck: { fontSize: 18, color: '#6C63FF', fontWeight: '700' },
});