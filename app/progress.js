import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    SafeAreaView, ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { loadTasks } from '../src/services/storageService';

export default function ProgressScreen() {
  const [tasks, setTasks] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        const loaded = await loadTasks();
        setTasks(loaded);
      };
      fetch();
    }, [])
  );

  const courses = [...new Set(tasks.map(t => t.course))];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Progress</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {courses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks yet!</Text>
            <Text style={styles.emptySubtext}>Add tasks to see your progress</Text>
          </View>
        ) : (
          courses.map(course => {
            const courseTasks = tasks.filter(t => t.course === course);
            const completed = courseTasks.filter(t => t.completed).length;
            const total = courseTasks.length;
            const percent = Math.round((completed / total) * 100);
            const color = courseTasks[0]?.color || '#6C63FF';

            return (
              <View key={course} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.courseName}>{course}</Text>
                  <Text style={styles.percent}>{percent}%</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.taskCount}>{completed} of {total} tasks done</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  scroll: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#94A3B8' },
  emptySubtext: { fontSize: 14, color: '#CBD5E1', marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  courseName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  percent: { fontSize: 16, fontWeight: '700', color: '#6C63FF' },
  barBg: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, marginBottom: 8 },
  barFill: { height: 10, borderRadius: 5 },
  taskCount: { fontSize: 12, color: '#94A3B8' },
});