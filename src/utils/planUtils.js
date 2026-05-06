import { getDaysUntil, formatDate } from './dateUtils';

export const generateStudyPlan = (exam, topicProgress, dailyGoalMins) => {
  const daysLeft = getDaysUntil(exam.dateString);
  if (daysLeft <= 0) return []; // Gelecekte değil

  const plan = [];
  const courseTopics = topicProgress.filter(t => t.courseName === exam.name);
  
  // Konuları zayıftan güçlüye sırala
  const weakTopics = courseTopics.filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum');
  const strongTopics = courseTopics.filter(t => t.status === 'Orta' || t.status === 'İyi biliyorum');
  const allSorted = [...weakTopics, ...strongTopics];

  // Günlere dağıt (Sınavdan önceki 1 gün genel tekrar)
  const studyDays = Math.max(1, daysLeft - 1);
  const minsPerDay = Math.min(120, dailyGoalMins || 60); // Max 2 saat o ders için

  let currentTopicIndex = 0;
  for (let i = 0; i < studyDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    
    let dailyTopic = "Genel Çalışma";
    if (allSorted.length > 0) {
      dailyTopic = allSorted[currentTopicIndex % allSorted.length].name;
      currentTopicIndex++;
    }

    plan.push({
      id: `p_${Date.now()}_${i}`,
      dateString: d.toISOString(),
      displayDate: formatDate(d),
      topic: dailyTopic,
      suggestedMinutes: minsPerDay,
      completed: false
    });
  }

  // Sınavdan 1 gün önce Genel Tekrar
  if (daysLeft > 1) {
    const d = new Date(exam.dateString);
    d.setDate(d.getDate() - 1);
    plan.push({
      id: `p_${Date.now()}_review`,
      dateString: d.toISOString(),
      displayDate: formatDate(d),
      topic: 'Tüm Konular Genel Tekrar ve Deneme Çözümü',
      suggestedMinutes: Math.floor(minsPerDay * 1.5),
      completed: false
    });
  }

  return plan;
};
