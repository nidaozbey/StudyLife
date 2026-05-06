// decisionEngineUtils.js — Günlük Kritik Hamle Seçici
import { getDaysUntil } from './dateUtils';
import { calculateExamPreparation } from './preparationUtils';

export const generateDailyDecisions = (exams, habits, sessions, topics, courses, attMap, attSettings, quizResults, studyPlans, dailyGoalMins) => {
  const today = new Date().toDateString();
  const todayMins = sessions.filter(s => s.dateString === today).reduce((s, r) => s + r.durationMinutes, 0);
  const candidates = [];

  // 1. Kritik sınav hazırlığı
  const urgentExams = exams
    .filter(e => getDaysUntil(e.dateString) >= 0 && getDaysUntil(e.dateString) <= 7)
    .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));

  urgentExams.slice(0, 2).forEach(exam => {
    const days = getDaysUntil(exam.dateString);
    const prep = calculateExamPreparation(exam, topics, sessions, quizResults, studyPlans);
    const score = (10 - days) * 10 + Math.max(0, 60 - prep);
    const reasons = [];
    if (days <= 2) reasons.push(`Sınava yalnızca ${days} gün kaldı!`);
    else reasons.push(`Sınava ${days} gün var.`);
    if (prep < 50) reasons.push(`Hazırlık yüzdesi %${prep} — düşük.`);
    const weak = topics.filter(t => t.courseName === exam.courseName && (t.status === 'Bilmiyorum' || t.status === 'Az biliyorum'));
    if (weak.length > 0) reasons.push(`${weak.length} eksik konu var.`);

    candidates.push({
      id: `exam_${exam.id}`, score,
      icon: 'school-outline',
      title: `${exam.courseName} çalış`,
      detail: `${exam.name} sınavı için hazırlık yap.`,
      reasons,
      badgeLabel: `${days} Gün Kaldı`,
      badgeColor: days <= 2 ? '#FF3B30' : '#FF8A00',
      type: 'exam',
    });
  });

  // 2. Günlük hedef
  if (todayMins < dailyGoalMins) {
    const remaining = dailyGoalMins - todayMins;
    const pct = Math.round((todayMins / dailyGoalMins) * 100);
    candidates.push({
      id: 'daily_goal', score: 40,
      icon: 'bullseye-arrow',
      title: `${remaining} dk daha çalış`,
      detail: `Günlük hedefin %${pct} tamamlandı.`,
      reasons: [`Bugün ${todayMins} dk çalışıldı. Hedef: ${dailyGoalMins} dk.`],
      badgeLabel: `%${pct} Bitti`,
      badgeColor: pct < 50 ? '#FF8A00' : '#FFB000',
      type: 'goal',
    });
  }

  // 3. Devamsızlık riski
  courses.forEach(c => {
    const setting = attSettings?.[c.id];
    const att = attMap?.[c.id];
    if (!setting || !att) return;
    const ratio = (att.used || 0) / (setting.limit || 1);
    if (ratio >= 0.6) {
      candidates.push({
        id: `att_${c.id}`, score: ratio * 60,
        icon: 'school',
        title: `${c.name} dersine katıl`,
        detail: `Devamsızlık hakkının %${Math.round(ratio*100)}'i kullanıldı.`,
        reasons: [`${att.used}/${setting.limit} devamsızlık hakkı kullanıldı.`],
        badgeLabel: 'Devamsızlık Riski',
        badgeColor: '#FF3B30',
        type: 'attendance',
      });
    }
  });

  // 4. Zayıf konu
  const weak = topics.filter(t => t.status === 'Bilmiyorum').slice(0, 1);
  if (weak.length > 0) {
    const t = weak[0];
    candidates.push({
      id: `topic_${t.id}`, score: 50,
      icon: 'book-alert-outline',
      title: `"${t.name}" konusunu çalış`,
      detail: `${t.courseName} için bilmiyorum işaretlenmiş.`,
      reasons: [`"${t.name}" bilmiyorum olarak işaretlendi.`],
      badgeLabel: 'Eksik Konu',
      badgeColor: '#FF8A00',
      type: 'topic',
    });
  }

  // 5. Alışkanlık
  const incomplete = habits.filter(h => !h.completed).slice(0, 1);
  if (incomplete.length > 0) {
    candidates.push({
      id: `habit_${incomplete[0].id}`, score: 30,
      icon: 'check-circle-outline',
      title: `"${incomplete[0].name}" alışkanlığını tamamla`,
      detail: 'Alışkanlık serini korumak için yap.',
      reasons: ['Bugün henüz tamamlanmadı.'],
      badgeLabel: 'Seri Bozulmasın',
      badgeColor: '#B026FF',
      type: 'habit',
    });
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, 3);
};
