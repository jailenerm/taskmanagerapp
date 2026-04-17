import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Switch, Alert
} from 'react-native';
import { COURSE_COLORS } from '../constants/courseColors';
import { loadTasks, saveTasks } from '../services/storageService';
import { scheduleTaskNotification } from '../services/notificationService';

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isTest, setIsTest] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Oops!', 'Please enter a task title');
      return;
    }
    if (!course.trim()) {
      Alert.alert('Oops!', 'Please enter a course name');
      return;
    }
    if (!dueDate.trim()) {
      Alert.alert('Oops!', 'Please enter a due date');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      course: course.trim(),
      dueDate: dueDate.trim(),
      isTest,
      color: selectedColor,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const existing = await loadTasks();
    await saveTasks([...existing, newTask]);
    await scheduleTaskNotification(newTask);

    Alert.alert('Success!', 'Task added successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.label}>Task Title</Text>
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
        <TextInput
          style={styles.input}
          placeholder="e.g. 12/25/2024"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.label}>Course Color</Text>
        <View style={styles.colorRow}>
          {Object.entries(COURSE_COLORS).map(([name, color]) => (
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
            <Text style={styles.label}>Is this a Test/Exam?</Text>
            <Text style={styles.switchSub}>Enables special reminder</Text>
          </View>
          <Switch
            value={isTest}
            onValueChange={setIsTest}
            trackColor={{ false: '#CBD5E1', true: '#6C63FF' }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#1E293B',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#1E293B',
    transform: [{ scale: 1.2 }],
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  saveBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: { color: '#94A3B8', fontSize: 15 },
});