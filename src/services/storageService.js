import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'tasks';

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

export const loadTasks = async () => {
  try {
    const tasks = await AsyncStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const deleteTask = async (taskId) => {
  try {
    const tasks = await loadTasks();
    const updated = tasks.filter(task => task.id !== taskId);
    await saveTasks(updated);
    return updated;
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};