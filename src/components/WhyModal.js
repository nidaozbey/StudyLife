import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const WhyModal = ({ visible, onClose, title, reasons }) => {
  const { colors: Colors, isDark } = useTheme();
  const styles = getStyles(Colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.title}>Neden Bu Öneri?</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {title ? <Text style={styles.taskTitle}>"{title}"</Text> : null}
          <ScrollView>
            {(reasons || []).map((r, i) => (
              <View key={i} style={styles.reasonRow}>
                <MaterialCommunityIcons name="circle-small" size={20} color={Colors.primary} />
                <Text style={styles.reasonText}>{r}</Text>
              </View>
            ))}
            {(!reasons || reasons.length === 0) && (
              <Text style={styles.emptyText}>Bu öneri için detaylı açıklama mevcut değil.</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Anladım</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (Colors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 24 },
  container: { backgroundColor: Colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: Colors.border },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  title: { flex: 1, color: Colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
  taskTitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16, fontStyle: 'italic' },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  reasonText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22, flex: 1 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  closeBtn: { marginTop: 20, backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  closeBtnText: { color: Colors.background, fontWeight: 'bold', fontSize: 16 },
});

export default WhyModal;
