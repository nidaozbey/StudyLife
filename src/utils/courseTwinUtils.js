// courseTwinUtils.js — Ders Dijital İkizi Profili
import { getDaysUntil } from './dateUtils';
import { calculatePreparationRadar } from './preparationRadarUtils';

export const buildCourseTwin = (course, exams, sessions, topics, quizResults, studyPlans, attMap, attSettings) => {
  const courseTopics = topics.filter(t => t.courseName === course.name);
  const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last30 = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const weekSessions = sessions.filter(s => s.subject === course.name && new Date(s.timestamp) >= last7);
  const monthSessions = sessions.filter(s => s.subject === course.name && new Date(s.timestamp) >= last30);
  const weekMins = weekSessions.reduce((s, r) => s + r.durationMinutes, 0);
  const monthMins = monthSessions.reduce((s, r) => s + r.durationMinutes, 0);

  const weakTopics = courseTopics.filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum');
  const strongTopics = courseTopics.filter(t => t.status === 'İyi biliyorum');

  const att = attMap?.[course.id];
  const setting = attSettings?.[course.id];
  const attPercent = att && setting ? Math.round((att.used / (setting.limit || 1)) * 100) : 0;

  const upcomingExam = exams
    .filter(e => e.courseName === course.name && getDaysUntil(e.dateString) >= 0)
    .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString))[0];

  let radarData = null;
  if (upcomingExam) {
    radarData = calculatePreparationRadar(upcomingExam, topics, sessions, quizResults, studyPlans, attMap, attSettings, course);
  }

  const quizAvg = (() => {
    const qs = quizResults.filter(q => q.courseName === course.name);
    if (!qs.length) return null;
    return Math.round(qs.reduce((s, q) => s + ((q.score / (q.totalScore || 100)) * 100), 0) / qs.length);
  })();

  let riskLevel = 'Düşük';
  let riskColor = '#39FF14';
  if (attPercent >= 80 || (upcomingExam && getDaysUntil(upcomingExam.dateString) <= 2)) {
    riskLevel = 'Kritik'; riskColor = '#FF3B30';
  } else if (attPercent >= 60 || weekMins < 30 || weakTopics.length >= 3) {
    riskLevel = 'Yüksek'; riskColor = '#FF8A00';
  } else if (weekMins < 60 || weakTopics.length > 0) {
    riskLevel = 'Orta'; riskColor = '#FFB000';
  }

  const suggestedWeeklyHours = upcomingExam
    ? (getDaysUntil(upcomingExam.dateString) <= 5 ? 5 : 3)
    : 2;

  return {
    course,
    weekMins, monthMins,
    weakTopics, strongTopics,
    attPercent, upcomingExam,
    radarData, quizAvg,
    riskLevel, riskColor,
    suggestedWeeklyHours,
  };
};
