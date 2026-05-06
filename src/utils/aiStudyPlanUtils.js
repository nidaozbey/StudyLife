import { getDaysUntil, formatDate } from './dateUtils';
import { calculateExamPreparation } from './preparationUtils';

export const generateAIStudyPlan = (exams, topics, sessions, quizResults, studyPlans, habits, courses, attMap, attSettings, timeBlocks, dailyGoalMins = 90) => {
  const planItems = [];
  let remainingMins = dailyGoalMins;

  const todayStr = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][new Date().getDay()];
  const todayBlocks = timeBlocks ? timeBlocks.filter(b => b.day === todayStr) : [];

  // 1. Prioritize Exams & Courses
  const futureExams = exams.filter(e => getDaysUntil(e.dateString) >= 0).sort((a,b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));
  
  if (futureExams.length > 0) {
    const exam = futureExams[0];
    const daysLeft = getDaysUntil(exam.dateString);
    const prep = calculateExamPreparation(exam, topics, sessions, quizResults, studyPlans);
    
    // Crisis mode if exam is in 1-2 days
    if (daysLeft <= 2) {
      planItems.push({
        id: `ai_${Date.now()}_crisis`,
        title: exam.courseName,
        topic: 'Kriz Modu: Genel Tekrar ve Çıkmış Sorular',
        suggestedMinutes: Math.min(120, remainingMins || 120),
        priority: 'Yüksek',
        completed: false,
        reasons: [`Sınava ${daysLeft} gün kaldı.`, `Sınav hazırlık oranı: %${prep}.`],
        type: 'exam_crisis'
      });
      return { id: `ai_plan_${Date.now()}`, date: new Date().toDateString(), items: planItems };
    }

    // Normal exam prep
    const examTopics = topics.filter(t => t.courseName === exam.courseName);
    const weakExamTopics = examTopics.filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum');
    
    if (weakExamTopics.length > 0 && remainingMins > 0) {
      const topicToStudy = weakExamTopics[0];
      const timeToAllocate = Math.min(45, remainingMins);
      planItems.push({
        id: `ai_${Date.now()}_exam_weak`,
        title: exam.courseName,
        topic: topicToStudy.name,
        suggestedMinutes: timeToAllocate,
        priority: 'Yüksek',
        completed: false,
        reasons: [`Yaklaşan ${exam.name} sınavı.`, `Bu konu "zayıf" olarak işaretlenmiş.`],
        type: 'exam_weak_topic'
      });
      remainingMins -= timeToAllocate;
    }
  }

  // 2. Attendance Warning Prep
  if (courses && attMap && remainingMins > 0) {
    for (const course of courses) {
      if (remainingMins <= 0) break;
      const setting = attSettings[course.id];
      const att = attMap[course.id];
      if (setting && att && setting.limit > 0) {
        if ((att.used / setting.limit) >= 0.7) {
          const timeToAllocate = Math.min(30, remainingMins);
          planItems.push({
            id: `ai_${Date.now()}_att_${course.id}`,
            title: course.name,
            topic: 'Dersi Kurtarma Çalışması',
            suggestedMinutes: timeToAllocate,
            priority: 'Orta',
            completed: false,
            reasons: [`Devamsızlık limiti kritik seviyede (%${Math.round((att.used/setting.limit)*100)}).`],
            type: 'attendance_prep'
          });
          remainingMins -= timeToAllocate;
        }
      }
    }
  }

  // 3. General Weak Topics
  if (remainingMins > 0) {
    const weakTopics = topics.filter(t => t.status === 'Bilmiyorum');
    for (const topic of weakTopics) {
      if (remainingMins <= 0) break;
      // Skip if already in plan
      if (!planItems.find(p => p.topic === topic.name)) {
        const timeToAllocate = Math.min(30, remainingMins);
        planItems.push({
          id: `ai_${Date.now()}_weak_${topic.id}`,
          title: topic.courseName,
          topic: topic.name,
          suggestedMinutes: timeToAllocate,
          priority: 'Orta',
          completed: false,
          reasons: [`Konu haritasında zayıf görünüyorsun.`],
          type: 'general_weak'
        });
        remainingMins -= timeToAllocate;
      }
    }
  }

  // 4. Fallback: Revision
  if (remainingMins > 0 && courses && courses.length > 0) {
    const timeToAllocate = remainingMins;
    const fallbackCourse = courses[Math.floor(Math.random() * courses.length)];
    planItems.push({
      id: `ai_${Date.now()}_fallback`,
      title: fallbackCourse.name,
      topic: 'Genel Tekrar',
      suggestedMinutes: timeToAllocate,
      priority: 'Düşük',
      completed: false,
      reasons: [`Günlük çalışma hedefini tamamlamak için genel tekrar.`],
      type: 'revision'
    });
  }

  return { id: `ai_plan_${Date.now()}`, date: new Date().toDateString(), items: planItems };
};

export const calculatePlanCompletionRate = (plan) => {
  if (!plan || !plan.items || plan.items.length === 0) return 0;
  const completed = plan.items.filter(i => i.completed).length;
  return Math.round((completed / plan.items.length) * 100);
};
