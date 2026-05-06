import AsyncStorage from '@react-native-async-storage/async-storage';

export const BADGES = {
  explorer: {
    id: 'explorer',
    title: 'Explorador ECODE',
    description: 'Fez seu primeiro registro no aplicativo.',
    icon: 'compass',
    color: '#60a5fa'
  },
  water_master: {
    id: 'water_master',
    title: 'Mestre da Água',
    description: 'Registrou consumo de água 5 vezes.',
    icon: 'droplet',
    color: '#3b82f6'
  },
  energy_saver: {
    id: 'energy_saver',
    title: 'Poupador de Energia',
    description: 'Manteve o consumo de energia abaixo da meta.',
    icon: 'zap',
    color: '#facc15'
  },
  visionary: {
    id: 'visionary',
    title: 'Visão Tecnológica',
    description: 'Usou o scanner inteligente pela primeira vez.',
    icon: 'eye',
    color: '#4ade80'
  },
  consistent: {
    id: 'consistent',
    title: 'Consistência Pura',
    description: '7 dias seguidos de registros ativos.',
    icon: 'calendar',
    color: '#a855f7'
  }
};

/**
 * Busca todas as conquistas desbloqueadas do usuário
 */
export const getUnlockedAchievements = async () => {
  try {
    const data = await AsyncStorage.getItem('@unlocked_achievements');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Desbloqueia uma conquista
 */
export const unlockAchievement = async (achievementId) => {
  try {
    const unlocked = await getUnlockedAchievements();
    if (!unlocked.includes(achievementId)) {
      const newList = [...unlocked, achievementId];
      await AsyncStorage.setItem('@unlocked_achievements', JSON.stringify(newList));
      return { success: true, achievement: BADGES[achievementId] };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
};

/**
 * Verifica e desbloqueia conquistas baseadas nos dados do dashboard
 */
export const checkAchievements = async (consumos) => {
  const unlockedNow = [];
  
  // Regra: Explorador (Primeiro registro)
  if (consumos.length >= 1) {
    const res = await unlockAchievement('explorer');
    if (res.success) unlockedNow.push(res.achievement);
  }
  
  // Regra: Mestre da Água (5 registros de água)
  const aguaCount = consumos.filter(c => c.tipoConsumo.toLowerCase().includes('agua') || c.tipoConsumo.toLowerCase().includes('água')).length;
  if (aguaCount >= 5) {
    const res = await unlockAchievement('water_master');
    if (res.success) unlockedNow.push(res.achievement);
  }

  return unlockedNow;
};
