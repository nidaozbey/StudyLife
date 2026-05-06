import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppButton from '../components/AppButton';
import { completeOnboarding } from '../storage/storageService';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    icon: 'rocket-launch-outline',
    title: "StudyLife'a Hoş Geldin",
    description: "Yeni nesil öğrenci asistanın ile tanış. Başarıya giden yolda en iyi yardımcın olacak.",
  },
  {
    icon: 'calendar-month-outline',
    title: "Ders Programını Ekle",
    description: "Tüm derslerini tek bir ekranda gör, ders saatlerini asla kaçırma ve notlarını düzenle.",
  },
  {
    icon: 'file-document-outline',
    title: "Sınavlarını Takip Et",
    description: "Yaklaşan sınavlarını öncelik sırasına göre gör, çalışman gerekenleri zamanında öğren.",
  },
  {
    icon: 'check-circle-outline',
    title: "Günlük Alışkanlıklar",
    description: "Su içme, kitap okuma gibi günlük hedeflerini belirle ve gelişimini takip et.",
  },
  {
    icon: 'timer-outline',
    title: "Çalışma Hedefini Seç",
    description: "Günlük çalışma süreni belirle, kronometreni başlat ve verimliliğini analiz et.",
  }
];

const OnboardingScreen = ({ navigation }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await completeOnboarding();
      navigation.replace('MainTabs');
    }
  };

  const step = ONBOARDING_STEPS[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={step.icon} size={80} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {ONBOARDING_STEPS.map((_, idx) => (
              <View key={idx} style={[styles.dot, currentIndex === idx && styles.dotActive]} />
            ))}
          </View>
          
          <AppButton 
            title={currentIndex === ONBOARDING_STEPS.length - 1 ? "Başla" : "İleri"} 
            onPress={handleNext} 
            icon={currentIndex === ONBOARDING_STEPS.length - 1 ? "check" : "arrow-right"}
            style={styles.button}
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  button: {
    width: '100%',
  }
});

export default OnboardingScreen;
