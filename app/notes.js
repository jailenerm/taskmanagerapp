import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteImages, setNoteImages] = useState([]);
  const [noteClass, setNoteClass] = useState('');
  const [noteColor, setNoteColor] = useState('#6C63FF');
  const [noteDate, setNoteDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [sound, setSound] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        const data = await AsyncStorage.getItem('notes');
        setNotes(data ? JSON.parse(data) : []);
        const classData = await AsyncStorage.getItem('classes');
        setClasses(classData ? JSON.parse(classData) : []);
      };
      fetch();
    }, [])
  );

  const saveNotes = async (updated) => {
    await AsyncStorage.setItem('notes', JSON.stringify(updated));
  };

  const openAddModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteText('');
    setNoteImages([]);
    setNoteClass('');
    setNoteColor('#6C63FF');
    setNoteDate(new Date());
    setRecordings([]);
    setModalVisible(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteText(note.text);
    setNoteImages(note.images || []);
    setNoteClass(note.className || '');
    setNoteColor(note.color || '#6C63FF');
    setNoteDate(note.date ? new Date(note.date) : new Date());
    setRecordings(note.recordings || []);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Oops!', 'Please enter a note title');
      return;
    }
    const noteData = {
      title: noteTitle.trim(),
      text: noteText.trim(),
      images: noteImages,
      recordings,
      className: noteClass,
      color: noteColor,
      date: noteDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let updated;
    if (editingNote) {
      updated = notes.map(n => n.id === editingNote.id ? { ...n, ...noteData } : n);
    } else {
      updated = [...notes, { id: Date.now().toString(), ...noteData, createdAt: new Date().toISOString() }];
    }
    setNotes(updated);
    await saveNotes(updated);
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = notes.filter(n => n.id !== id);
          setNotes(updated);
          await saveNotes(updated);
        }
      }
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setNoteImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setNoteImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (e) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordings(prev => [...prev, { uri, createdAt: new Date().toISOString() }]);
      setRecording(null);
      setIsRecording(false);
    } catch (e) {
      Alert.alert('Error', 'Could not stop recording');
    }
  };

  const playRecording = async (uri, index) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlayingIndex(null);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      setPlayingIndex(index);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setSound(null);
          setPlayingIndex(null);
        }
      });
    } catch (e) {
      Alert.alert('Error', 'Could not play recording');
    }
  };

  const filteredNotes = selectedClass
    ? notes.filter(n => n.className === selectedClass)
    : notes;

  const uniqueClasses = [...new Set(notes.map(n => n.className).filter(Boolean))];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <Text style={styles.headerSub}>
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.classFilter}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedClass && styles.filterChipActive]}
          onPress={() => setSelectedClass(null)}
        >
          <Text style={[styles.filterChipText, !selectedClass && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {uniqueClasses.map(cls => (
          <TouchableOpacity
            key={cls}
            style={[styles.filterChip, selectedClass === cls && styles.filterChipActive]}
            onPress={() => setSelectedClass(cls === selectedClass ? null : cls)}
          >
            <Text style={[styles.filterChipText, selectedClass === cls && styles.filterChipTextActive]}>
              {cls}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredNotes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notes yet!</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first note</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.noteCard, { borderLeftColor: item.color || '#6C63FF' }]}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.noteCardHeader}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              </View>
              {item.className ? (
                <Text style={styles.noteClass}>{'📚 ' + item.className}</Text>
              ) : null}
              {item.date ? (
                <Text style={styles.noteDate}>
                  {'📅 ' + new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </Text>
              ) : null}
              {item.text ? (
                <Text style={styles.notePreview} numberOfLines={2}>{item.text}</Text>
              ) : null}
              <View style={styles.noteFooter}>
                {item.images && item.images.length > 0 && (
                  <Text style={styles.noteTag}>{'🖼 ' + item.images.length + ' photo'}</Text>
                )}
                {item.recordings && item.recordings.length > 0 && (
                  <Text style={styles.noteTag}>{'🎙 ' + item.recordings.length + ' recording'}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBack}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingNote ? 'Edit Note' : 'New Note'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>

            <TextInput
              style={styles.titleInput}
              placeholder="Note title..."
              placeholderTextColor="#94A3B8"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <Text style={styles.sectionLabel}>Lecture Date</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateBtnText}>
                {'📅 ' + noteDate.toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <View>
                <DateTimePicker
                  value={noteDate}
                  mode="date"
                  display="inline"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setNoteDate(selectedDate);
                  }}
                />
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.classPickerBtn}
              onPress={() => setShowClassPicker(true)}
            >
              <Text style={styles.classPickerText}>
                {noteClass ? '📚 ' + noteClass : '📚 Select class (optional)'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here..."
              placeholderTextColor="#94A3B8"
              value={noteText}
              onChangeText={setNoteText}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>Photos</Text>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                <Text style={styles.photoBtnText}>🖼 Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Text style={styles.photoBtnText}>📷 Camera</Text>
              </TouchableOpacity>
            </View>

            {noteImages.length > 0 && (
              <ScrollView horizontal style={styles.imageRow}>
                {noteImages.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.noteImage} />
                    <TouchableOpacity
                      style={styles.removeImage}
                      onPress={() => setNoteImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <Text style={styles.sectionLabel}>Voice Notes</Text>
            <TouchableOpacity
              style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.recordBtnText}>
                {isRecording ? '⏹ Stop Recording' : '🎙 Start Recording'}
              </Text>
            </TouchableOpacity>

            {recordings.length > 0 && (
              <View style={styles.recordingsList}>
                {recordings.map((rec, index) => (
                  <View key={index} style={styles.recordingItem}>
                    <Text style={styles.recordingLabel}>
                      {'Voice note ' + (index + 1)}
                    </Text>
                    <TouchableOpacity
                      style={[styles.playBtn, playingIndex === index && styles.playBtnActive]}
                      onPress={() => playRecording(rec.uri, index)}
                    >
                      <Text style={styles.playBtnText}>
                        {playingIndex === index ? '⏸ Stop' : '▶ Play'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRecordings(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.deleteRecording}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

          </ScrollView>
        </SafeAreaView>

        <Modal
          visible={showClassPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowClassPicker(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <Text style={styles.modalBack}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Class</Text>
              <View style={{ width: 60 }} />
            </View>
            <FlatList
              data={classes}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.classList}
              ListHeaderComponent={() => (
                <TouchableOpacity
                  style={styles.classItem}
                  onPress={() => {
                    setNoteClass('');
                    setShowClassPicker(false);
                  }}
                >
                  <Text style={styles.classItemName}>No class</Text>
                </TouchableOpacity>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.classItem, noteClass === item.name && styles.classItemActive]}
                  onPress={() => {
                    setNoteClass(item.name);
                    setNoteColor(item.color);
                    setShowClassPicker(false);
                  }}
                >
                  <View style={[styles.classItemDot, { backgroundColor: item.color }]} />
                  <Text style={styles.classItemName}>{item.name}</Text>
                  {noteClass === item.name && (
                    <Text style={styles.classItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSub: { color: '#C4C0FF', fontSize: 13, marginTop: 2 },
  classFilter: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 56 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 8 },
  filterChipActive: { backgroundColor: '#6C63FF' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#94A3B8' },
  emptySubtext: { fontSize: 14, color: '#CBD5E1', marginTop: 8 },
  noteCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  noteCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  deleteIcon: { fontSize: 16, marginLeft: 8 },
  noteClass: { fontSize: 12, color: '#6C63FF', marginTop: 4, fontWeight: '500' },
  noteDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  notePreview: { fontSize: 13, color: '#64748B', marginTop: 6, lineHeight: 18 },
  noteFooter: { flexDirection: 'row', gap: 8, marginTop: 8 },
  noteTag: { fontSize: 11, color: '#94A3B8', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  addBtn: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#6C63FF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  addText: { color: '#fff', fontSize: 36, lineHeight: 40 },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  modalBack: { fontSize: 16, color: '#6C63FF', fontWeight: '500' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  modalSave: { fontSize: 16, color: '#6C63FF', fontWeight: '700' },
  modalBody: { padding: 20, paddingBottom: 60 },
  titleInput: { fontSize: 22, fontWeight: '600', color: '#1E293B', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 8 },
  dateBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  dateBtnText: { fontSize: 14, color: '#1E293B' },
  doneBtn: { backgroundColor: '#6C63FF', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  doneBtnText: { color: '#fff', fontWeight: '600' },
  classPickerBtn: { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 16 },
  classPickerText: { fontSize: 14, color: '#6C63FF', fontWeight: '500' },
  noteInput: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B', minHeight: 150 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginTop: 20, marginBottom: 10 },
  photoActions: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  photoBtn: { flex: 1, backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, alignItems: 'center' },
  photoBtnText: { fontSize: 14, color: '#6C63FF', fontWeight: '500' },
  imageRow: { marginBottom: 12 },
  imageWrapper: { marginRight: 8, position: 'relative' },
  noteImage: { width: 100, height: 100, borderRadius: 8 },
  removeImage: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF6B6B', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeImageText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  recordBtn: { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 14, alignItems: 'center' },
  recordBtnActive: { backgroundColor: '#FEE2E2' },
  recordBtnText: { fontSize: 15, color: '#6C63FF', fontWeight: '600' },
  recordingsList: { marginTop: 12 },
  recordingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  recordingLabel: { flex: 1, fontSize: 14, color: '#1E293B' },
  playBtn: { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  playBtnActive: { backgroundColor: '#FEE2E2' },
  playBtnText: { fontSize: 12, color: '#6C63FF', fontWeight: '600' },
  deleteRecording: { fontSize: 16 },
  classList: { padding: 16 },
  classItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  classItemActive: { borderColor: '#6C63FF', backgroundColor: '#EEF2FF' },
  classItemDot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  classItemName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  classItemCheck: { fontSize: 18, color: '#6C63FF', fontWeight: '700' },
});