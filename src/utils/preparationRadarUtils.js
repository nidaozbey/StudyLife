// preparationRadarUtils.js — 5 Boyutlu Sınav Hazırlık Analizi
import { getDaysUntil } from './dateUtils';

export const calculatePreparationRadar = (exam, topics, sessions, quizResults, studyPlans, attMap, attSettings, course) => {
  if (!exam) return null;

  // 1. Konu Hakimiyeti (0-100)
  const examTopics = topics.filter(t => t.courseName === exam.courseName);
  const statusMap = { 'İyi biliyorum': 100, 'Orta': 65, 'Az biliyorum': 30, 'Bilmiyorum': 0 };
  const topicScore = examTopics.length > 0
    ? examTopics.reduce((s, t) => s + (statusMap[t.status] ?? 50), 0) / examTopics.length
    : 50;

  // 2. Çalışma Süresi (0-100) — 3 saat = 100
  const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekMins = sessions.filter(s => s.subject === exam.courseName && new Date(s.timestamp) >= last7)
    .reduce((s, r) => s + r.durationMinutes, 0);
  const studyScore = Math.min(100, (weekMins / 180) * 100);

  // 3. Çıkmış Soru (0-100)
  const quizzesDone = quizResults.filter(q => q.courseName === exam.courseName);
  const quizScore = quizzesDone.length === 0 ? 0
    : Math.min(100, quizzesDone.reduce((s, q) => s + ((q.score / (q.totalScore || 100)) * 100), 0) / quizzesDone.length);

  // 4. Plan Tamamlama (0-100)
  const plans = studyPlans.filter(p => p.examId === exam.id);
  const planScore = plans.length === 0 ? 50 : (plans.filter(p => p.completed).length / plans.length) * 100;

  // 5. Devamsızlık/Katılım (0-100)
  let attendanceScore = 80;
  if (course && attMap?.[course.id] && attSettings?.[course.id]) {
    const ratio = (attMap[course.id].used || 0) / (attSettings[course.id].limit || 1);
    attendanceScore = Math.max(0, 100 - ratio * 100);
  }

  const dimensions = [
    { key: 'topic',      label: 'Konu Hakimiyeti', score: Math.round(topicScore),      icon: 'book-open-variant',    color: '#39FF14' },
    { key: 'study',      label: 'Çalışma Süresi',   score: Math.round(studyScore),      icon: 'clock-outline',        color: '#00D4FF' },
    { key: 'quiz',       label: 'Çıkmış Soru',       score: Math.round(quizScore),       icon: 'frequently-asked-questions', color: '#FFB000' },
    { key: 'plan',       label: 'Plan İlerlemesi',   score: Math.round(planScore),       icon: 'calendar-check',       color: '#B026FF' },
    { key: 'attendance', label: 'Katılım',            score: Math.round(attendanceScore), icon: 'account-check-outline', color: '#FF8A00' },
  ];

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  const weakDimensions = dimensions.filter(d => d.score < 50);

  return { dimensions, overall, weakDimensions, daysLeft: getDaysUntil(exam.dateString) };
};
