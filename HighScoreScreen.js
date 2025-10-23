import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HighScoreScreen({ highScore, bestBeforeFirstDeath, onBack, onReset }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>High Score</Text>
      <Text style={styles.score}>{typeof highScore === 'number' ? highScore : '—'}</Text>

      <Text style={styles.subtitle}>Mejor racha sin perder vida</Text>
      <Text style={[styles.score, { fontSize: 28 }]}>{typeof bestBeforeFirstDeath === 'number' ? bestBeforeFirstDeath : '—'}</Text>

      <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetText}>Reset High Score</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101216', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#7dfcfc', fontSize: 26, fontWeight: '900', marginBottom: 12 },
  score: { color: '#fff', fontSize: 42, fontWeight: '900', marginBottom: 24 },
  subtitle: { color: '#9fd', fontSize: 14, marginBottom: 8 },
  resetBtn: { backgroundColor: '#551111', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginBottom: 12 },
  resetText: { color: '#fff', fontWeight: '700' },
  backBtn: { backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '700' },
});
