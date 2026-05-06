// preparationUtils.js — Sınav Hazırlık Yüzdesi Hesaplama
import { getDaysUntil } from './dateUtils';

export const calculateExamPreparation = (exam, topics, sessions, quizResults, studyPlans) => {
  if (!exam) return 0;
  const daysLeft = getDaysUntil(exam.dateString);

  // 1. Konu Skoru (35%)
  const examTopics = topics.filter(t => t.courseName === exam.courseName);
  let topicScore = 50;
  if (examTopics.length > 0) {
    const statusMap = { 'İyi biliyorum': 100, 'Orta': 65, 'Az biliyorum': 30, 'Bilmiyorum': 0 };
    const avg = examTopics.reduce((s, t) => s + (statusMap[t.status] ?? 50), 0) / examTopics.length;
    topicScore = avg;
  }

  // 2. Çalışma Süresi Skoru (25%)
  const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const relevantSessions = sessions.filter(s =>
    s.subject === exam.courseName && new Date(s.timestamp).getTime() >= last7Days
  );
  const totalMins = relevantSessions.reduce((s, r) => s + r.durationMinutes, 0);
  const studyScore = Math.min(100, (totalMins / 180) * 100); // 3 saat = 100

  // 3. Quiz/Deneme Skoru (20%)
  const examQuizzes = quizResults.filter(q => q.courseName === exam.courseName);
  let quizScore = 50;
  if (examQuizzes.length > 0) {
    const avg = examQuizzes.reduce((s, q) => s + (q.score / (q.totalScore || 100)) * 100, 0) / examQuizzes.length;
    quizScore = avg;
  }

  // 4. Plan Tamamlama Skoru (10%)
  const examPlans = studyPlans.filter(p => p.examId === exam.id);
  let planScore = 50;
  if (examPlans.length > 0) {
    const completed = examPlans.filter(p => p.completed).length;
    planScore = (completed / examPlans.length) * 100;
  }

  // 5. Zaman Cezası (10%) — Sınava az kaldıysa hazırlık baskısı artar
  const timeBonus = daysLeft >= 14 ? 100 : daysLeft >= 7 ? 70 : daysLeft >= 3 ? 40 : 20;

  const total = (topicScore * 0.35) + (studyScore * 0.25) + (quizScore * 0.20) + (planScore * 0.10) + (timeBonus * 0.10);
  return Math.round(Math.min(100, Math.max(0, total)));
};

export const getPreparationLabel = (percent) => {
  if (percent >= 71) return 'İyi';
  if (percent >= 41) return 'Orta';
  return 'Düşük';
};

export const getPreparationColor = (percent) => {
  if (percent >= 71) return '#39FF14';
  if (percent >= 41) return '#FFB000';
  return '#FF3B30';
};

export const getPreparationReasons = (exam, topics, sessions, quizResults) => {
  const reasons = [];
  const examTopics = topics.filter(t => t.courseName === exam.courseName);
  const weakTopics = examTopics.filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum');
  if (weakTopics.length > 0) reasons.push(`${weakTopics.length} zayıf konu var: ${weakTopics.slice(0, 2).map(t => t.name).join(', ')}`);
  
  const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const totalMins = sessions.filter(s => s.subject === exam.courseName && new Date(s.timestamp).getTime() >= last7Days)
    .reduce((s, r) => s + r.durationMinutes, 0);
  if (totalMins < 60) reasons.push(`Son 7 günde yalnızca ${totalMins} dk çalışıldı.`);

  const examQuizzes = quizResults.filter(q => q.courseName === exam.courseName);
  if (examQuizzes.length === 0) reasons.push('Henüz quiz/deneme yapılmadı.');
  
  const daysLeft = getDaysUntil(exam.dateString);
  if (daysLeft < 5) reasons.push(`Sınava ${daysLeft} gün kaldı!`);
  
  return reasons;
};
