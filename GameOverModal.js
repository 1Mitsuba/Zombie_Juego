import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GameOverModal({ visible, onRestart, onMenu }) {
  const [locked, setLocked] = useState(false);

  function handleRestart() {
    if (locked) return;
    setLocked(true);
    try { onRestart && onRestart(); } catch (e) {}
    setTimeout(() => setLocked(false), 400);
  }

  function handleMenu() {
    if (locked) return;
    setLocked(true);
    try { onMenu && onMenu(); } catch (e) {}
    setTimeout(() => setLocked(false), 400);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>GAME OVER</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleRestart} disabled={locked}>
              <Text style={styles.actionText}>RESTART</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleMenu} disabled={locked}>
              <Text style={styles.actionText}>MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  box: { width: '80%', backgroundColor: '#111', padding: 18, borderRadius: 10, alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  actionBtn: { backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
});
