import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView, ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { COURSE_COLORS } from '../src/constants/courseColors';
import { scheduleTaskNotification } from '../src/services/notificationService';
import { loadTasks, saveTasks } from '../src/services/storageService';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [isTest, setIsTest] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
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
  const router = useRouter();

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Oops!', 'Please enter a title'); return; }
    if (!course.trim()) { Alert.alert('Oops!', 'Please enter a course name'); return; }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      course: course.trim(),
      dueDate: formatDate(dueDate),
      isTest,
      reminderDate: reminderDate.toISOString(),
      reminders,
      priority,
      color: selectedColor,
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

        <Text style={styles.label}>Course Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. English"
          value={course}
          onChangeText={setCourse}
        />

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

        <Text style={styles.label}>Course Color</Text>
        <View style={styles.colorRow}>
          {Object.values(COURSE_COLORS).map(color => (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 6, marginTop: 16 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0' },
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
  colorRow: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: '#1E293B', transform: [{ scale: 1.2 }] },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  switchSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  saveBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#94A3B8', fontSize: 15 },
});