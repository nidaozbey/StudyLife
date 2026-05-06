// earlyWarningUtils.js — Ders Bazlı Akademik Erken Uyarı Sistemi
import { getDaysUntil } from './dateUtils';
import { calculateExamPreparation } from './preparationUtils';

const RISK_LEVELS = {
  CRITICAL: { label: 'Kritik', color: '#FF3B30', score: 3 },
  HIGH:     { label: 'Yüksek', color: '#FF8A00', score: 2 },
  MEDIUM:   { label: 'Orta',   color: '#FFB000', score: 1 },
  LOW:      { label: 'Düşük',  color: '#39FF14', score: 0 },
};

export const generateEarlyWarnings = (courses, exams, sessions, topics, attMap, attSettings, quizResults, studyPlans) => {
  const warnings = [];

  courses.forEach(course => {
    const reasons = [];
    let riskScore = 0;

    // 1. Yaklaşan sınav
    const upcoming = exams
      .filter(e => e.courseName === course.name && getDaysUntil(e.dateString) >= 0)
      .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));
    const nearestExam = upcoming[0];

    if (nearestExam) {
      const days = getDaysUntil(nearestExam.dateString);
      if (days <= 2) { riskScore += 3; reasons.push(`Sınava ${days} gün kaldı!`); }
      else if (days <= 5) { riskScore += 2; reasons.push(`Sınava ${days} gün kaldı.`); }
      else if (days <= 10) { riskScore += 1; reasons.push(`Sınava ${days} gün var.`); }

      const prep = calculateExamPreparation(nearestExam, topics, sessions, quizResults, studyPlans);
      if (prep < 30) { riskScore += 3; reasons.push(`Hazırlık yüzdesi yalnızca %${prep} — kritik!`); }
      else if (prep < 55) { riskScore += 2; reasons.push(`Hazırlık yüzdesi %${prep} — düşük.`); }
    }

    // 2. Haftalık çalışma
    const last7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekMins = sessions.filter(s => s.subject === course.name && new Date(s.timestamp) >= last7).reduce((s, r) => s + r.durationMinutes, 0);
    if (weekMins < 20) { riskScore += 2; reasons.push(`Bu hafta ${weekMins} dk çalışıldı — çok az!`); }
    else if (weekMins < 60) { riskScore += 1; reasons.push(`Bu hafta ${weekMins} dk çalışıldı.`); }

    // 3. Zayıf konular
    const weakTopics = topics.filter(t => t.courseName === course.name && (t.status === 'Bilmiyorum' || t.status === 'Az biliyorum'));
    if (weakTopics.length >= 3) { riskScore += 2; reasons.push(`${weakTopics.length} zayıf konu mevcut.`); }
    else if (weakTopics.length > 0) { riskScore += 1; reasons.push(`${weakTopics.length} eksik konu: ${weakTopics.slice(0,2).map(t=>t.name).join(', ')}`); }

    // 4. Devamsızlık
    const setting = attSettings?.[course.id];
    const att = attMap?.[course.id];
    if (setting && att) {
      const ratio = (att.used || 0) / (setting.limit || 1);
      if (ratio >= 0.8) { riskScore += 3; reasons.push(`Devamsızlık hakkının %${Math.round(ratio*100)}'i kullanıldı!`); }
      else if (ratio >= 0.6) { riskScore += 1; reasons.push(`Devamsızlık riski: %${Math.round(ratio*100)} kullanıldı.`); }
    }

    if (riskScore === 0) return;

    let riskLevel;
    if (riskScore >= 6) riskLevel = RISK_LEVELS.CRITICAL;
    else if (riskScore >= 4) riskLevel = RISK_LEVELS.HIGH;
    else if (riskScore >= 2) riskLevel = RISK_LEVELS.MEDIUM;
    else riskLevel = RISK_LEVELS.LOW;

    warnings.push({
      id: course.id,
      courseName: course.name,
      riskLevel,
      riskScore,
      reasons,
      nearestExam,
      weekMins,
    });
  });

  return warnings.sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
};
