export const generateCoachGreeting = (userName, sessions, exams, habits, dailyGoalMins) => {
  const hour = new Date().getHours();
  let timeGreeting = 'Merhaba';
  if (hour < 12) timeGreeting = 'Günaydın';
  else if (hour < 18) timeGreeting = 'İyi günler';
  else timeGreeting = 'İyi akşamlar';

  const todayStr = new Date().toDateString();
  const todaySessions = sessions.filter(s => s.dateString === todayStr);
  const todayMins = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // If haven't studied yet
  if (todayMins === 0) {
    if (hour > 16) {
      return `${timeGreeting} ${userName}, bugün henüz çalışmaya başlamadın. Zaman daralıyor ama hala harika işler çıkarabiliriz. Hemen bir odaklanma seansına ne dersin?`;
    }
    return `${timeGreeting} ${userName}! Bugün yepyeni bir sayfa. Hedeflerimize ulaşmak için harika bir gün. Nereden başlamak istersin?`;
  }

  // If studied some
  if (todayMins > 0 && todayMins < dailyGoalMins) {
    const remaining = dailyGoalMins - todayMins;
    return `${timeGreeting} ${userName}! Bugün ${todayMins} dakika çalıştın, harika gidiyorsun. Günlük hedefine ulaşmak için sadece ${remaining} dakikan kaldı. Devam edelim mi?`;
  }

  // If goal reached
  if (todayMins >= dailyGoalMins) {
    return `Tebrikler ${userName}! 🎯 Bugün ${todayMins} dakika çalışarak günlük hedefini aştın. Seninle gurur duyuyorum. Şimdi dinlenmeyi hak ettin veya sınırlarını zorlayabilirsin!`;
  }

  return `${timeGreeting} ${userName}! Sana nasıl yardımcı olabilirim?`;
};

export const generateCoachResponse = (actionType, data) => {
  const { userName, exams, topics, habits } = data;

  switch (actionType) {
    case 'motivation':
      const quotes = [
        "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
        "Mükemmel olmak zorunda değilsin, sadece dünden daha iyi ol.",
        "En zor adım, ilk adımı atmaktır. Sadece 5 dakika ile başla!",
        "Gelecekteki sen, bugünkü sana teşekkür edecek. Bunu unutma.",
        "Potansiyelini ancak sınırlarını zorladığında görebilirsin."
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
      
    case 'next_task':
      if (exams && exams.length > 0) {
        // Find nearest exam
        const futureExams = exams.filter(e => new Date(e.dateString) >= new Date()).sort((a,b) => new Date(a.dateString) - new Date(b.dateString));
        if (futureExams.length > 0) {
          const nearest = futureExams[0];
          return `Sırada "${nearest.courseName}" dersinin sınavı var. Bu dersteki eksiklerini kapatarak başlamanı şiddetle tavsiye ederim.`;
        }
      }
      if (habits && habits.length > 0) {
        const uncompleted = habits.filter(h => !h.completed);
        if (uncompleted.length > 0) {
          return `Bugün henüz "${uncompleted[0].name}" alışkanlığını tamamlamadın. Çalışmaya ara verip bunu aradan çıkarmak iyi bir fikir olabilir.`;
        }
      }
      return `Şu an için acil bir sınavın görünmüyor. "Genel Tekrar" yaparak bilgini taze tutabilirsin.`;

    case 'summary':
      return `Kısaca durumun şu: Alışkanlıklarının %${Math.round((habits.filter(h=>h.completed).length / (habits.length||1)) * 100)}'ü tamamlandı. Günlük hedefine doğru ilerliyorsun. Disiplini elden bırakma!`;

    default:
      return "Seni dinliyorum. Birlikte nasıl bir yol çizelim?";
  }
};
