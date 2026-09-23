import confetti from 'canvas-confetti';

/**
 * High-satisfaction celebratory confetti sequence with multi-cannon bursts.
 */
export function fireCelebrationConfetti(isConfirmed: boolean = false) {
  try {
    const count = isConfirmed ? 120 : 80;
    const colors = isConfirmed 
      ? ['#10B981', '#059669', '#F59E0B', '#FBBF24', '#3B82F6', '#8B5CF6', '#EC4899']
      : ['#10B981', '#34D399', '#065F46', '#3B82F6', '#60A5FA', '#F59E0B'];

    // Burst 1: Cannon from bottom left corner angled towards center
    confetti({
      particleCount: Math.floor(count * 0.45),
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.75 },
      colors,
      disableForReducedMotion: true,
      zIndex: 9999
    });

    // Burst 2: Cannon from bottom right corner angled towards center
    confetti({
      particleCount: Math.floor(count * 0.45),
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.75 },
      colors,
      disableForReducedMotion: true,
      zIndex: 9999
    });

    // Burst 3 (after 200ms): Center starburst / ribbon shower
    setTimeout(() => {
      try {
        confetti({
          particleCount: Math.floor(count * 0.6),
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors,
          shapes: ['circle', 'square'],
          scalar: 1.1,
          disableForReducedMotion: true,
          zIndex: 9999
        });
      } catch {}
    }, 220);

    // Burst 4 (after 450ms if confirmed): Golden sparkles
    if (isConfirmed) {
      setTimeout(() => {
        try {
          confetti({
            particleCount: 50,
            angle: 90,
            spread: 120,
            origin: { x: 0.5, y: 0.35 },
            colors: ['#F59E0B', '#FBBF24', '#FEF3C7', '#10B981'],
            scalar: 1.2,
            disableForReducedMotion: true,
            zIndex: 9999
          });
        } catch {}
      }, 450);
    }
  } catch (err) {
    console.warn('[Confetti] Failed to launch confetti:', err);
  }
}

/**
 * Synthesizes a delightful, crisp success chime using Web Audio API.
 * Safe to call anywhere without network or external media file dependencies.
 */
export function playCelebrationSound(isConfirmed: boolean = false) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Arpeggio notes in Hz (C5, E5, G5, C6)
    const notes = isConfirmed 
      ? [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 (Bright Major chord)
      : [587.33, 739.99, 880.00];         // D5, F#5, A5 (Uplifting chime)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.38);
    });

    // Auto-close audio context to avoid memory accumulation
    setTimeout(() => {
      try {
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      } catch {}
    }, 1500);
  } catch (err) {
    // Non-critical audio warning (e.g. autoplay restriction)
    console.debug('[Audio] Audio chime not available or prevented:', err);
  }
}
