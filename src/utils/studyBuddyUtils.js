import { getDaysUntil } from './dateUtils';

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Enhanced Intent Detection
export const detectUserIntent = (message) => {
  const lowerMsg = message.toLowerCase();
  
  // High-Level Subject Recognition
  if (/(matematik|geometri|denklem|integral|türev|sayı|problem|fonksiyon)/i.test(lowerMsg)) return 'subject_math';
  if (/(fizik|kimya|biyoloji|fen|deney|atom|molekül|kuvvet|enerji)/i.test(lowerMsg)) return 'subject_science';
  if (/(tarih|coğrafya|felsefe|edebiyat|yazar|eser|toplum|sosyal)/i.test(lowerMsg)) return 'subject_social';
  if (/(ingilizce|dil|kelime|grammar|vocabulary|konuşma|writing)/i.test(lowerMsg)) return 'subject_language';
  
  // Intellectual Study Coaching
  if (/(pomodoro|feynman|teknik|yöntem|nasıl çalışılır|verimli|odaklanma)/i.test(lowerMsg)) return 'study_techniques';
  
  // Social & Emotional Intelligence
  if (/(nasılsın|naber|durumlar|ne yapıyorsun)/i.test(lowerMsg)) return 'greeting_how_are_you';
  if (/(merhaba|selam|hey|günaydın|tünaydın|iyi akşamlar)/i.test(lowerMsg)) return 'greeting_hello';
  if (/(şaka|komik|espri|güldür|neşe)/i.test(lowerMsg)) return 'joke';
  if (/(yoruldum|bıktım|zor|stres|sıkıldım|bırakmak|yapamıyorum|moral)/i.test(lowerMsg)) return 'support_needed';
  if (/(teşekkür|sağol|teşekkürler|helal|başarılı)/i.test(lowerMsg)) return 'praise';
  
  // Data-Driven Insights
  if (/(sınav|viz|final|ne zaman|tarih)/i.test(lowerMsg)) return 'exams';
  if (/(risk|başarı|durumum|nasılım|seviye)/i.test(lowerMsg)) return 'risks';
  if (/(devam|yoklama|okul|devamsızlık)/i.test(lowerMsg)) return 'attendance';
  if (/(alışkanlık|rutin|zincir|hedef)/i.test(lowerMsg)) return 'habits';
  if (/(ne yapayım|plan|tavsiye|öneri|yol haritası)/i.test(lowerMsg)) return 'what_to_do';
  if (/(özet|analiz|hafta|rapor)/i.test(lowerMsg)) return 'summary';
  
  return 'general';
};

