import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function PauseModal({ visible, onResume, onRestart, onMenu }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>PAUSE</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.actionBtn} onPress={onResume}>
              <Text style={styles.actionText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onRestart}>
              <Text style={styles.actionText}>RESTART</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={onMenu}>
              <Text style={styles.actionText}>MENU</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            <Text style={styles.small}>🔊</Text>
            <Text style={styles.small}>🎵</Text>
            <Text style={styles.small}>📳</Text>
          </View>

          <Text style={styles.hint}>Toca de nuevo para salir</Text>
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
    backgroundColor: '#111',
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
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 8,
  },
  small: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  hint: {
    color: '#aaa',
    marginTop: 8,
    fontSize: 12,
  },
});
