import { useEffect, useRef, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

const MODES = {
  study: { label: 'Study', duration: 25 * 60, color: '#6C63FF' },
  short: { label: 'Short Break', duration: 5 * 60, color: '#4ECDC4' },
  long: { label: 'Long Break', duration: 15 * 60, color: '#45B7D1' },
};

export default function StudyTimerScreen() {
  const [mode, setMode] = useState('study');
  const [timeLeft, setTimeLeft] = useState(MODES.study.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'study') setSessions(s => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const reset = () => {
    setRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const progress = 1 - timeLeft / MODES[mode].duration;
  const color = MODES[mode].color;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Timer</Text>
      </View>

      <View style={styles.modeRow}>
        {Object.entries(MODES).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            style={[styles.modeBtn, mode === key && { backgroundColor: val.color }]}
            onPress={() => setMode(key)}
          >
            <Text style={[styles.modeTxt, mode === key && { color: '#fff' }]}>
              {val.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timerContainer}>
        <View style={[styles.timerCircle, { borderColor: color }]}>
          <Text style={[styles.timerText, { color }]}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerLabel}>{MODES[mode].label}</Text>
        </View>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetTxt}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: color }]}
          onPress={() => setRunning(r => !r)}
        >
          <Text style={styles.startTxt}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionBox}>
        <Text style={styles.sessionLabel}>Sessions completed today</Text>
        <Text style={[styles.sessionCount, { color }]}>{sessions}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 16 },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E2E8F0' },
  modeTxt: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  timerContainer: { alignItems: 'center', marginTop: 20 },
  timerCircle: {
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 8, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  timerText: { fontSize: 52, fontWeight: 'bold' },
  timerLabel: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', marginHorizontal: 32, borderRadius: 3, marginTop: 24 },
  progressBarFill: { height: 6, borderRadius: 3 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 32 },
  resetBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, backgroundColor: '#E2E8F0' },
  resetTxt: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  startBtn: { paddingHorizontal: 48, paddingVertical: 14, borderRadius: 12 },
  startTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  sessionBox: { alignItems: 'center', marginTop: 32 },
  sessionLabel: { fontSize: 14, color: '#94A3B8' },
  sessionCount: { fontSize: 36, fontWeight: 'bold', marginTop: 4 },
});