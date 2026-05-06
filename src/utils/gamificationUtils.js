const ALL_BADGES = [
  { id: 'first_course', name: 'İlk Adım', desc: 'İlk dersini ekledin.', icon: 'book-open-page-variant' },
  { id: 'first_session', name: 'Zamanın Efendisi', desc: 'İlk çalışma oturumunu bitirdin.', icon: 'timer-sand' },
  { id: 'habit_master', name: 'Alışkanlık Canavarı', desc: 'Bir alışkanlığı tamamladın.', icon: 'check-decagram' },
  { id: 'streak_3', name: 'İstikrar', desc: 'Uygulamayı 3 gün üst üste kullandın.', icon: 'fire' },
  { id: 'pomodoro_king', name: 'Odak Ustası', desc: 'Pomodoro odak modunu tamamladın.', icon: 'brain' },
];

export const calculateXPForAction = (action) => {
  switch(action) {
    case 'STUDY_SESSION_MIN': return 2; // 2 XP per minute
    case 'HABIT_DONE': return 50;
    case 'EXAM_ADDED': return 20;
    case 'COURSE_ADDED': return 20;
    case 'POMODORO_DONE': return 100;
    case 'DAILY_GOAL_MET': return 200;
    default: return 0;
  }
};

export const checkNewBadges = (gamificationData, metrics) => {
  const newBadges = [];
  const currentIds = gamificationData.unlockedBadges.map(b => b.id);

  const checkAndAdd = (id, condition) => {
    if (!currentIds.includes(id) && condition) {
      const b = ALL_BADGES.find(x => x.id === id);
      if (b) newBadges.push(b);
    }
  };

  checkAndAdd('first_course', metrics.coursesCount > 0);
  checkAndAdd('first_session', metrics.sessionsCount > 0);
  checkAndAdd('habit_master', metrics.habitsCompleted > 0);
  checkAndAdd('streak_3', metrics.consistency >= 40); // Rough approximation
  checkAndAdd('pomodoro_king', metrics.pomodoroCount > 0);

  return newBadges;
};

export const getLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getProgressToNextLevel = (xp) => {
  const currentLvl = getLevel(xp);
  const currentBaseXp = Math.pow(currentLvl - 1, 2) * 100;
  const nextBaseXp = Math.pow(currentLvl, 2) * 100;
  const progress = xp - currentBaseXp;
  const required = nextBaseXp - currentBaseXp;
  return { progress, required, percent: Math.round((progress / required) * 100) };
};

export const getAllBadgesList = () => ALL_BADGES;
