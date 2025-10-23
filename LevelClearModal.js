import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function LevelClearModal({ visible, score, onMenu, onRestart, onNext }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>LEVEL CLEAR!</Text>

          <View style={styles.starsPanel}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.star}>★</Text>
            <Text style={styles.star}>★</Text>
          </View>

          <Text style={styles.score}>SCORE: {score}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBtn} onPress={onMenu}>
              <Text style={styles.icon}>☰</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={onRestart}>
              <Text style={styles.icon}>↻</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={onNext}>
              <Text style={styles.icon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: '#200',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  starsPanel: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 32,
    color: '#7dfcfc',
    ...(Platform.OS === 'web'
      ? { textShadow: '0px 0px 6px #0ff' }
      : { textShadowColor: '#0ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 }),
  },
  score: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  iconBtn: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  icon: {
    color: '#fff',
    fontSize: 20,
  },
});
