export const getDaysUntil = (targetDateStr) => {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr);
  target.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatTime = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const formatDate = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]}`;
};

export const isToday = (dateObj) => {
  const d = new Date(dateObj);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

export const isThisWeek = (dateObj) => {
  const d = new Date(dateObj);
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
  return d >= firstDay && d <= lastDay;
};

export const getWeekday = (dateObj) => {
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return days[new Date(dateObj).getDay()];
};

export const calculateDurationMinutes = (startTimeStr, endTimeStr) => {
  if (!startTimeStr || !endTimeStr) return 0;
  const [sh, sm] = startTimeStr.split(':').map(Number);
  const [eh, em] = endTimeStr.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
};

export const formatMinutesToHourText = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return "0 dk";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}s ${m}dk`;
  if (h > 0) return `${h}s`;
  return `${m}dk`;
};

export const formatDuration = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const sortByDate = (items, dateKey = 'dateString', ascending = true) => {
  return items.sort((a, b) => {
    const da = new Date(a[dateKey]).getTime();
    const db = new Date(b[dateKey]).getTime();
    return ascending ? da - db : db - da;
  });
};

export const getCurrentWeekRange = () => {
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
  return { firstDay, lastDay };
};

export const groupByDay = (items, dayKey = 'day') => {
  return items.reduce((acc, item) => {
    const day = item[dayKey];
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
};

// Backwards compatibility alias
export const calculateDaysLeft = getDaysUntil;
export const formatMinutesToHours = formatMinutesToHourText;
