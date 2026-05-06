import { useTheme } from '../context/ThemeContext';

export const getAttendancePercentage = (used, limit) => {
  const { colors: Colors, isDark } = useTheme();

  if (!limit || limit === 0) return 0;
  return Math.round((used / limit) * 100);
};

export const calculateAttendanceRisk = (used, limit) => {
  const percent = getAttendancePercentage(used, limit);
  if (percent >= 100) return 'Kritik';
  if (percent >= 71) return 'Yüksek';
  if (percent >= 41) return 'Orta';
  return 'Düşük';
};

export const getAttendanceRiskColor = (riskLabel) => {
  switch (riskLabel) {
    case 'Kritik': return Colors.danger;
    case 'Yüksek': return Colors.danger; // or dangerSecondary if added
    case 'Orta': return Colors.accent;
    case 'Düşük': return Colors.primary;
    default: return Colors.primary;
  }
};

export const getRemainingAbsenceLimit = (used, limit) => {
  return Math.max(0, limit - used);
};

export const groupAttendanceByCourse = (records) => {
  return records.reduce((acc, r) => {
    if (!acc[r.courseId]) acc[r.courseId] = { used: 0, records: [] };
    acc[r.courseId].used += r.amount;
    acc[r.courseId].records.push(r);
    return acc;
  }, {});
};
