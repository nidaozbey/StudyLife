import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  COURSES: '@courses',
  EXAMS: '@exams',
  HABITS: '@habits',
  STUDY_SESSIONS: '@studySessions',
  DAILY_GOALS: '@dailyGoals',
  COURSE_NOTES: '@courseNotes',
  NOTIFICATION_SETTINGS: '@notificationSettings',
  ONBOARDING_COMPLETED: '@onboardingCompleted',
  // V2 Keys
  ATTENDANCE_RECORDS: '@attendanceRecords',
  ATTENDANCE_SETTINGS: '@attendanceSettings',
  TOPIC_PROGRESS: '@topicProgress',
  QUIZ_RESULTS: '@quizResults',
  STUDY_PLANS: '@studyPlans',
  GAMIFICATION: '@gamification',
  APP_USAGE_LOGS: '@appUsageLogs',
  // V3 Keys
  TIME_BLOCKS: '@timeBlocks',
  COURSE_RESOURCES: '@courseResources',
  PAST_QUESTIONS: '@pastQuestions',
  APP_PREFERENCES: '@appPreferences',
  WEEKLY_PLANS: '@weeklyPlans',
  // V4 Keys
  AI_STUDY_PLANS: '@aiStudyPlans',
  FRIENDS: '@friends',
  FRIEND_CHALLENGES: '@friendChallenges',
  SHARE_CARDS: '@shareCards',
  USER_PROFILE: '@userProfile',
  // Study Buddy Keys
  STUDY_BUDDY_MESSAGES: '@studyBuddyMessages',
  STUDY_BUDDY_PREFERENCES: '@studyBuddyPreferences'
};

export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error saving ${key}`, e);
  }
};

export const clearKey = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing ${key}`, e);
  }
};

// Generic list operators
export const getList = async (key) => {
  const data = await getItem(key);
  return data || [];
};

export const addItem = async (key, item) => {
  const list = await getList(key);
  const newItem = { ...item, id: item.id || Date.now().toString() };
  await setItem(key, [...list, newItem]);
  return newItem;
};

export const updateItem = async (key, id, updates) => {
  const list = await getList(key);
  const updatedList = list.map(item => item.id === id ? { ...item, ...updates } : item);
  await setItem(key, updatedList);
};

export const deleteItem = async (key, id) => {
  const list = await getList(key);
  await setItem(key, list.filter(item => item.id !== id));
};

// ==========================================
// V1 Domain specific aliases
// ==========================================

export const getCourses = () => getList(KEYS.COURSES);
export const saveCourse = async (course) => course.id ? updateItem(KEYS.COURSES, course.id, course) : addItem(KEYS.COURSES, course);
export const deleteCourse = (id) => deleteItem(KEYS.COURSES, id);

export const getExams = () => getList(KEYS.EXAMS);
export const saveExam = async (exam) => exam.id ? updateItem(KEYS.EXAMS, exam.id, exam) : addItem(KEYS.EXAMS, exam);
export const deleteExam = (id) => deleteItem(KEYS.EXAMS, id);

export const getHabits = async () => {
  const habits = await getList(KEYS.HABITS);
  const today = new Date().toDateString();
  let needsUpdate = false;
  const updatedHabits = habits.map(h => {
    if (h.lastCompletedDate && h.lastCompletedDate !== today) {
      needsUpdate = true;
      return { ...h, completed: false, lastCompletedDate: null, currentProgress: 0 };
    }
    return h;
  });
  if (needsUpdate) await setItem(KEYS.HABITS, updatedHabits);
  return updatedHabits;
};
export const saveHabit = async (habit) => habit.id ? updateItem(KEYS.HABITS, habit.id, habit) : addItem(KEYS.HABITS, { ...habit, completed: false, currentProgress: 0 });
export const deleteHabit = (id) => deleteItem(KEYS.HABITS, id);
export const toggleHabit = async (id, isCompleted) => {
  const today = new Date().toDateString();
  await updateItem(KEYS.HABITS, id, { completed: isCompleted, lastCompletedDate: isCompleted ? today : null });
};

export const getStudySessions = () => getList(KEYS.STUDY_SESSIONS);
export const saveStudySession = async (session) => {
  const newSession = { ...session, dateString: new Date().toDateString(), timestamp: Date.now() };
  return addItem(KEYS.STUDY_SESSIONS, newSession);
};
export const deleteStudySession = (id) => deleteItem(KEYS.STUDY_SESSIONS, id);
export const getTodayStudySessions = async () => {
  const sessions = await getStudySessions();
  const today = new Date().toDateString();
  return sessions.filter(s => s.dateString === today);
};

