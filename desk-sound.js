// ===== Studio Physical-Modeling Foley Engine (Web Audio API + Study Room Acoustics) =====
class DeskSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.noiseBuffer = null;
    this.masterBus = null;
    this.dryBus = null;
    this.wetBus = null;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this._buildAudioGraph();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _buildAudioGraph() {
    const ctx = this.ctx;

    // 1. Warm master bus with gentle studio dynamics compressor
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 18;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.004;
    comp.release.value = 0.16;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.92;
    comp.connect(masterGain);
    masterGain.connect(ctx.destination);
    this.masterBus = comp;

    // 2. Dry path + subtle warm wooden study-room early-reflection reverb (0.28s IR)
    this.dryBus = ctx.createGain();
    this.dryBus.gain.value = 0.88;
    this.dryBus.connect(this.masterBus);

    const convolver = ctx.createConvolver();
    const irLen = Math.floor(ctx.sampleRate * 0.28);
    const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const chData = irBuf.getChannelData(ch);
      for (let i = 0; i < irLen; i++) {
        const t = i / irLen;
        // Fast exponential room decay with warm high-frequency damping
        const env = Math.pow(1 - t, 3.6);
        chData[i] = (Math.random() * 2 - 1) * env * 0.32;
      }
    }
    convolver.buffer = irBuf;

    const wetFilter = ctx.createBiquadFilter();
    wetFilter.type = 'lowpass';
    wetFilter.frequency.value = 2600;

    this.wetBus = ctx.createGain();
    this.wetBus.gain.value = 0.26;
    this.wetBus.connect(convolver);
    convolver.connect(wetFilter);
    wetFilter.connect(this.masterBus);

    // 3. Long 2.5s natural pink-brown noise buffer for rich paper & liquid textures
    const length = Math.floor(ctx.sampleRate * 2.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      data[i] = (b0 + b1 + b2 + b3 + white * 0.25) * 0.35;
    }
    this.noiseBuffer = buffer;
  }

  _route(node, wetAmount = 1.0) {
    node.connect(this.dryBus);
    if (wetAmount > 0 && this.wetBus) {
      if (wetAmount === 1.0) {
        node.connect(this.wetBus);
      } else {
        const send = this.ctx.createGain();
        send.gain.value = wetAmount;
        node.connect(send);
        send.connect(this.wetBus);
      }
    }
  }

  setEnabled(flag) {
    this.enabled = !!flag;
    if (this.enabled) {
      this.ensureContext();
      this.playLampSwitch(true);
    }
  }

  // Shaped noise burst with optional paper-flutter LFO modulation
  _noise({
    delay = 0,
    duration = 0.2,
    freqStart = 1200,
    freqEnd = 2400,
    q = 1.2,
    gain = 0.14,
    type = 'bandpass',
    attackRatio = 0.18,
    flutterHz = 0,
    flutterDepth = 0,
    wet = 0.8
  }) {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;
    const t0 = ctx.currentTime + delay;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.setValueAtTime(q, t0);
    filter.frequency.setValueAtTime(Math.max(40, freqStart), t0);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t0 + duration);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(gain, t0 + Math.max(0.005, duration * attackRatio));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    if (flutterHz > 0 && flutterDepth > 0) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = flutterHz;
      lfoGain.gain.value = gain * flutterDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(env.gain);
      lfo.start(t0);
      lfo.stop(t0 + duration + 0.03);
    }

    src.connect(filter);
    filter.connect(env);
    this._route(env, wet);

    src.start(t0, Math.random() * 1.2, duration + 0.05);
    src.stop(t0 + duration + 0.06);
  }

  // Modal resonant body (wood knock, porcelain clink, leather thud)
  _modal({ delay = 0, baseFreq = 200, ratios = [1, 2.38], decays = [0.12, 0.07], gains = [0.1, 0.04], pitchDrop = 1.0, wet = 1.0 }) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;

    ratios.forEach((r, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const f0 = baseFreq * r;
      osc.frequency.setValueAtTime(f0, t0);
      if (pitchDrop !== 1.0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(24, f0 * pitchDrop), t0 + decays[idx]);
      }

      const g = ctx.createGain();
      const peak = gains[idx] ?? gains[gains.length - 1];
      const dur = decays[idx] ?? decays[decays.length - 1];
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.0025);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(g);
      this._route(g, wet);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    });
  }

  // ===== 1. Book Lift & Hardcover Unfold (cloth brush + spine relax + cascading page fan) =====
  playBookOpen() {
    // Soft cloth-on-leather lift friction
    this._noise({ delay: 0.00, duration: 0.14, freqStart: 420, freqEnd: 780, q: 0.8, gain: 0.10, type: 'lowpass' });
    this._modal({ delay: 0.01, baseFreq: 105, ratios: [1, 1.82], decays: [0.10, 0.06], gains: [0.065, 0.02], pitchDrop: 0.72 });

    // Main hardcover unfolding air sweep (two frequency layers: paper body + crisp dry cellulose)
    this._noise({ delay: 0.12, duration: 0.36, freqStart: 520, freqEnd: 1380, q: 1.0, gain: 0.16, flutterHz: 22, flutterDepth: 0.22 });
    this._noise({ delay: 0.14, duration: 0.32, freqStart: 2800, freqEnd: 5200, q: 1.6, gain: 0.09, type: 'bandpass', flutterHz: 28, flutterDepth: 0.25 });

    // Subtle cascading pages settling flat (3 micro paper-leaf flutters)
    [0.34, 0.40, 0.46].forEach((d, i) => {
      this._noise({
        delay: d,
        duration: 0.085,
        freqStart: 2100 + i * 320,
        freqEnd: 1150,
        q: 1.8,
        gain: 0.065 - i * 0.014,
        attackRatio: 0.12
      });
    });
  }

  // ===== 2. Book Fold Shut & Set Back Down on Leather Desk Mat =====
  playBookClose() {
    // Air-whoosh squeezed out between closing pages
    this._noise({ delay: 0.02, duration: 0.20, freqStart: 1650, freqEnd: 380, q: 1.0, gain: 0.17, attackRatio: 0.25 });
    this._noise({ delay: 0.04, duration: 0.18, freqStart: 4200, freqEnd: 1600, q: 1.5, gain: 0.08 });

    // Crisp hardcover shut clap (transient snap + hollow book cavity thump)
    this._noise({ delay: 0.19, duration: 0.032, freqStart: 1400, freqEnd: 420, q: 0.7, gain: 0.22, type: 'lowpass', attackRatio: 0.06 });
    this._modal({ delay: 0.19, baseFreq: 138, ratios: [1, 2.08], decays: [0.10, 0.055], gains: [0.15, 0.05], pitchDrop: 0.58 });

    // Weighted book landing gently back onto walnut/leather desk mat (two-mode wooden table resonance)
    this._modal({ delay: 0.44, baseFreq: 86, ratios: [1, 1.94, 3.1], decays: [0.16, 0.09, 0.045], gains: [0.19, 0.075, 0.025], pitchDrop: 0.65 });
    this._noise({ delay: 0.44, duration: 0.08, freqStart: 560, freqEnd: 190, q: 0.8, gain: 0.11, type: 'lowpass', attackRatio: 0.08 });
    // Tiny leather slide settle
    this._noise({ delay: 0.50, duration: 0.07, freqStart: 950, freqEnd: 620, q: 1.1, gain: 0.04 });
  }

  // ===== 3. Realistic Single-Sheet Page Turn (finger lift + crisp bend + soft settle) =====
  playPageFlip() {
    // Finger tip catching paper edge
    this._noise({ delay: 0.00, duration: 0.045, freqStart: 3600, freqEnd: 5600, q: 2.0, gain: 0.075, attackRatio: 0.15 });
    // Paper curving through the air (warm body + crisp cellulose shimmer + flutter)
    this._noise({ delay: 0.03, duration: 0.22, freqStart: 880, freqEnd: 2450, q: 1.3, gain: 0.15, flutterHz: 26, flutterDepth: 0.28 });
    this._noise({ delay: 0.05, duration: 0.20, freqStart: 3200, freqEnd: 5800, q: 1.8, gain: 0.085, flutterHz: 32, flutterDepth: 0.22 });
    // Soft landing pat on opposite stack
    this._noise({ delay: 0.21, duration: 0.075, freqStart: 1200, freqEnd: 460, q: 1.0, gain: 0.09, attackRatio: 0.12 });
    this._modal({ delay: 0.22, baseFreq: 145, ratios: [1], decays: [0.045], gains: [0.04], pitchDrop: 0.72 });
  }

  // ===== 4. Brass Designer Lamp Tactile Switch (two-stage mechanical spring detent click) =====
  playLampSwitch(turningOn = true) {
    // Micro pre-travel spring tick
    this._noise({ delay: 0.00, duration: 0.014, freqStart: 4200, freqEnd: 2600, q: 2.2, gain: 0.10, type: 'highpass', attackRatio: 0.1, wet: 0.4 });
    // Main crisp brass detent snap (+16ms)
    this._noise({ delay: 0.016, duration: 0.022, freqStart: turningOn ? 3800 : 2800, freqEnd: 1600, q: 1.8, gain: 0.20, type: 'highpass', attackRatio: 0.08, wet: 0.5 });
    this._modal({
      delay: 0.016,
      baseFreq: turningOn ? 620 : 480,
      ratios: [1, 2.75, 4.9],
      decays: [0.045, 0.028, 0.018],
      gains: [0.08, 0.045, 0.02],
      pitchDrop: 0.85,
      wet: 0.5
    });
  }

  // ===== 5. Ceramic Coffee Mug: Lift Clink + Warm Sip + Authentic Double-Tap Saucer Settle =====
  playCoffeeSip() {
    // 1. Subtle porcelain lift separation from saucer
    this._noise({ delay: 0.02, duration: 0.012, freqStart: 4500, freqEnd: 3200, q: 2.0, gain: 0.06, type: 'highpass' });
    this._modal({
      delay: 0.02,
      baseFreq: 1940,
      ratios: [1, 2.34, 3.86],
      decays: [0.13, 0.08, 0.045],
      gains: [0.048, 0.022, 0.010]
    });

    // 2. Realistic gentle warm coffee sip (two vocal-tract formants sweeping warmly)
    this._noise({ delay: 0.44, duration: 0.38, freqStart: 580, freqEnd: 1180, q: 3.4, gain: 0.075, attackRatio: 0.30, flutterHz: 14, flutterDepth: 0.18 });
    this._noise({ delay: 0.46, duration: 0.34, freqStart: 1900, freqEnd: 2750, q: 4.0, gain: 0.045, attackRatio: 0.32 });
    // Soft relaxed exhale "ahhh"
    this._noise({ delay: 0.88, duration: 0.28, freqStart: 920, freqEnd: 520, q: 1.4, gain: 0.032, attackRatio: 0.22 });

    // 3. Authentic double-tap porcelain-on-saucer set-down (first rim contact + 48ms micro-settle!)
    this._noise({ delay: 1.32, duration: 0.014, freqStart: 5200, freqEnd: 3400, q: 2.0, gain: 0.09, type: 'highpass' });
    this._modal({
      delay: 1.32,
      baseFreq: 1820,
      ratios: [1, 2.38, 3.92],
      decays: [0.16, 0.095, 0.05],
      gains: [0.062, 0.028, 0.012]
    });
    this._modal({ delay: 1.32, baseFreq: 132, ratios: [1], decays: [0.07], gains: [0.07], pitchDrop: 0.7 });

    // Second tiny settle tap (+48ms)
    this._modal({
      delay: 1.368,
      baseFreq: 1860,
      ratios: [1, 2.36],
      decays: [0.11, 0.06],
      gains: [0.032, 0.014]
    });
  }

  // ===== 6. Ceramic Pen Holder Rattle (mixed plastic pens + wooden ruler + ceramic cup resonance) =====
  playPenRattle() {
    // Staggered realistic material impacts inside a ceramic cup
    const events = [
      { delay: 0.00, kind: 'ceramic', f: 1780, g: 0.065 },
      { delay: 0.045, kind: 'wood', f: 740, g: 0.085 },
      { delay: 0.095, kind: 'plastic', f: 2850, g: 0.060 },
      { delay: 0.145, kind: 'ceramic', f: 1920, g: 0.055 },
      { delay: 0.205, kind: 'wood', f: 680, g: 0.065 },
      { delay: 0.265, kind: 'plastic', f: 3120, g: 0.048 },
      { delay: 0.34, kind: 'ceramic', f: 1840, g: 0.034 },
      { delay: 0.42, kind: 'plastic', f: 2680, g: 0.024 }
    ];

    events.forEach(({ delay, kind, f, g }) => {
      // Crisp micro contact transient
      this._noise({ delay, duration: 0.012, freqStart: f * 1.4, freqEnd: f * 0.8, q: 2.0, gain: g * 1.2, attackRatio: 0.1 });

      if (kind === 'ceramic') {
        this._modal({ delay, baseFreq: f, ratios: [1, 2.41], decays: [0.095, 0.05], gains: [g, g * 0.4] });
      } else if (kind === 'wood') {
        // Hollow wooden ruler knock
        this._modal({ delay, baseFreq: f, ratios: [1, 2.15, 3.6], decays: [0.065, 0.04, 0.022], gains: [g, g * 0.45, g * 0.2], pitchDrop: 0.92 });
      } else {
        // Crisp plastic gel-pen clack
        this._modal({ delay, baseFreq: f, ratios: [1, 1.62], decays: [0.035, 0.02], gains: [g * 0.85, g * 0.45] });
      }
    });
  }

  // ===== 7. Sticky Note Peel & Light Paper Flutter =====
  playStickyNote() {
    // Delicate adhesive peel micro-crackle + crisp paper flick
    this._noise({ delay: 0.00, duration: 0.06, freqStart: 3800, freqEnd: 6200, q: 2.2, gain: 0.075, type: 'highpass', flutterHz: 42, flutterDepth: 0.35 });
    this._noise({ delay: 0.04, duration: 0.14, freqStart: 2200, freqEnd: 3900, q: 1.6, gain: 0.095, flutterHz: 24, flutterDepth: 0.25 });
  }

  // ===== 8. Succulent Gentle Leaf Rustle & Warm Wooden Tap =====
  playPlantPop() {
    // Soft botanical leaf brush
    this._noise({ delay: 0.00, duration: 0.12, freqStart: 1800, freqEnd: 3200, q: 1.4, gain: 0.065 });
    // Warm organic terracotta pot / wooden marimba pop
    this._modal({ delay: 0.01, baseFreq: 340, ratios: [1, 2.02], decays: [0.13, 0.07], gains: [0.08, 0.025], pitchDrop: 1.38 });
    this._modal({ delay: 0.075, baseFreq: 480, ratios: [1, 2.0], decays: [0.12, 0.06], gains: [0.055, 0.018], pitchDrop: 1.24 });
  }

  // ===== 9. Warm Acoustic Chime on Resource Download =====
  playDownloadChime() {
    this._modal({ delay: 0.00, baseFreq: 523.25, ratios: [1, 2.0, 3.0], decays: [0.28, 0.16, 0.08], gains: [0.065, 0.022, 0.008] });
    this._modal({ delay: 0.09, baseFreq: 659.25, ratios: [1, 2.0, 3.0], decays: [0.36, 0.20, 0.10], gains: [0.075, 0.026, 0.010] });
  }
}

export const deskSound = new DeskSoundEngine();
