// balanceUtils.js — Haftalık Çalışma Dengesi Analizi
import { getDaysUntil } from './dateUtils';

export const calculateBalanceScore = (sessions, courses, exams) => {
  const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = sessions.filter(s => new Date(s.timestamp).getTime() >= last7Days);

  if (weekSessions.length === 0) {
    return { score: 0, ignored: [], overloaded: [], distribution: {}, suggestion: 'Bu hafta henüz çalışma kaydı yok.' };
  }

  // Ders başına dakika hesapla
  const distribution = {};
  weekSessions.forEach(s => {
    distribution[s.subject] = (distribution[s.subject] || 0) + s.durationMinutes;
  });

  const courseNames = [...new Set([...courses.map(c => c.name), ...Object.keys(distribution)])];
  const totalMins = Object.values(distribution).reduce((s, v) => s + v, 0);

  // İhmal edilen dersler (Bu hafta 0 veya çok az çalışılan, ama sınavı yaklaşan)
  const ignored = courses.filter(c => {
    const mins = distribution[c.name] || 0;
    const upcomingExam = exams.find(e => e.courseName === c.name && getDaysUntil(e.dateString) <= 14 && getDaysUntil(e.dateString) >= 0);
    return mins < 20 && upcomingExam;
  }).map(c => c.name);

  // Aşırı odaklanılan dersler
  const overloaded = Object.entries(distribution)
    .filter(([, mins]) => mins > 0 && (mins / totalMins) > 0.6)
    .map(([name]) => name);

  // Denge Skoru: Std sapması küçükse yüksek skor
  const values = courseNames.map(c => distribution[c] || 0);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const normalizedStd = mean > 0 ? stdDev / mean : 1;

  // İhmal cezası
  const ignoredPenalty = ignored.length * 15;
  const rawScore = Math.max(0, 100 - normalizedStd * 40 - ignoredPenalty);
  const score = Math.round(Math.min(100, rawScore));

  let suggestion = '';
  if (overloaded.length > 0 && ignored.length > 0) {
    suggestion = `Bu hafta ${overloaded.join(', ')} çok çalışıldı ama ${ignored.join(', ')} ihmal edildi.`;
  } else if (ignored.length > 0) {
    suggestion = `${ignored.join(', ')} dersleri bu hafta neredeyse hiç çalışılmadı.`;
  } else if (score >= 75) {
    suggestion = 'Bu hafta çalışma dengeli dağılmış.';
  } else {
    suggestion = 'Çalışmayı derslere daha dengeli dağıtmayı dene.';
  }

  // Önerilen dağılım (sınava yakınlığa göre)
  const totalSuggestedMins = 10 * 60; // 10 saat / hafta
  const suggestions = {};
  const coursesWithExam = courses.filter(c => exams.find(e => e.courseName === c.name && getDaysUntil(e.dateString) >= 0));
  const weight = {};
  let totalWeight = 0;
  coursesWithExam.forEach(c => {
    const days = Math.min(...exams.filter(e => e.courseName === c.name).map(e => getDaysUntil(e.dateString)));
    weight[c.name] = Math.max(1, 15 - days);
    totalWeight += weight[c.name];
  });
  coursesWithExam.forEach(c => {
    suggestions[c.name] = Math.round((weight[c.name] / (totalWeight || 1)) * totalSuggestedMins);
  });

  return { score, ignored, overloaded, distribution, suggestion, suggestions };
};
