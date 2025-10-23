Assets necesarios para "Apocalipsis Tap"

Coloca aquí las imágenes y sonidos en formato PNG/MP3/WAV con los nombres sugeridos. Puedes usar los enlaces recomendados para descargar recursos gratuitos.

Carpeta: /assets

Imágenes (PNG, fondos y sprites)
- bg.png
  - Fondo estático de una calle asfaltada (puede ser JPG o PNG). Tamaño sugerido: 1080x1920 o 720x1280.
  - Enlace sugerido: https://opengameart.org/ o https://www.kenney.nl/assets

- zombie.png
  - Sprite del zombie con fondo transparente. Tamaño sugerido: 128x128 o 64x64.
  - Enlace sugerido: https://opengameart.org/search?keys=zombie

- heart.png
  - Corazón para vidas (32x32 o 48x48).
  - Enlace: https://opengameart.org/

- power_meat.png
- power_lightning.png
- power_bomb.png
  - Iconos para power-ups (pequeños, 48x48).

- icon_pause.png
- icon_music.png
- icon_vibrate.png
- icon_trophy.png
- icon_star.png
- icon_settings.png
  - Iconos UI (24x24, 48x48)

Audios
- sfx_hit.wav (efecto cuando tocas un zombie)
- sfx_miss.wav (efecto cuando un zombie llega al fondo)
- sfx_explosion.wav (para bomba)
- music_loop.mp3 (música de fondo, loopable, 10-60s)
  - Enlace sugerido: https://freesound.org/ o https://opengameart.org/

Cómo importarlos en el código (ejemplos):

// Imagen
const bg = require('./assets/bg.png');

// Audio (con expo-av)
import { Audio } from 'expo-av';
const sound = new Audio.Sound();
await sound.loadAsync(require('./assets/sfx_hit.wav'));
await sound.playAsync();

Recomendación de licencia
- Usa recursos con licencia Creative Commons 0 (CC0) o con atribución permitida según tus necesidades.

Si quieres, puedo descargar algunas imágenes de ejemplo y colocarlas en /assets para que ya funcione sin que subas nada. ¿Deseas que añada imágenes de placeholders (de Kenney o similares) ahora?