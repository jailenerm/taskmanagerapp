import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { loadTasks } from '../src/services/storageService';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        try {
          const classData = await AsyncStorage.getItem('classes');
          setClasses(classData ? JSON.parse(classData) : []);
          const taskData = await loadTasks();
          setTasks(taskData);
        } catch { }
      };
      fetch();
    }, [])
  );

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const getTasksForDay = (day) => {
    const dateStr = `${currentMonth.getMonth() + 1}/${day}/${currentMonth.getFullYear()}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const getClassesForDay = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayName = SHORT_DAYS[date.getDay()];
    return classes.filter(c => c.days && c.days.includes(dayName));
  };

  const hasEvents = (day) => {
    return getTasksForDay(day).length > 0 || getClassesForDay(day).length > 0;
  };

  const selectedDateClasses = getClassesForDay(selectedDate.getDate()).sort((a, b) => {
    const toMinutes = (time) => {
      if (!time) return 0;
      const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });
  const selectedDateTasks = getTasksForDay(selectedDate.getDate());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      <ScrollView>
        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
              <Text style={styles.monthBtnText}>{'›'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.cell,
                  day && isSelected(day) && styles.cellSelected,
                  day && isToday(day) && !isSelected(day) && styles.cellToday,
                ]}
                onPress={() => {
                  if (day) {
                    setSelectedDate(new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    ));
                  }
                }}
                disabled={!day}
              >
                {day ? (
                  <>
                    <Text style={[
                      styles.cellText,
                      isSelected(day) && styles.cellTextSelected,
                      isToday(day) && !isSelected(day) && styles.cellTextToday,
                    ]}>
                      {day}
                    </Text>
                    {hasEvents(day) && (
                      <View style={styles.eventDot} />
                    )}
                  </>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.selectedDay}>
          <Text style={styles.selectedDayTitle}>
            {FULL_DAYS[selectedDate.getDay()]}, {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
          </Text>

          {selectedDateClasses.length === 0 && selectedDateTasks.length === 0 && (
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No classes or assignments today</Text>
            </View>
          )}

          {selectedDateClasses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{'📚 Classes'}</Text>
              {selectedDateClasses.map(cls => (
                <View key={cls.id} style={[styles.eventCard, { borderLeftColor: cls.color }]}>
                  <Text style={styles.eventTitle}>{cls.name}</Text>
                  {cls.startTime && cls.endTime && (
                    <Text style={styles.eventDetail}>{'⏰ ' + cls.startTime + ' - ' + cls.endTime}</Text>
                  )}
                  {cls.room && (
                    <Text style={styles.eventDetail}>{'📍 ' + cls.room}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {selectedDateTasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{'📝 Due Today'}</Text>
              {selectedDateTasks.map(task => (
                <View key={task.id} style={[styles.eventCard, { borderLeftColor: task.color }]}>
                  <Text style={styles.eventTitle}>{task.title}</Text>
                  <Text style={styles.eventDetail}>{task.course}</Text>
                  {task.isTest && (
                    <View style={styles.testBadge}>
                      <Text style={styles.testBadgeText}>TEST</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  calendarCard: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthBtn: { padding: 8 },
  monthBtnText: { fontSize: 24, color: '#6C63FF', fontWeight: 'bold' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  dayHeaders: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  cellSelected: { backgroundColor: '#6C63FF' },
  cellToday: { backgroundColor: '#EEF2FF' },
  cellText: { fontSize: 14, color: '#1E293B' },
  cellTextSelected: { color: '#fff', fontWeight: '700' },
  cellTextToday: { color: '#6C63FF', fontWeight: '700' },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#6C63FF', marginTop: 2 },
  selectedDay: { margin: 16, marginTop: 0 },
  selectedDayTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  noEvents: { padding: 20, alignItems: 'center' },
  noEventsText: { color: '#94A3B8', fontSize: 14 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  eventCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  eventTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  eventDetail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  testBadge: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  testBadgeText: { fontSize: 11, color: '#D97706', fontWeight: '700' },
});