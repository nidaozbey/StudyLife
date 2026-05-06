import { getDaysUntil, formatTime } from './dateUtils';

export const generateTodayProgramItems = (courses, exams, habits, sessions, aiPlan, attMap, attSettings, dailyGoal) => {
  const items = [];
  const todayStr = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][new Date().getDay()];
  const todayDateStr = new Date().toDateString();

  // 1. Classes
  const todayCourses = courses.filter(c => c.day === todayStr);
  todayCourses.forEach(c => {
    let hasRisk = false;
    const setting = attSettings?.[c.id];
    const att = attMap?.[c.id];
    if (setting && att && setting.limit > 0) {
      if ((att.used / setting.limit) >= 0.7) hasRisk = true;
    }

    items.push({
      id: `c_${c.id}`,
      time: c.startTime,
      title: c.name,
      subtitle: c.location,
      type: 'class',
      isPriority: hasRisk,
      isCompleted: false, // Could be determined by time
    });
  });

  // 2. AI Plan Items
  if (aiPlan && aiPlan.items) {
    aiPlan.items.forEach((pItem, idx) => {
      // Assign dummy times sequentially after 16:00
      const hour = 16 + Math.floor(idx / 2);
      const min = (idx % 2) * 30;
      items.push({
        id: `aip_${pItem.id}`,
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        title: `AI Plan: ${pItem.title}`,
        subtitle: `${pItem.topic} - ${pItem.suggestedMinutes} dk`,
        type: 'ai_plan',
        isPriority: pItem.priority === 'Yüksek',
        isCompleted: pItem.completed,
      });
    });
  }

  // 3. Exam warnings
  const upcomingExams = exams.filter(e => getDaysUntil(e.dateString) >= 0 && getDaysUntil(e.dateString) <= 3);
  upcomingExams.forEach(e => {
    items.push({
      id: `e_${e.id}`,
      time: '08:00', // show early in day
      title: `Sınav Yaklaşıyor: ${e.courseName}`,
      subtitle: `${e.name} sınavına ${getDaysUntil(e.dateString)} gün kaldı`,
      type: 'exam_warning',
      isPriority: true,
      isCompleted: false,
    });
  });

  // 4. Habits
  const uncompletedHabits = habits.filter(h => !h.completed);
  uncompletedHabits.forEach(h => {
    items.push({
      id: `h_${h.id}`,
      time: '20:00', // default habit time
      title: `Alışkanlık: ${h.name}`,
      subtitle: 'Bugün henüz tamamlanmadı',
      type: 'habit',
      isPriority: false,
      isCompleted: false,
    });
  });

  return sortTodayItemsByTime(items);
};

export const sortTodayItemsByTime = (items) => {
  return items.sort((a, b) => {
    const timeA = a.time || '23:59';
    const timeB = b.time || '23:59';
    return timeA.localeCompare(timeB);
  });
};
