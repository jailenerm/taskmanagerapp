import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForNotifications = async () => {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;
  return true;
};

export const scheduleTaskNotification = async (task) => {
  try {
    const parts = task.dueDate.split('/');
    if (parts.length !== 3) return;

    const dueDate = new Date(parts[2], parts[0] - 1, parts[1]);
    const now = new Date();

    const oneDayBefore = new Date(dueDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(9, 0, 0, 0);

    if (oneDayBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: task.isTest ? '📝 Test Tomorrow!' : '📚 Assignment Due Tomorrow!',
          body: `${task.title} for ${task.course} is due tomorrow!`,
          sound: true,
        },
        trigger: {
          type: 'date',
          date: oneDayBefore,
        },
      });
    }

    const oneHourBefore = new Date(dueDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    if (oneHourBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: task.isTest ? '⚠️ Test in 1 Hour!' : '⏰ Due in 1 Hour!',
          body: `${task.title} for ${task.course} is due very soon!`,
          sound: true,
        },
        trigger: {
          type: 'date',
          date: oneHourBefore,
        },
      });
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};