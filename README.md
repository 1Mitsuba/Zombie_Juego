# Apocalipsis Tap - Proyecto Expo (React Native)

Este es un proyecto de ejemplo para crear un juego móvil simple llamado "Apocalipsis Tap" usando React Native y Expo. Está diseñado para principiantes y contiene pantallas básicas: menú, juego, pausa y nivel completado.

Estructura de archivos creada:
- `App.js` - punto de entrada que alterna entre `MenuScreen` y `GameScreen`.
- `MenuScreen.js` - pantalla principal con botones grandes.
- `GameScreen.js` - lógica principal del juego: spawn de zombies, puntuación, vidas, pausa, level clear.
- `Zombie.js` - componente que representa un zombie que cae usando `Animated`.
- `PauseModal.js` - modal de pausa.
- `LevelClearModal.js` - modal de victoria / nivel completado.

Instrucciones para configurar el entorno (localmente, en tu máquina Windows PowerShell):

1) Instala Expo CLI globalmente (si no lo tienes):

```powershell
npm install --global expo-cli
```

2) Si quieres crear un nuevo proyecto (opcional si ya trabajas dentro de este folder):

```powershell
expo init ApocalipsisTap
# Elige la plantilla "blank" (JavaScript)
cd ApocalipsisTap
```

3) Si usas los archivos aquí ya creados en `d:/Pruevas_Apk/zombie_Juego`, asegúrate de tener un `package.json` válido. Si no, crea uno con:

```powershell
npm init -y
npm install expo react-native
```

4) Para ejecutar el proyecto:

```powershell
expo start
```

Assets recomendados:
- Fondo de calle: `assets/bg.png` (PNG o JPG)
- Zombie: `assets/zombie.png` (PNG con transparencia)
- Corazón: `assets/heart.png` (PNG)
- Iconos de pausa, music, vibración: `assets/icons/*.png`

Puedes usar imágenes gratuitas de sitios como https://www.kenney.nl/assets o https://opengameart.org/.

Explicación pedagógica (resumen):
- useState: guarda valores reactivos (puntuación, vidas, etc.).
- useEffect: para efectos secundarios, como iniciar/limpiar intervalos cuando cambia el nivel o el estado de pausa.
- setInterval: se usa en `startSpawning` para crear zombies periódicamente; **siempre** limpiar con `clearInterval`.
- Animated.timing: anima la propiedad `translateY` para simular la caída del zombie; `useNativeDriver: true` para mejor rendimiento.

Siguientes pasos sugeridos:
- Añadir imágenes reales en `/assets` y reemplazar los marcadores temporales.
- Añadir sonidos usando `expo-av`.
- Guardar high scores en `AsyncStorage`.

Si quieres, continúo y:
- añado `package.json` completo y dependencias,
- reemplazo marcadores por imágenes con instrucciones paso a paso para añadir assets,
- explico cada archivo línea por línea con más detalle (pedagógico),
- añado persistencia de high scores.

Indica qué prefieres que haga a continuación.