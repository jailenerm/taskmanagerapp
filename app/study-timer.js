import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function StudyTimerScreen() {
  const [mode, setMode] = useState('study');
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [studyMinutes, setStudyMinutes] = useState('25');
  const [breakMinutes, setBreakMinutes] = useState('5');
  const intervalRef = useRef(null);

  const getModes = () => ({
    study: { label: 'Study', duration: parseInt(studyMinutes) * 60 || 1500, color: '#6C63FF' },
    break: { label: 'Break', duration: parseInt(breakMinutes) * 60 || 300, color: '#4ECDC4' },
  });

  const [timeLeft, setTimeLeft] = useState(getModes().study.duration);

  useEffect(() => {
    setTimeLeft(getModes()[mode].duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode, studyMinutes, breakMinutes]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'study') setSessions(s => s + 1);
            Alert.alert(
              'Time is up!',
              mode === 'study' ? 'Great work! Take a break.' : 'Break over! Time to study.'
            );
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

  const formatMinutes = (secs) => Math.floor(secs / 60).toString().padStart(2, '0');
  const formatSeconds = (secs) => (secs % 60).toString().padStart(2, '0');

  const reset = () => {
    setRunning(false);
    setTimeLeft(getModes()[mode].duration);
  };

  const MODES = getModes();
  const color = MODES[mode].color;
  const progress = 1 - timeLeft / MODES[mode].duration;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Timer</Text>
      </View>

      <TouchableOpacity
        style={styles.settingsTrigger}
        onPress={() => setShowSettings(!showSettings)}
      >
        <Text style={styles.settingsTriggerText}>{'⚙️ Customize Timer'}</Text>
      </TouchableOpacity>

      {showSettings && (
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>Set Duration (minutes)</Text>
          <View style={styles.settingsRow}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Study</Text>
              <TextInput
                style={styles.settingInput}
                value={studyMinutes}
                onChangeText={setStudyMinutes}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Break</Text>
              <TextInput
                style={styles.settingInput}
                value={breakMinutes}
                onChangeText={setBreakMinutes}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.applyBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.modeRow}>
        {Object.entries(MODES).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            style={[styles.modeBtn, mode === key && { backgroundColor: val.color }]}
            onPress={() => setMode(key)}
          >
            <Text style={[styles.modeTxt, mode === key && styles.modeTxtActive]}>
              {val.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timerWrapper}>
        <View style={[styles.timerCircle, { borderColor: color }]}>
          <View style={styles.timerRow}>
            <Text style={[styles.timeDigits, { color }]}>{formatMinutes(timeLeft)}</Text>
            <Text style={[styles.timeSeparator, { color }]}>:</Text>
            <Text style={[styles.timeDigits, { color }]}>{formatSeconds(timeLeft)}</Text>
          </View>
          <Text style={styles.modeLabel}>{MODES[mode].label}</Text>
          <Text style={styles.durationLabel}>
            {Math.floor(MODES[mode].duration / 60)} min
          </Text>
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
        <View style={styles.sessionCard}>
          <Text style={styles.sessionLabel}>Sessions today</Text>
          <Text style={[styles.sessionCount, { color }]}>{sessions}</Text>
          <TouchableOpacity
            style={styles.resetSessionsBtn}
            onPress={() => setSessions(0)}
          >
            <Text style={styles.resetSessionsTxt}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#6C63FF',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  settingsTrigger: { alignItems: 'center', marginTop: 16 },
  settingsTriggerText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  settingsBox: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  settingsTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 16, textAlign: 'center' },
  settingsRow: { flexDirection: 'row', gap: 16 },
  settingItem: { flex: 1, alignItems: 'center' },
  settingLabel: { fontSize: 12, color: '#64748B', marginBottom: 8, fontWeight: '500' },
  settingInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    fontSize: 24,
    fontWeight: '700',
    width: '100%',
    textAlign: 'center',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  applyBtn: { backgroundColor: '#6C63FF', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 16 },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 40, marginTop: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#E2E8F0', alignItems: 'center' },
  modeTxt: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  modeTxtActive: { color: '#fff' },
  timerWrapper: { alignItems: 'center', marginTop: 32 },
  timerCircle: {
    width: 240, height: 240,
    borderRadius: 120,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  timerRow: { flexDirection: 'row', alignItems: 'center' },
  timeDigits: { fontSize: 56, fontWeight: '200', letterSpacing: -2 },
  timeSeparator: { fontSize: 48, fontWeight: '200', marginBottom: 6 },
  modeLabel: { fontSize: 14, color: '#94A3B8', marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' },
  durationLabel: { fontSize: 12, color: '#CBD5E1', marginTop: 2 },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', marginHorizontal: 40, borderRadius: 3, marginTop: 32 },
  progressBarFill: { height: 6, borderRadius: 3 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 36 },
  resetBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center', alignItems: 'center',
  },
  resetTxt: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  startBtn: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sessionBox: { alignItems: 'center', marginTop: 32, paddingHorizontal: 40 },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sessionLabel: { fontSize: 13, color: '#94A3B8', letterSpacing: 0.5 },
  sessionCount: { fontSize: 48, fontWeight: '200', marginTop: 4 },
  resetSessionsBtn: { marginTop: 8 },
  resetSessionsTxt: { fontSize: 12, color: '#CBD5E1' },
});