const RESPONSES = {
  greeting_hello: [
    "Merhaba. Bugünkü akademik hedeflerinize odaklanmak için hazırım. Hangi konu üzerinde çalışmaya başlayacağız?",
    "İyi günler. Çalışma programınızdaki öncelikleri belirlemek ve verimliliğinizi artırmak adına size nasıl yardımcı olabilirim?",
    "Merhaba. Mevcut verileriniz ışığında bugün odaklanmanız gereken alanları analiz edebiliriz.",
  ],
  greeting_how_are_you: [
    "Teşekkür ederim. Sistemim tamamen performans verilerinizi en üst seviyeye taşımak üzere optimize edildi. Sizin bugünkü motivasyon durumunuz nedir?",
    "Verimlilik katsayım oldukça yüksek. Sizin de çalışma disiplininizi koruduğunuzu görmek memnuniyet verici. Akademik planınıza sadık mısınız?",
  ],
  subject_math: [
    "Matematik disiplini, analitik düşünme ve sistematik pratik gerektirir. Temel teoremleri kavradıktan sonra soru çözümüyle ilerlemek en rasyonel yaklaşımdır.",
    "Matematiksel problemlerde zorlanıyorsanız, karmaşık yapıyı daha küçük ve çözülebilir parçalara ayırmanızı öneririm.",
  ],
  subject_science: [
    "Fen bilimleri metodolojisi, kavramsal anlamayı ve uygulama yetisini temel alır. Konu eksiklerinizi tamamlamak adına şematik özetlerden faydalanabilirsiniz.",
    "Biyoloji, fizik veya kimya alanlarında kalıcı öğrenme için deney ve gözlem odaklı kaynakları incelemeniz verimliliğinizi artıracaktır.",
  ],
  subject_social: [
    "Sosyal bilimlerde başarı, sentez yeteneği ve geniş bir perspektif ile mümkündür. Konular arasındaki nedensellik bağlarını kurarak ilerlemelisiniz.",
    "Tarih veya edebiyat gibi alanlarda kavram haritaları oluşturmak, geniş müfredat bilgilerini yapılandırmanıza yardımcı olacaktır.",
  ],
  study_techniques: [
    "Pomodoro tekniği, bilişsel yükü yönetmek adına 25 dakikalık odaklanma ve 5 dakikalık dinlenme periyotları sunar. Bu yöntemi uygulamanızı tavsiye ederim.",
    "Feynman Tekniği, bir konuyu başkasına anlatıyormuş gibi ifade ederek eksik noktalarınızı tespit etmenizi sağlar. Derinlemesine öğrenme için idealdir.",
  ],
  support_needed: [
    "Zihinsel yorgunluk, yoğun çalışma dönemlerinde beklenen bir durumdur. Kısa bir ara vererek odaklanma kapasitenizi yeniden yapılandırabilirsiniz. Hedeflerinize sadık kalın.",
    "Akademik süreçlerde karşılaşılan zorluklar, gelişimin bir parçasıdır. Disiplininizi bozmadan planınıza devam etmeniz, uzun vadeli başarınızın anahtarıdır.",
  ],
  joke: [
    "Bilimsel bir espri: Bir atom neden her zaman pozitiftir? Çünkü elektron kaybettiğinde bile yapısını korumaya odaklanır. Şimdi biz de çalışmamıza odaklanalım.",
    "Akademik bir anekdot: Kitaplar kavga etmez çünkü her zaman yeni bir sayfa açma kapasitesine sahiptirler. Çalışmalarınıza devam etmenizi öneririm.",
  ],
  praise: [
    "Teşekkür ederim. Gösterdiğiniz disiplin ve verilerinizdeki artış, akademik başarınızın somut bir göstergesidir.",
    "Rica ederim. Analitik desteğimle hedeflerinize ulaşmanız benim temel fonksiyonumdur. Aynı kararlılıkla devam ediniz.",
  ],
  fallback: [
    "Bu konu hakkında veri tabanımda spesifik bir bilgi bulunmamaktadır. Ancak akademik takviminiz veya çalışma verileriniz üzerine konuşmaya devam edebiliriz.",
    "Belirttiğiniz ifadeyi tam olarak analiz edemedim. Odaklanma süreniz veya yaklaşan sınavlarınız gibi daha teknik konulara yoğunlaşabiliriz.",
    "Mevcut durumunuzu iyileştirmek adına şu an en verimli adımın, bekleyen en kritik dersinize odaklanmak olduğunu öngörüyorum.",
  ],
};

const applyPersonality = (text, personality, appData) => {
  const name = appData?.userName || 'Kullanıcı';
  
  if (personality === 'Destekleyici') {
    return `Akademik Destek: Sayın ${name}, ${text} Başarıya giden yolda yanınızdayım.`;
  }
  if (personality === 'Net ve dürüst') {
    return `Analiz: ${name}, mevcut durumunuz şu: ${text} Başarı, disiplinden ödün vermeyenlerindir.`;
  }
  if (personality === 'Motive edici') {
    return `Strateji: Sayın ${name}, ${text} Potansiyelinizi performansa dönüştürme vaktidir.`;
  }
  
  // Standard Professional
  return `${text.replace('Kullanıcı', name)}`;
};

export const generateStudyBuddyReply = (userMessage, appData, personality) => {
  const intent = detectUserIntent(userMessage);
  
  if (intent === 'summary') return generateSummaryReply(appData, personality);
  if (intent === 'exams') return generateExamStatusReply(appData, personality);
  if (intent === 'risks') return generateRiskReply(appData, personality);
  if (intent === 'attendance') return generateAttendanceReply(appData, personality);
  if (intent === 'habits') return generateHabitReply(appData, personality);
  if (intent === 'what_to_do') return generateSmallStepSuggestion(appData, personality);

  const pool = RESPONSES[intent] || RESPONSES['fallback'];
  const baseText = random(pool);
  
  return applyPersonality(baseText, personality, appData);
};

const generateSummaryReply = (appData, personality) => {
  const { sessions, dailyGoalMins } = appData;
  const todayStr = new Date().toDateString();
  const todayMins = (sessions || []).filter(s => s.dateString === todayStr).reduce((sum, s) => sum + s.durationMinutes, 0);

  let txt = `Günlük performans raporu: Bugün toplam ${todayMins} dakika çalışma tamamlandı.`;
  if (todayMins >= dailyGoalMins) txt += ` Belirlenen hedef (${dailyGoalMins}dk) aşılarak yüksek verimlilik sağlanmıştır. Disiplininiz takdire şayandır.`;
  else if (todayMins > 0) txt += ` Hedefe ulaşmak için ${dailyGoalMins - todayMins} dakikalık ek bir çalışma seansı gerekmektedir.`;
  else txt = "Bugün henüz bir çalışma verisi kaydedilmemiştir. Programınıza başlamanız önerilir.";

  return applyPersonality(txt, personality, appData);
};

