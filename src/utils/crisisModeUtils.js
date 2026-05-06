// crisisModeUtils.js — Kriz Modu ve Son Dakika Plan Üreticisi
import { getDaysUntil } from './dateUtils';
import { calculateExamPreparation } from './preparationUtils';

export const shouldTriggerCrisisMode = (exams, topics, sessions, quizResults, studyPlans) => {
  const criticalExams = exams.filter(e => {
    const days = getDaysUntil(e.dateString);
    if (days < 0 || days > 2) return false;
    const prep = calculateExamPreparation(e, topics, sessions, quizResults, studyPlans);
    return prep < 65; // Hazırlık düşükse kriz modu
  });
  return criticalExams.length > 0 ? criticalExams[0] : null;
};

export const generateCrisisPlan = (exam, topics, sessions) => {
  const daysLeft = getDaysUntil(exam.dateString);
  const examTopics = topics.filter(t => t.courseName === exam.courseName);
  
  const weakTopics = examTopics
    .filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum')
    .sort((a, b) => {
      const o = { 'Bilmiyorum': 0, 'Az biliyorum': 1 };
      return (o[a.status] ?? 2) - (o[b.status] ?? 2);
    })
    .slice(0, 3);

  const steps = [];

  if (weakTopics.length > 0) {
    weakTopics.forEach((t, i) => {
      steps.push({
        order: i + 1,
        icon: 'book-open-variant',
        title: `"${t.name}" konusunu tekrar et`,
        detail: `Zayıf konu: ${t.status}. Hızlı tekrar yap.`,
        duration: daysLeft <= 1 ? 30 : 45,
        type: 'study'
      });
    });
  } else {
    steps.push({
      order: 1, icon: 'book-open-variant',
      title: 'Tüm konuları hızlı gözden geçir',
      detail: 'Her konuya kısa odaklanarak genel tekrar yap.',
      duration: 40, type: 'study'
    });
  }

  steps.push({
    order: steps.length + 1, icon: 'frequently-asked-questions',
    title: 'Çıkmış soru çöz',
    detail: 'Geçmiş sınav sorularından 5-10 soru çöz.',
    duration: 30, type: 'quiz'
  });

  if (daysLeft >= 1) {
    steps.push({
      order: steps.length + 1, icon: 'text-box-check-outline',
      title: 'Genel özet notlarını oku',
      detail: 'Formüller, tanımlar ve anahtar kavramları gözden geçir.',
      duration: 20, type: 'review'
    });
  }

  steps.push({
    order: steps.length + 1, icon: 'sleep',
    title: 'Uykunu bozma!',
    detail: 'Gece geç saate kadar çalışmak sınav performansını düşürür. En az 7 saat uyu.',
    duration: 0, type: 'warning'
  });

  return {
    exam,
    daysLeft,
    steps,
    totalMinutes: steps.filter(s => s.duration > 0).reduce((s, t) => s + t.duration, 0),
    message: daysLeft <= 1
      ? `${exam.name} sınavına yarın gireceksin! Sakin ol, odaklan.`
      : `${exam.name} sınavına ${daysLeft} gün kaldı. Verimli bir hazırlık yapabilirsin!`
  };
};
