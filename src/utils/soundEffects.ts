let audioCtx: AudioContext | null = null;

export function playTapSound() {
  const isEnabled = localStorage.getItem("app_tap_sounds_enabled") !== "false";
  if (!isEnabled) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Beautiful soft organic mechanical click / bubble tap sound
    osc.type = "sine";
    const now = audioCtx.currentTime;
    
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.005); // Rapid warm attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06); // Smooth fast decay

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    console.warn("Tap sound failed to play:", err);
  }
}

// Global click event binder to make all UI elements tap seamlessly
export function initGlobalTapSounds() {
  if (typeof window === "undefined") return;

  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Check if the clicked element or any of its parents is a button, link, tab, list item, or custom interactive control
    const interactiveElement = target.closest(
      "button, a, [role='button'], input[type='checkbox'], input[type='radio'], [data-clickable='true']"
    );

    if (interactiveElement) {
      playTapSound();
    }
  };

  window.addEventListener("click", handleGlobalClick, { capture: true, passive: true });
}