export const getCourseNotes = async (courseId) => {
  const notes = await getList(KEYS.COURSE_NOTES);
  return notes.filter(n => n.courseId === courseId);
};
export const saveCourseNote = async (note) => note.id ? updateItem(KEYS.COURSE_NOTES, note.id, note) : addItem(KEYS.COURSE_NOTES, note);
export const deleteCourseNote = (id) => deleteItem(KEYS.COURSE_NOTES, id);

export const getDailyGoal = async () => {
  const goal = await getItem(KEYS.DAILY_GOALS);
  return goal || { targetMinutes: 120 };
};
export const setDailyGoal = async (targetMinutes) => {
  await setItem(KEYS.DAILY_GOALS, { targetMinutes });
};

export const getNotificationSettings = async () => {
  const settings = await getItem(KEYS.NOTIFICATION_SETTINGS);
  return settings || {
    courseReminderMinutes: 15,
    examReminderDays: 1,
    habitReminderTime: '20:00',
    studyReminderTime: '18:00',
    enabled: true,
    attendanceWarnings: true,
    riskWarnings: true
  };
};
export const saveNotificationSettings = async (settings) => setItem(KEYS.NOTIFICATION_SETTINGS, settings);

export const isOnboardingCompleted = async () => {
  const val = await getItem(KEYS.ONBOARDING_COMPLETED);
  return val === true;
};
export const completeOnboarding = async () => setItem(KEYS.ONBOARDING_COMPLETED, true);

// ==========================================
// V2 Domain specific aliases
// ==========================================

// Attendance
export const getAttendanceRecords = () => getList(KEYS.ATTENDANCE_RECORDS);
export const saveAttendanceRecord = async (record) => record.id ? updateItem(KEYS.ATTENDANCE_RECORDS, record.id, record) : addItem(KEYS.ATTENDANCE_RECORDS, record);
export const deleteAttendanceRecord = (id) => deleteItem(KEYS.ATTENDANCE_RECORDS, id);

export const getAttendanceSettings = async () => {
  const settings = await getItem(KEYS.ATTENDANCE_SETTINGS);
  return settings || {}; // { "courseId": { limit: 10, type: 'hour' } }
};
export const saveAttendanceSetting = async (courseId, setting) => {
  const settings = await getAttendanceSettings();
  settings[courseId] = setting;
  await setItem(KEYS.ATTENDANCE_SETTINGS, settings);
};

// Topic Progress
export const getTopicProgress = () => getList(KEYS.TOPIC_PROGRESS);
export const saveTopicProgress = async (topic) => topic.id ? updateItem(KEYS.TOPIC_PROGRESS, topic.id, topic) : addItem(KEYS.TOPIC_PROGRESS, topic);
export const deleteTopicProgress = (id) => deleteItem(KEYS.TOPIC_PROGRESS, id);

// Quiz Results
export const getQuizResults = () => getList(KEYS.QUIZ_RESULTS);
export const saveQuizResult = async (quiz) => quiz.id ? updateItem(KEYS.QUIZ_RESULTS, quiz.id, quiz) : addItem(KEYS.QUIZ_RESULTS, quiz);
export const deleteQuizResult = (id) => deleteItem(KEYS.QUIZ_RESULTS, id);

// Study Plans
export const getStudyPlans = () => getList(KEYS.STUDY_PLANS);
export const saveStudyPlan = async (plan) => plan.id ? updateItem(KEYS.STUDY_PLANS, plan.id, plan) : addItem(KEYS.STUDY_PLANS, plan);
export const deleteStudyPlan = (id) => deleteItem(KEYS.STUDY_PLANS, id);

// Gamification
export const getGamification = async () => {
  const data = await getItem(KEYS.GAMIFICATION);
  return data || { xp: 0, level: 1, unlockedBadges: [] };
};
export const saveGamification = async (data) => setItem(KEYS.GAMIFICATION, data);

// App Usage Logs (Consistency)
export const getAppUsageLogs = () => getList(KEYS.APP_USAGE_LOGS);
export const logAppUsage = async () => {
  const logs = await getAppUsageLogs();
  const today = new Date().toDateString();
  if (!logs.find(log => log.date === today)) {
    await addItem(KEYS.APP_USAGE_LOGS, { date: today, timestamp: Date.now() });
  }
};

