// priorityEngineUtils.js — Günlük Öncelik Motoru
import { getDaysUntil } from './dateUtils';
import { calculateExamPreparation } from './preparationUtils';

export const calculateTaskPriority = (task) => {
  if (task.score >= 80) return { level: 'Yüksek', color: '#FF3B30' };
  if (task.score >= 50) return { level: 'Orta', color: '#FF8A00' };
  return { level: 'Düşük', color: '#39FF14' };
};

export const getPriorityReason = (task) => task.reasons || [];

export const generateDailyTopTasks = (exams, habits, sessions, topics, courses, attMap, attSettings, quizResults, studyPlans, dailyGoalMins) => {
  const candidates = [];
  const today = new Date().toDateString();
  const todayMins = sessions.filter(s => s.dateString === today).reduce((s, r) => s + r.durationMinutes, 0);

  // 1. Sınav tabanlı görevler
  const futureExams = exams.filter(e => getDaysUntil(e.dateString) >= 0)
    .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));

  futureExams.slice(0, 3).forEach(exam => {
    const days = getDaysUntil(exam.dateString);
    const prep = calculateExamPreparation(exam, topics, sessions, quizResults, studyPlans);
    const score = Math.min(100, (10 - days) * 8 + (100 - prep) * 0.4);
    const reasons = [];
    if (days <= 3) reasons.push(`Sınava ${days} gün kaldı!`);
    if (prep < 50) reasons.push(`Hazırlık yüzdesi yalnızca %${prep}.`);
    const examTopics = topics.filter(t => t.courseName === exam.courseName && (t.status === 'Bilmiyorum' || t.status === 'Az biliyorum'));
    if (examTopics.length > 0) reasons.push(`${examTopics.length} zayıf konu var.`);

    candidates.push({
      id: `exam_${exam.id}`,
      title: `${exam.courseName} çalış`,
      description: `${exam.name} sınavına hazırlık`,
      score: Math.max(0, score),
      reasons,
      type: 'exam',
      icon: 'school-outline'
    });
  });

  // 2. Devamsızlık riski görevleri
  courses.forEach(course => {
    const setting = attSettings[course.id];
    if (!setting) return;
    const att = attMap[course.id];
    if (!att) return;
    const used = att.used || 0;
    const limit = setting.limit || 0;
    if (limit === 0) return;
    const ratio = used / limit;
    if (ratio >= 0.6) {
      const score = ratio * 80;
      candidates.push({
        id: `att_${course.id}`,
        title: `${course.name} dersine git`,
        description: `Devamsızlık hakkının %${Math.round(ratio * 100)}'i kullanıldı.`,
        score,
        reasons: [`${used}/${limit} devamsızlık hakkı kullanıldı.`],
        type: 'attendance',
        icon: 'school'
      });
    }
  });

  // 3. Günlük hedef görevi
  if (todayMins < dailyGoalMins) {
    const remaining = dailyGoalMins - todayMins;
    candidates.push({
      id: 'daily_goal',
      title: `${remaining} dk daha çalış`,
      description: 'Günlük çalışma hedefine ulaşmak için devam et.',
      score: 45,
      reasons: [`Bugün ${todayMins} dk çalışıldı. Hedef: ${dailyGoalMins} dk.`],
      type: 'goal',
      icon: 'bullseye-arrow'
    });
  }

  // 4. Alışkanlık görevi
  const incompleteHabits = habits.filter(h => !h.completed);
  if (incompleteHabits.length > 0) {
    const h = incompleteHabits[0];
    candidates.push({
      id: `habit_${h.id}`,
      title: `"${h.name}" alışkanlığını tamamla`,
      description: 'Alışkanlık serini devam ettirmek için yap.',
      score: 35,
      reasons: [`"${h.name}" bugün henüz tamamlanmadı.`],
      type: 'habit',
      icon: 'check-circle-outline'
    });
  }

  // 5. Zayıf konu çalışma görevi
  const weakTopics = topics.filter(t => t.status === 'Bilmiyorum').slice(0, 1);
  if (weakTopics.length > 0) {
    const t = weakTopics[0];
    candidates.push({
      id: `topic_${t.id}`,
      title: `"${t.name}" konusunu çalış`,
      description: `${t.courseName} dersinde bilmiyorum olarak işaretlenmiş.`,
      score: 55,
      reasons: [`"${t.name}" konusunu bilmiyorum olarak işaretledin.`],
      type: 'topic',
      icon: 'book-alert-outline'
    });
  }

  // En yüksek skorlular seçilir
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(task => ({ ...task, priority: calculateTaskPriority(task) }));
};
