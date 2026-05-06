import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Verificação extremamente segura para evitar crash no Expo Go SDK 53
let isExpoGo = false;
try {
  const Constants = require('expo-constants').default;
  // No SDK 53, o appOwnership pode ser 'expo' ou o slug do projeto
  isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';
} catch (e) {
  console.log('Não foi possível determinar o ambiente Expo');
}

/**
 * Configuração inicial segura
 */
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log('Erro ao configurar handler de notificações');
  }
}

/**
 * Solicita permissão para notificações (Apenas se não for Expo Go)
 */
export const registerForPushNotificationsAsync = async () => {
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Notificações Push desabilitadas no Expo Go para evitar crash');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return finalStatus;
  } catch (error) {
    console.log('Erro no registro de notificações:', error);
    return null;
  }
};

/**
 * Envia um alerta local (Protegido contra crash)
 */
export const sendAnomalyAlert = async (type, diff) => {
  if (isExpoGo || Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 Alerta: Consumo de ${type}`,
        body: `Seu consumo está ${diff}% acima da média. Verifique possíveis vazamentos.`,
        data: { type, diff },
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Erro ao enviar alerta local:', error);
  }
};

/**
 * Agenda lembrete de leitura
 */
export const scheduleReadingReminder = async (day = 5) => {
  if (isExpoGo || Platform.OS === 'web') return;

  try {
    // Cancela agendamentos anteriores para não duplicar
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📅 Hora da Leitura ECODE",
        body: "Não esqueça de registrar seus consumos hoje para manter seu dashboard atualizado!",
      },
      trigger: {
        day,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.log('Erro ao agendar lembrete:', error);
  }
};
