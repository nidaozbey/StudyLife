export const getAppUsageConsistency = (logs) => {
  if (!logs || logs.length === 0) return 0;
  
  // Check how many unique days in the last 7 days the app was used
  const uniqueDays = new Set();
  const today = new Date();
  
  logs.forEach(log => {
    const d = new Date(log.timestamp);
    if ((today - d) / (1000 * 60 * 60 * 24) <= 7) {
      uniqueDays.add(log.date);
    }
  });

  return Math.min(100, Math.round((uniqueDays.size / 7) * 100));
};

export const calculateDigitalTwin = (studySessions, habits, attendanceRecords) => {
  const profile = {
    type: 'Bilinmiyor',
    strongestSubject: '-',
    weakestSubject: '-',
    bestTime: '-',
    consistencyScore: 0
  };

  // 1. En güçlü / zayıf ders
  if (studySessions && studySessions.length > 0) {
    const subjMap = {};
    studySessions.forEach(s => {
      subjMap[s.subject] = (subjMap[s.subject] || 0) + s.durationMinutes;
    });

    const sorted = Object.entries(subjMap).sort((a,b) => b[1] - a[1]);
    if (sorted.length > 0) {
      profile.strongestSubject = sorted[0][0];
      profile.weakestSubject = sorted[sorted.length - 1][0];
    }

    // 2. En verimli saat
    const hourMap = {};
    studySessions.forEach(s => {
      const h = new Date(s.timestamp).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const bestH = Object.entries(hourMap).sort((a,b) => b[1] - a[1])[0];
    if (bestH) {
      profile.bestTime = `${String(bestH[0]).padStart(2, '0')}:00 - ${String(parseInt(bestH[0])+1).padStart(2, '0')}:00`;
    }

    // 3. Çalışma Tipi
    const lateNight = Object.entries(hourMap).filter(h => parseInt(h[0]) >= 22 || parseInt(h[0]) < 4).length > 0;
    if (lateNight) profile.type = "Gece Kuşu";
    else profile.type = "Düzenli Gündüzcü";
  }

  // Summary Text
  const summary = `Bu hafta en çok ${profile.strongestSubject !== '-' ? profile.strongestSubject : 'henüz hiçbir derse'} odaklandın. Genellikle ${profile.bestTime} saatlerinde verimlisin. Profilin: ${profile.type}.`;

  return { profile, summary };
};
