// audioClient.js
// Small wrapper that prefers `expo-audio` if installed, otherwise falls back to `expo-av`.
// Exposes a factory createSound() that returns a Sound-like object compatible with current usage.

let impl = null;
try {
  // try new package first (may be available on newer SDKs)
  // eslint-disable-next-line global-require
  impl = require('expo-audio');
  // If expo-audio exports differently, try to normalize below
} catch (e) {
  try {
    // fallback to expo-av
    // eslint-disable-next-line global-require
    const expoAv = require('expo-av');
    impl = { Audio: expoAv.Audio };
  } catch (err) {
    console.warn('No audio implementation found (expo-audio or expo-av). Audio will be disabled.');
    impl = null;
  }
// normalize export
}

function createSound() {
  if (!impl) return null;
  // expo-audio hypothetical API: export.Sound or export.Audio.Sound
  if (impl.Sound) return new impl.Sound();
  if (impl.Audio && impl.Audio.Sound) return new impl.Audio.Sound();
  if (impl.Audio) return new impl.Audio.Sound();
  // last resort: if impl.default exists
  if (impl.default && impl.default.Sound) return new impl.default.Sound();
  return null;
}

module.exports = { createSound };
