// timeBlockingUtils.js — Boş Zaman Bloklarına Göre Çalışma Önerisi
import { getDaysUntil } from './dateUtils';

export const generateTimeBlockSuggestions = (timeBlocks, courses, exams, topics, sessions) => {
  const todayStr = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][new Date().getDay()];
  const todayBlocks = timeBlocks.filter(b => b.day === todayStr);

  if (todayBlocks.length === 0) return [];

  // Öncelikli dersler (sınava yakınlığa göre)
  const prioritySubjects = exams
    .filter(e => getDaysUntil(e.dateString) >= 0 && getDaysUntil(e.dateString) <= 14)
    .sort((a, b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString))
    .map(e => e.courseName);

  const weakSubjects = [...new Set(topics.filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum').map(t => t.courseName))];

  const subjectQueue = [...new Set([...prioritySubjects, ...weakSubjects, ...courses.map(c => c.name)])];
  let subjectIndex = 0;

  const suggestions = [];

  todayBlocks.forEach(block => {
    const [startH, startM] = block.startTime.split(':').map(Number);
    const [endH, endM] = block.endTime.split(':').map(Number);
    const totalMins = (endH * 60 + endM) - (startH * 60 + startM);

    if (totalMins < 20) return;

    const subject = subjectQueue[subjectIndex % subjectQueue.length];
    subjectIndex++;

    suggestions.push({
      id: `suggestion_${block.id}`,
      blockId: block.id,
      subject,
      startTime: block.startTime,
      endTime: block.endTime,
      durationMinutes: totalMins,
      reason: prioritySubjects.includes(subject)
        ? `${subject} sınavı yaklaşıyor.`
        : weakSubjects.includes(subject)
          ? `${subject} için zayıf konular var.`
          : `Bu ders bu hafta az çalışıldı.`
    });
  });

  return suggestions;
};
