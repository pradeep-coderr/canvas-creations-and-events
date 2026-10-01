"use client";

/*
 * The admin's alert chime, played on a COMPUTER when a notification arrives
 * while the admin is open and on screen (the system notification is then
 * silent, so it's one sound, not two). Phones always keep the system sound.
 * Closed or in the background, the device's own notification sound plays
 * instead — websites can't choose that sound.
 *
 * Generated with the Web Audio API (two soft bell tones; no audio file).
 * Browsers only allow sound after someone has clicked or typed on the page,
 * so the audio is unlocked on the first interaction; until then
 * canPlayChime() is false and the service worker keeps the system sound.
 * On/off is per device (localStorage), on by default.
 */

const PREF_KEY = "cc-admin-alert-sound";
let ctx: AudioContext | null = null;

export function alertSoundEnabled() {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setAlertSoundEnabled(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {}
}

function context() {
  if (!ctx && typeof window !== "undefined" && "AudioContext" in window) ctx = new AudioContext();
  return ctx;
}

/** Unlocks audio on the first click or key press on the page. Returns a cleanup. */
export function unlockAudioOnInteraction() {
  const unlock = () => void context()?.resume();
  const opts = { capture: true, passive: true } as const;
  window.addEventListener("pointerdown", unlock, opts);
  window.addEventListener("keydown", unlock, opts);
  return () => {
    window.removeEventListener("pointerdown", unlock, opts);
    window.removeEventListener("keydown", unlock, opts);
  };
}

/**
 * Phones and tablets: the chime would play at MEDIA volume while notifications
 * use the ringer/notification volume — with media muted, the admin would hear
 * nothing. So on these the system notification always keeps its own sound.
 */
function isPhoneOrTablet() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
}

/**
 * True only if the chime would really be heard now and may replace the
 * system sound: a computer, sound on, audio unlocked, page on screen.
 */
export function canPlayChime() {
  return (
    !isPhoneOrTablet() && alertSoundEnabled() && ctx?.state === "running" && document.visibilityState === "visible"
  );
}

/** Two soft bell tones (~0.9 s). Safe to call anytime; silent if audio is locked. */
export async function playChime() {
  const ac = context();
  if (!ac) return;
  if (ac.state !== "running") await ac.resume().catch(() => {});
  if (ac.state !== "running") return;
  const start = ac.currentTime + 0.02;
  const master = ac.createGain();
  master.gain.value = 0.22;
  master.connect(ac.destination);
  // E6 then A6, each with a quiet octave overtone for a bell-like tone.
  [
    { at: 0, freq: 1318.5 },
    { at: 0.16, freq: 1760 },
  ].forEach(({ at, freq }) => {
    for (const [mult, level] of [
      [1, 1],
      [2, 0.18],
    ] as const) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const t = start + at;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      osc.connect(gain).connect(master);
      osc.start(t);
      osc.stop(t + 0.8);
    }
  });
}
