import { useTheme } from '../context/ThemeContext';
import { getDaysUntil } from './dateUtils';

/**
 * Calculates priority score for an exam based on multiple factors.
 * @param {Object} exam 
 * @param {Number} weekStudyMinutes 
 * @returns {Object} { score, label, color }
 */
export const calculateExamPriority = (exam, weekStudyMinutes = 0) => {
  const { colors: Colors, isDark } = useTheme();

  let score = 0;
  
  // 1. Kalan gün faktörü (max 50 puan)
  const daysLeft = getDaysUntil(exam.dateString);
  if (daysLeft <= 0) score += 50;
  else if (daysLeft <= 3) score += 40;
  else if (daysLeft <= 7) score += 30;
  else if (daysLeft <= 14) score += 15;
  else score += 5;

  // 2. Sınav türü faktörü (max 20 puan)
  if (exam.type === 'Final') score += 20;
  else if (exam.type === 'Vize') score += 15;
  else if (exam.type === 'Proje') score += 10;
  else score += 5;

  // 3. Konu yoğunluğu faktörü (max 15 puan)
  const topicCount = exam.topics ? exam.topics.split(',').length : 0;
  if (topicCount >= 5) score += 15;
  else if (topicCount >= 3) score += 10;
  else if (topicCount > 0) score += 5;

  // 4. Çalışma süresi faktörü (max 15 puan)
  // Eğer haftalık çalışma azsa, risk artar (puan artar)
  if (weekStudyMinutes < 60) score += 15;
  else if (weekStudyMinutes < 120) score += 10;
  else if (weekStudyMinutes < 240) score += 5;

  // Sınıflandırma
  if (score >= 70) {
    return { label: 'Yüksek', color: Colors.danger };
  } else if (score >= 40) {
    return { label: 'Orta', color: Colors.accent };
  } else {
    return { label: 'Düşük', color: Colors.primary };
  }
};
