import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TaskCard({ task, onDelete, onComplete, onPin, onEdit }) {
  return (
    <View style={[
      styles.card,
      { borderLeftColor: task.color },
      task.pinned && styles.pinnedCard,
      { opacity: task.completed ? 0.5 : 1 }
    ]}>

      <TouchableOpacity
        style={styles.pinCorner}
        onPress={() => onPin(task.id)}
      >
        <Text style={[styles.pinIcon, task.pinned && styles.pinIconActive]}>📌</Text>
      </TouchableOpacity>

      {task.pinned && (
        <View style={styles.pinnedBanner}>
          <Text style={styles.pinnedBannerText}>📌 Pinned</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.title, task.completed && styles.completed]}>
          {task.title}
        </Text>
        <Text style={styles.course}>{task.course}</Text>
        <Text style={styles.due}>{'Due: ' + task.dueDate}</Text>

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
          style={styles.editBtn}
          onPress={() => onEdit(task)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
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
    paddingTop: 36,
    marginBottom: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  pinnedCard: {
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  pinCorner: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  pinIcon: { fontSize: 18, opacity: 0.3 },
  pinIconActive: { opacity: 1 },
  pinnedBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pinnedBannerText: { fontSize: 11, color: '#D97706', fontWeight: '700' },
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
  actions: { flexDirection: 'row', gap: 6, marginTop: 12 },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
  },
  editBtnText: { color: '#6C63FF', fontSize: 12, fontWeight: '600' },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});