export const calculateLeaderboard = (userProfile, friends) => {
  const list = [
    { ...userProfile, id: 'user_self', isCurrentUser: true },
    ...friends
  ];
  return list.sort((a, b) => (b.weeklyMinutes || 0) - (a.weeklyMinutes || 0));
};

export const generateShareSummary = (sessions, habits, gamification, courses) => {
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  
  let weeklyMins = 0;
  const subjectMap = {};

  sessions.forEach(s => {
    const d = new Date(s.timestamp);
    if (d >= weekStart) {
      weeklyMins += s.durationMinutes;
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.durationMinutes;
    }
  });

  const bestSubject = Object.entries(subjectMap).sort((a,b) => b[1]-a[1])[0];

  return {
    weeklyMinutes: weeklyMins,
    bestSubject: bestSubject ? bestSubject[0] : '-',
    level: gamification.level,
    streak: habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0,
    badgesEarned: gamification.unlockedBadges.length
  };
};

export const calculateChallengeProgress = (challenge, sessions, habits) => {
  if (challenge.type === 'study_time') {
    // just dummy calculation for demo
    return Math.min(100, Math.round(((challenge.currentAmount || 0) / challenge.targetAmount) * 100));
  }
  return 0;
};
