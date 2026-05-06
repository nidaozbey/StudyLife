import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SectionHeader = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SectionHeader;
