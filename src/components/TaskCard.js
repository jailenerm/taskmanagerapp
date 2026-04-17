import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TaskCard({ task, onDelete, onComplete }) {
  return (
    <View style={[styles.card, { borderLeftColor: task.color, opacity: task.completed ? 0.5 : 1 }]}>
      <View style={styles.info}>
        <Text style={[styles.title, task.completed && styles.completed]}>
          {task.title}
        </Text>
        <Text style={styles.course}>{task.course}</Text>
        <Text style={styles.due}>Due: {task.dueDate}</Text>
        {task.isTest && (
          <View style={styles.testBadge}>
            <Text style={styles.testText}>TEST</Text>
          </View>
        )}
        {task.priority && (
          <View style={[styles.priorityBadge, {
            backgroundColor:
              task.priority === 'High' ? '#FEE2E2' :
              task.priority === 'Medium' ? '#FEF3C7' : '#DCFCE7'
          }]}>
            <Text style={[styles.priorityBadgeText, {
              color:
                task.priority === 'High' ? '#DC2626' :
                task.priority === 'Medium' ? '#D97706' : '#16A34A'
            }]}>
              {task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'} {task.priority}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: task.completed ? '#CBD5E1' : '#6C63FF' }]}
          onPress={() => onComplete(task.id)}
        >
          <Text style={styles.btnText}>{task.completed ? 'Undo' : 'Done'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#FF6B6B' }]}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  completed: { textDecorationLine: 'line-through', color: '#94A3B8' },
  course: { fontSize: 13, color: '#64748B', marginBottom: 2 },
  due: { fontSize: 12, color: '#94A3B8' },
  testBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  testText: { fontSize: 11, color: '#D97706', fontWeight: '700' },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priorityBadgeText: { fontSize: 11, fontWeight: '700' },
  actions: { justifyContent: 'center', gap: 8 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
