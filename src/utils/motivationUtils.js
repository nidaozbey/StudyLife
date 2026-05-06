// motivationUtils.js — Veriye Dayalı Motivasyon Mesajı Üretici
import { getDaysUntil } from './dateUtils';

export const generateMotivationMessage = (sessions, habits, exams, dailyGoalMins, consistency) => {
  const today = new Date().toDateString();
  const todayMins = sessions.filter(s => s.dateString === today).reduce((s, r) => s + r.durationMinutes, 0);
  const progressPercent = Math.min(100, Math.round((todayMins / dailyGoalMins) * 100));

  // Günlük hedef yüksekse teşvik
  if (progressPercent >= 90) {
    return { message: `Harika! Bugün hedefinin %${progressPercent}'ini tamamladın. Muhteşem bir çalışma günü!`, icon: 'trophy-outline', color: '#39FF14' };
  }

  // Streak yüksekse koru
  if (consistency >= 70) {
    const remaining = dailyGoalMins - todayMins;
    if (remaining > 0) {
      return { message: `${consistency}/100 tutarlılık skorun var! ${remaining} dk daha çalışırsan bugünkü serin kırılmaz.`, icon: 'fire', color: '#FF8A00' };
    }
  }

  // Yaklaşan kritik sınav
  const urgentExam = exams.filter(e => getDaysUntil(e.dateString) >= 0).sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString))[0];
  if (urgentExam) {
    const days = getDaysUntil(urgentExam.dateString);
    if (days <= 3) {
      return { message: `${urgentExam.name} sınavına ${days} gün kaldı. Şu anki çalışma saatin en değerlisi!`, icon: 'alert-circle-outline', color: '#FF3B30' };
    }
    if (days <= 7) {
      return { message: `${urgentExam.name} sınavına ${days} gün var. Küçük adımlar büyük fark yaratır.`, icon: 'clock-alert-outline', color: '#FFB000' };
    }
  }

  // Alışkanlık tamamlamadıysa
  const incompleteHabits = habits.filter(h => !h.completed);
  if (incompleteHabits.length > 0) {
    return { message: `Bugün henüz ${incompleteHabits.length} alışkanlık var. Başlamak bitirmenin yarısıdır.`, icon: 'check-circle-outline', color: '#B026FF' };
  }

  // Sabah erken veya öğlen başlangıç
  if (todayMins === 0) {
    const hour = new Date().getHours();
    if (hour < 12) return { message: 'Güne çalışarak başlamak en güçlü motivasyon kaynağı. 15 dk ile başla!', icon: 'weather-sunny', color: '#FFB000' };
    return { message: 'Bugün henüz hiç çalışmadın. Şimdi başlamak için en iyi an!', icon: 'lightning-bolt', color: '#FF8A00' };
  }

  // Genel ilerleme
  const remaining = dailyGoalMins - todayMins;
  if (remaining > 0) {
    return { message: `Bugün ${todayMins} dk çalıştın. ${remaining} dk daha ile günlük hedefe ulaşırsın!`, icon: 'bullseye-arrow', color: '#39FF14' };
  }

  return { message: 'Her gün küçük bir adım, büyük başarılara götürür. Devam et!', icon: 'star-outline', color: '#00D4FF' };
};
