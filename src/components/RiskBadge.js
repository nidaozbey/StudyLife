import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RiskBadge = ({ riskLabel, color, score }) => (
  <View style={[styles.badge, { backgroundColor: color + '15', borderColor: color }]}>
    <Text style={[styles.text, { color }]}>Skor {score}: {riskLabel}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  text: { fontSize: 13, fontWeight: 'bold' }
});

export default RiskBadge;
