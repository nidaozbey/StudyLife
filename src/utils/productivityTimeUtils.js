// productivityTimeUtils.js — Verimli Saatler Analizi

export const analyzeProductivityTimes = (sessions) => {
  if (sessions.length === 0) {
    return { peakHour: null, peakDay: null, summary: 'Yeterli çalışma verisi yok.', hourlyData: [] };
  }

  const hourBuckets = {};
  const dayBuckets = {};
  const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  sessions.forEach(s => {
    const d = new Date(s.timestamp);
    const hour = d.getHours();
    const day = d.getDay();
    const mins = s.durationMinutes || 0;
    hourBuckets[hour] = (hourBuckets[hour] || 0) + mins;
    dayBuckets[day] = (dayBuckets[day] || 0) + mins;
  });

  const peakHourEntry = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
  const peakDayEntry = Object.entries(dayBuckets).sort((a, b) => b[1] - a[1])[0];

  const peakHour = peakHourEntry ? parseInt(peakHourEntry[0]) : null;
  const peakDay = peakDayEntry ? DAYS[parseInt(peakDayEntry[0])] : null;

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i.toString().padStart(2, '0')}:00`,
    minutes: hourBuckets[i] || 0
  }));

  let summary = '';
  if (peakHour !== null) summary = `En verimli saatin ${peakHour}:00–${peakHour + 1}:00 arası.`;
  if (peakDay) summary += ` En çok çalıştığın gün: ${peakDay}.`;

  return { peakHour, peakDay, summary, hourlyData };
};
