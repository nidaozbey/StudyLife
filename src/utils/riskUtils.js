import { getDaysUntil } from './dateUtils';
import { useTheme } from '../context/ThemeContext';

// Calculate score 0-100. Higher is more risky.
export const calculateAcademicRiskScore = (courseName, exams, studySessions, topicProgress, attendancePercent, dailyGoalsMet) => {
  const { colors: Colors, isDark } = useTheme();

  let score = 0;
  
  // 1. Exams Risk (Max 30)
  const futureExams = exams.filter(e => e.name === courseName && getDaysUntil(e.dateString) >= 0);
  if (futureExams.length > 0) {
    const nearest = futureExams.sort((a,b) => new Date(a.dateString) - new Date(b.dateString))[0];
    const daysLeft = getDaysUntil(nearest.dateString);
    if (daysLeft <= 3) score += 30;
    else if (daysLeft <= 7) score += 20;
    else if (daysLeft <= 14) score += 10;
  }

  // 2. Study Time Risk (Max 25)
  const thisWeekMins = studySessions.filter(s => {
    const d = new Date(s.timestamp);
    return s.subject === courseName && ((new Date() - d) / (1000 * 60 * 60 * 24) <= 7);
  }).reduce((sum, s) => sum + s.durationMinutes, 0);

  if (thisWeekMins === 0) score += 25;
  else if (thisWeekMins < 60) score += 15;
  else if (thisWeekMins < 120) score += 5;

  // 3. Topic Progress Risk (Max 20)
  const courseTopics = topicProgress.filter(t => t.courseName === courseName);
  if (courseTopics.length > 0) {
    const weakTopics = courseTopics.filter(t => t.status === 'Bilmiyorum' || t.status === 'Az biliyorum').length;
    const weakRatio = weakTopics / courseTopics.length;
    score += Math.min(20, Math.round(weakRatio * 20));
  } else {
    // If no topics defined, assume some risk if exams are near
    score += 10;
  }

  // 4. Attendance Risk (Max 15)
  if (attendancePercent >= 80) score += 15;
  else if (attendancePercent >= 60) score += 10;
  else if (attendancePercent >= 40) score += 5;

  // 5. Daily Goals Consistency Risk (Max 10)
  if (!dailyGoalsMet) score += 10;

  return Math.min(100, score);
};

export const getRiskLevel = (score) => {
  if (score >= 61) return { label: 'Yüksek Risk', color: Colors.danger };
  if (score >= 31) return { label: 'Orta Risk', color: Colors.accent };
  return { label: 'Düşük Risk', color: Colors.primary };
};
