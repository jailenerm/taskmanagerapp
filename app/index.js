import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import TaskCard from '../src/components/TaskCard';
import { deleteTask, loadTasks, saveTasks } from '../src/services/storageService';

export default function DashboardScreen() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        const loaded = await loadTasks();
        setTasks(loaded);
      };
      fetchTasks();
    }, [])
  );

  const handleDelete = async (taskId) => {
    const updated = await deleteTask(taskId);
    setTasks(updated);
  };

  const handleComplete = async (taskId) => {
    const updated = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  const handlePin = async (taskId) => {
    const updated = tasks.map(task =>
      task.id === taskId ? { ...task, pinned: !task.pinned } : task
    );
    setTasks(updated);
    await saveTasks(updated);
  };

  const filters = ['All', 'Pending', 'Completed'];

  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'Pending') return !task.completed;
      if (filter === 'Completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Assignments</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No assignments yet!</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first assignment</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onPin={handlePin}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/add-task')}
      >
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/classes')}
        >
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navLabel}>Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/progress')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Progress</Text>
        </TouchableOpacity>
        <View style={styles.navSpacer} />
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/study-timer')}
        >
          <Text style={styles.navIcon}>⏱</Text>
          <Text style={styles.navLabel}>Timer</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', padding: 16, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0' },
  filterActive: { backgroundColor: '#6C63FF' },
  filterText: { color: '#64748B', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#94A3B8' },
  emptySubtext: { fontSize: 14, color: '#CBD5E1', marginTop: 8 },
  addBtn: {
    position: 'absolute',
    bottom: 110, right: 30,
    backgroundColor: '#6C63FF',
    width: 60, height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 36, lineHeight: 40 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navBtn: { alignItems: 'center', flex: 1 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 11, color: '#6C63FF', marginTop: 2, fontWeight: '500' },
  navSpacer: { flex: 1 },
});