const generateExamStatusReply = (appData, personality) => {
  const { exams } = appData;
  if (!exams || exams.length === 0) return applyPersonality("Sistemde kayıtlı aktif bir sınav verisi bulunmamaktadır. Veri girişi yapmanız analiz yeteneğimi artıracaktır.", personality, appData);
  
  const futureExams = exams.filter(e => getDaysUntil(e.dateString) >= 0).sort((a,b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));
  if (futureExams.length === 0) return applyPersonality("Yakın tarihli bir sınav tespit edilmedi. Mevcut zamanı eksik olduğunuz akademik alanlara ayırmanız stratejik olacaktır.", personality, appData);

  const nearest = futureExams[0];
  const daysLeft = getDaysUntil(nearest.dateString);
  let txt = `${nearest.name} sınavına kalan süre: ${daysLeft} gün.`;
  
  if (daysLeft <= 3) txt += ` Kritik hazırlık evresindesiniz. Genel tekrar ve deneme testlerine yoğunlaşmanız elzemdir.`;
  else txt += ` Zaman yönetimi planınıza sadık kalarak konu dağılımını optimize ediniz.`;
  
  return applyPersonality(txt, personality, appData);
};

const generateRiskReply = (appData, personality) => {
  return applyPersonality("Akademik risk analizi: Mevcut verileriniz doğrultusunda performansınız stabil görünmektedir. Sürekliliği korumanız başarınızı garanti altına alacaktır.", personality, appData);
};

const generateAttendanceReply = (appData, personality) => {
  const { attMap, attSettings, courses } = appData;
  if (!courses || courses.length === 0) return applyPersonality("Devamsızlık analizi için ders bilgilerinin sisteme tanımlanmış olması gerekmektedir.", personality, appData);
  
  let riskyCourses = [];
  courses.forEach(c => {
    const limit = attSettings?.[c.id]?.limit;
    const used = attMap?.[c.id]?.used || 0;
    if (limit && limit > 0 && (used / limit) >= 0.8) riskyCourses.push(c.name);
  });

  if (riskyCourses.length > 0) {
    return applyPersonality(`Kritik Uyarı: ${riskyCourses.join(', ')} derslerinde devamsızlık limitine ulaşıldı. Akademik kayıp yaşamamak adına katılım zorunludur.`, personality, appData);
  }
  return applyPersonality("Devamsızlık verileriniz yasal sınırlar dahilindedir. Mevcut katılım oranını korumanız önerilir.", personality, appData);
};

const generateHabitReply = (appData, personality) => {
  const { habits } = appData;
  if (!habits || habits.length === 0) return applyPersonality("Disiplinli bir akademik hayat için günlük rutinlerin sisteme tanımlanması önerilir.", personality, appData);
  
  const completed = habits.filter(h => h.completed).length;
  if (completed === habits.length) return applyPersonality("Günlük rutinlerin tamamı başarıyla yerine getirilmiştir. Bu istikrar hedeflerinize ulaşmanızı hızlandıracaktır.", personality, appData);
  
  return applyPersonality(`Bugün tanımlanan ${habits.length} rutinden ${completed} tanesi tamamlanmıştır. Kalan hedeflerin gün bitmeden yerine getirilmesi planlanmaktadır.`, personality, appData);
};

const generateSmallStepSuggestion = (appData, personality) => {
  const { exams } = appData;
  const futureExams = (exams || []).filter(e => getDaysUntil(e.dateString) >= 0).sort((a,b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));

  if (futureExams.length > 0) {
    return applyPersonality(`Biliysel odaklanma problemi yaşıyorsanız, sadece 15 dakikanızı ${futureExams[0].name} dersindeki temel bir kavrama ayırarak süreci başlatınız.`, personality, appData);
  }
  return applyPersonality("Zaman yönetimi stratejisi: Mevcut karmaşık planları minimize ederek, en az 20 dakikalık odaklanmış bir çalışma seansı ile başlangıç yapınız.", personality, appData);
};

export const generateMiniAdvice = (appData) => {
  const { exams, sessions, dailyGoalMins } = appData;
  const todayStr = new Date().toDateString();
  const todayMins = (sessions || []).filter(s => s.dateString === todayStr).reduce((sum, s) => sum + s.durationMinutes, 0);
  
  if (exams && exams.length > 0) {
    const futureExams = exams.filter(e => getDaysUntil(e.dateString) >= 0).sort((a,b) => getDaysUntil(a.dateString) - getDaysUntil(b.dateString));
    if (futureExams.length > 0 && getDaysUntil(futureExams[0].dateString) <= 3) {
      return `Kritik Uyarı: ${futureExams[0].name} sınavına hazırlık sürecine yoğunlaşınız.`;
    }
  }

};
