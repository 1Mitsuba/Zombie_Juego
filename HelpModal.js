import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HelpModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>HELP / GUÍA</Text>
          <ScrollView style={styles.content}>
            <Text style={styles.h}>Objetivo</Text>
            <Text style={styles.p}>Toca a los zombies antes de que crucen la línea verde. Cada zombie que pase te quita una vida. Pierdes si te quedas sin corazones.</Text>

            <Text style={styles.h}>Controles</Text>
            <Text style={styles.p}>- Toca un zombie para matarlo. Se reproduce el efecto "slime".
            - Pulsa PAUSE para pausar el juego y reanudar más tarde.
            - Desde el menú puedes iniciar una partida, ver la ayuda, ver tu High Score o cambiar ajustes.</Text>

            <Text style={styles.h}>Recursos y poderes</Text>
            <Text style={styles.p}>- Carne: indica cuántos zombies has matado en la sesión; se incrementa +1 por cada kill y se muestra en el panel derecho.
            - Rayo: funciona como contador de reintentos. Cada vez que pulses "RESTART" desde Game Over se consumirá 1 rayo (si tienes). Los rayos se recargan con el tiempo.
            - Granada: toca el icono de la granada para entrar en modo apuntado; toca en la pantalla para lanzar la bomba y detonarla.</Text>

            <Text style={styles.h}>Score y High Score</Text>
            <Text style={styles.p}>- SCORE: puntos que obtienes durante la partida (por ejemplo, por cada zombie eliminado).
            - HIGH SCORE: en el menú se mostrará tu mejor puntuación registrada (si implementas persistencia); sirve para comparar tus partidas.</Text>

            <Text style={styles.h}>Consejos</Text>
            <Text style={styles.p}>Concéntrate en los zombies que estén a punto de cruzar la línea. Guarda bombas y reintentos para situaciones críticas.</Text>

          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  box: { width: '86%', maxHeight: '80%', backgroundColor: '#111', borderRadius: 10, padding: 16 },
  title: { color: '#7dfcfc', fontSize: 20, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  content: { marginBottom: 12 },
  h: { color: '#fff', fontWeight: '800', marginTop: 8 },
  p: { color: '#ddd', marginTop: 6, lineHeight: 18 },
  closeBtn: { alignSelf: 'center', backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
});
