export const todayData = {
  stats: {
    studyTime: "2s 10dk",
    upcomingExam: { name: "OOP Vize", daysLeft: 4 },
    habitsCompleted: 4,
    habitsTotal: 6,
    activeReminders: 3,
  },
  timeline: [
    { id: 1, time: "09:00", title: "Matematik dersi", type: "class" },
    { id: 2, time: "11:30", title: "OOP tekrar", type: "study" },
    { id: 3, time: "14:00", title: "İngilizce dersi", type: "class" },
    { id: 4, time: "18:00", title: "45 dk Java çalışma", type: "study" },
    { id: 5, time: "21:30", title: "Uyku rutini", type: "routine" },
  ],
  weeklyStudy: [
    { day: "Pzt", hours: 2.5 },
    { day: "Sal", hours: 1.5 },
    { day: "Çar", hours: 3 },
    { day: "Per", hours: 1 },
    { day: "Cum", hours: 2 },
    { day: "Cmt", hours: 0.5 },
    { day: "Paz", hours: 1.2 },
  ],
  suggestions: [
    "OOP sınavına 4 gün kaldı, bugün 1 saat tekrar önerilir.",
    "Matematik bu hafta az çalışılmış.",
    "Alışkanlık tamamlama oranın %67."
  ]
};

export const scheduleData = [
  {
    day: "Pazartesi",
    classes: [
      { id: 1, time: "09:00", name: "Matematik", location: "D204" },
      { id: 2, time: "13:00", name: "Programlama", location: "Lab 2" }
    ]
  },
  {
    day: "Salı",
    classes: [
      { id: 3, time: "10:30", name: "Fizik", location: "Amfi 1" },
      { id: 4, time: "14:00", name: "İngilizce", location: "D105" }
    ]
  },
  {
    day: "Çarşamba",
    classes: [
      { id: 5, time: "09:00", name: "Lineer Cebir", location: "D205" },
      { id: 6, time: "15:00", name: "Veri Yapıları", location: "Lab 1" }
    ]
  }
];

export const examsData = [
  {
    id: 1,
    name: "OOP Vize",
    date: "12 Mayıs",
    time: "10:00",
    daysLeft: 4,
    topics: "Inheritance, Polymorphism, Abstract Class"
  },
  {
    id: 2,
    name: "Matematik Final",
    date: "20 Mayıs",
    time: "13:30",
    daysLeft: 12,
    topics: "Türev, İntegral, Limit"
  },
  {
    id: 3,
    name: "Veri Yapıları",
    date: "25 Mayıs",
    time: "09:00",
    daysLeft: 17,
    topics: "Trees, Graphs, Sorting Algorithms"
  }
];

export const studyRecordsData = [
  { id: 1, subject: "OOP", duration: "45 dk", topic: "Inheritance" },
  { id: 2, subject: "Matematik", duration: "30 dk", topic: "Limit tekrar" }
];

export const habitsData = [
  { id: 1, title: "2 saat ders çalış", completed: true },
  { id: 2, title: "6 bardak su iç", completed: true },
  { id: 3, title: "30 dk yürüyüş", completed: false },
  { id: 4, title: "7 saat uyku", completed: true },
  { id: 5, title: "Kitap oku", completed: false },
];
