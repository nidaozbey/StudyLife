import { getDaysUntil } from './dateUtils';
import { getAttendancePercentage } from './attendanceUtils';

export const generateSmartSuggestions = (exams, habits, studySessions, dailyGoalMinutes, courses, attendanceMap = {}, riskScores = {}) => {
  const suggestions = [];

  // 1. Devamsızlık Analizi
  Object.keys(attendanceMap).forEach(courseName => {
    const data = attendanceMap[courseName];
    const p = getAttendancePercentage(data.used, data.limit);
    if (p >= 71) {
      suggestions.push({
        type: 'danger',
        text: `${courseName} dersinde devamsızlık limitine çok yaklaştın. (Risk: %${p})`
      });
    }
  });

  // 2. Risk Skoru Analizi
  Object.keys(riskScores).forEach(courseName => {
    if (riskScores[courseName] >= 61) {
      suggestions.push({
        type: 'danger',
        text: `${courseName} Akademik Risk Skoru YÜKSEK! Hemen çalışma planı oluştur.`
      });
    }
  });

  // 3. En yakın sınav analizi
  const futureExams = exams.filter(e => getDaysUntil(e.dateString) >= 0);
  const sortedExams = futureExams.sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
  
  if (sortedExams.length > 0) {
    const nearest = sortedExams[0];
    const daysLeft = getDaysUntil(nearest.dateString);
    
    const thisWeekSessions = studySessions.filter(s => {
      const d = new Date(s.timestamp);
      return ((new Date() - d) / (1000 * 60 * 60 * 24)) <= 7 && s.subject === nearest.name;
    });
    const minsStudied = thisWeekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    if (daysLeft <= 7) {
      if (minsStudied < 120) {
        suggestions.push({
          type: 'danger',
          text: `${nearest.name} sınavına ${daysLeft} gün kaldı. Bu hafta sadece ${minsStudied} dk çalıştın. Hemen tekrar yap!`
        });
      } else {
        suggestions.push({
          type: 'warning',
          text: `${nearest.name} sınavına ${daysLeft} gün kaldı. Çalışmaların iyi gidiyor.`
        });
      }
    }
  }

  // 4. Günlük Hedef Analizi
  const todaySessions = studySessions.filter(s => s.dateString === new Date().toDateString());
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  
  if (todayMinutes === 0) {
    suggestions.push({
      type: 'warning',
      text: `Bugün henüz ders çalışmadın. Kısa bir Pomodoro ile başlamaya ne dersin?`
    });
  } else if (todayMinutes < dailyGoalMinutes) {
    const left = dailyGoalMinutes - todayMinutes;
    suggestions.push({
      type: 'info',
      text: `Günlük hedefine ulaşmana ${left} dk kaldı. Hadi başarabilirsin!`
    });
  } else {
    suggestions.push({
      type: 'success',
      text: `Harika! Günlük çalışma hedefini tamamladın.`
    });
  }

  // 5. Alışkanlık Analizi
  if (habits.length > 0) {
    const completed = habits.filter(h => h.completed).length;
    const ratio = completed / habits.length;
    
    if (ratio < 0.5) {
      suggestions.push({
        type: 'warning',
        text: `Alışkanlıklarının henüz yarısını bile tamamlamadın.`
      });
    }
  }

  // 6. En az çalışılan ders analizi (Son 7 gün)
  if (courses && courses.length > 0 && studySessions.length > 0) {
    const courseStudyMap = {};
    courses.forEach(c => courseStudyMap[c.name] = 0);
    
    studySessions.forEach(s => {
      const d = new Date(s.timestamp);
      if ((new Date() - d) / (1000*60*60*24) <= 7 && courseStudyMap[s.subject] !== undefined) {
        courseStudyMap[s.subject] += s.durationMinutes;
      }
    });

    let minSubject = null;
    let minTime = Infinity;
    for (const [subj, time] of Object.entries(courseStudyMap)) {
      if (time < minTime) {
        minTime = time;
        minSubject = subj;
      }
    }

    if (minSubject && minTime < 60 && suggestions.length < 5) {
      suggestions.push({
        type: 'info',
        text: `${minSubject} dersi bu hafta az çalışılmış. 30 dakikalık kısa tekrar iyi olur.`
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'success',
      text: `Her şey mükemmel gidiyor. Süpersin!`
    });
  }

  // Sort by severity (danger first, then warning, info, success)
  const severityMap = { danger: 0, warning: 1, info: 2, success: 3 };
  const sortedSuggs = suggestions.sort((a,b) => severityMap[a.type] - severityMap[b.type]);

  return sortedSuggs.slice(0, 5); // Return max 5 suggestions
};
