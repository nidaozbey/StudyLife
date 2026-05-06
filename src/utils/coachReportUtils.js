// coachReportUtils.js — Haftalık Koç Raporu
import { getDaysUntil } from './dateUtils';

const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export const generateWeeklyCoachReport = (sessions, habits, courses, exams, attMap, attSettings) => {
  const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = sessions.filter(s => new Date(s.timestamp) >= last7);
  const totalMins = weekSessions.reduce((s, r) => s + r.durationMinutes, 0);

  // Subject breakdown
  const subjectMap = {};
  weekSessions.forEach(s => { subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.durationMinutes; });
  const sortedSubjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);
  const bestSubject = sortedSubjects[0]?.[0] ?? null;
  const bestSubjectMins = sortedSubjects[0]?.[1] ?? 0;

  // Riskiest subject (upcoming exam, least study)
  const riskiest = courses.map(c => {
    const upcoming = exams.filter(e => e.courseName === c.name && getDaysUntil(e.dateString) >= 0);
    const mins = subjectMap[c.name] || 0;
    const score = upcoming.length > 0 ? (10 - Math.min(getDaysUntil(upcoming[0].dateString), 10)) * 5 + (180 - Math.min(mins, 180)) : 0;
    return { name: c.name, score };
  }).sort((a, b) => b.score - a.score)[0]?.name ?? null;

  // Habits
  const habitRate = habits.length > 0 ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0;

  // Attendance warnings
  const attWarnings = courses.filter(c => {
    const s = attSettings?.[c.id];
    const a = attMap?.[c.id];
    return s && a && (a.used / (s.limit || 1)) >= 0.7;
  }).map(c => c.name);

  // Suggestions
  const suggestions = [];
  if (riskiest) suggestions.push(`${riskiest} için bu hafta daha fazla zaman ayır.`);
  if (habitRate < 60) suggestions.push('Alışkanlık tutarlılığını artırmak için her gün küçük hedef belirle.');
  if (attWarnings.length > 0) suggestions.push(`${attWarnings.join(', ')} derslerine devamsızlık riskini azaltmak için mutlaka katıl.`);
  if (suggestions.length < 3) suggestions.push('Dengeleri iyi gidiyor! Hızını korumaya devam et.');

  return {
    totalMins,
    totalHours: Math.round((totalMins / 60) * 10) / 10,
    bestSubject,
    bestSubjectMins,
    riskiest,
    habitRate,
    attWarnings,
    suggestions: suggestions.slice(0, 3),
  };
};