// ==========================================
// V3 Domain specific aliases
// ==========================================

export const getTimeBlocks = () => getList(KEYS.TIME_BLOCKS);
export const saveTimeBlock = async (block) => block.id ? updateItem(KEYS.TIME_BLOCKS, block.id, block) : addItem(KEYS.TIME_BLOCKS, block);
export const deleteTimeBlock = (id) => deleteItem(KEYS.TIME_BLOCKS, id);

export const getCourseResources = () => getList(KEYS.COURSE_RESOURCES);
export const saveCourseResource = async (res) => res.id ? updateItem(KEYS.COURSE_RESOURCES, res.id, res) : addItem(KEYS.COURSE_RESOURCES, res);
export const deleteCourseResource = (id) => deleteItem(KEYS.COURSE_RESOURCES, id);

export const getPastQuestions = () => getList(KEYS.PAST_QUESTIONS);
export const savePastQuestion = async (pq) => pq.id ? updateItem(KEYS.PAST_QUESTIONS, pq.id, pq) : addItem(KEYS.PAST_QUESTIONS, pq);
export const deletePastQuestion = (id) => deleteItem(KEYS.PAST_QUESTIONS, id);

export const getWeeklyPlans = () => getList(KEYS.WEEKLY_PLANS);
export const saveWeeklyPlan = async (plan) => plan.id ? updateItem(KEYS.WEEKLY_PLANS, plan.id, plan) : addItem(KEYS.WEEKLY_PLANS, plan);
export const deleteWeeklyPlan = (id) => deleteItem(KEYS.WEEKLY_PLANS, id);

export const getAppPreferences = async () => {
  const prefs = await getItem(KEYS.APP_PREFERENCES);
  return prefs || { simpleMode: false };
};
export const saveAppPreferences = async (prefs) => setItem(KEYS.APP_PREFERENCES, prefs);

// ==========================================
// V4 Domain specific aliases
// ==========================================

export const getAIStudyPlans = () => getList(KEYS.AI_STUDY_PLANS);
export const saveAIStudyPlan = async (plan) => plan.id ? updateItem(KEYS.AI_STUDY_PLANS, plan.id, plan) : addItem(KEYS.AI_STUDY_PLANS, plan);
export const deleteAIStudyPlan = (id) => deleteItem(KEYS.AI_STUDY_PLANS, id);

export const getFriends = () => getList(KEYS.FRIENDS);
export const saveFriend = async (friend) => friend.id ? updateItem(KEYS.FRIENDS, friend.id, friend) : addItem(KEYS.FRIENDS, friend);
export const deleteFriend = (id) => deleteItem(KEYS.FRIENDS, id);

export const getChallenges = () => getList(KEYS.FRIEND_CHALLENGES);
export const saveChallenge = async (challenge) => challenge.id ? updateItem(KEYS.FRIEND_CHALLENGES, challenge.id, challenge) : addItem(KEYS.FRIEND_CHALLENGES, challenge);
export const deleteChallenge = (id) => deleteItem(KEYS.FRIEND_CHALLENGES, id);

export const getUserProfile = async () => {
  const profile = await getItem(KEYS.USER_PROFILE);
  return profile || { name: 'Nida', level: 1, streak: 0 };
};
export const saveUserProfile = async (profile) => setItem(KEYS.USER_PROFILE, profile);

export const getStudyBuddyMessages = async () => {
  const msgs = await getList(KEYS.STUDY_BUDDY_MESSAGES);
  return msgs || [];
};
export const saveStudyBuddyMessage = async (msg) => addItem(KEYS.STUDY_BUDDY_MESSAGES, msg);
export const clearStudyBuddyMessages = async () => AsyncStorage.removeItem(KEYS.STUDY_BUDDY_MESSAGES);

export const getStudyBuddyPreferences = async () => {
  const prefs = await getItem(KEYS.STUDY_BUDDY_PREFERENCES);
  return prefs || { personality: 'Destekleyici' }; // Destekleyici, Net ve dürüst, Motive edici, Sakin koç
};
export const saveStudyBuddyPreferences = async (prefs) => setItem(KEYS.STUDY_BUDDY_PREFERENCES, prefs);


