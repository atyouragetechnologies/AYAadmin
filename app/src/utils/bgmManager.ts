import { unlockAudio, getCtx } from './audioManager';

class BGMManager {
  private buffers: Map<string, AudioBuffer> = new Map()
  private currentSource: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private currentTrack: string | null = null
  private targetTrack: string | null = null
  private isEnabled: boolean = true
  private masterVolume: number = 0.3
  private isUnlocked: boolean = false
  private pendingTrack: string | null = null

  private getContext(): AudioContext | null {
    return getCtx();
  }

  // Must be called on user gesture to initialize and resume audio
  async unlock() {
    unlockAudio().catch(() => {});
    const ctx = this.getContext()
    if (!ctx) return; // iOS blocked AudioContext — skip silently
    
    // Always attempt to resume if suspended (common on mobile after backgrounding)
    if (ctx.state === 'suspended') {
      try { await ctx.resume() } catch(e) {}
    }
    
    this.isUnlocked = true
    
    if (this.pendingTrack) {
      const track = this.pendingTrack
      this.pendingTrack = null
      await this.play(track)
    }
  }

  setMapReady() { 
    if (this.isUnlocked && this.pendingTrack === 'neon-map') {
        const track = this.pendingTrack
        this.pendingTrack = null
        this.play(track)
    }
  }

  async preload(trackName: string) {
    if (this.buffers.has(trackName)) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const url = BGM_TRACKS[trackName] || `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-${trackName}.m4a`;
      const response = await fetch(url);
      if (!response.ok) return;
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(trackName, buffer);
    } catch {}
  }

  async play(trackName: string, fadeDuration = 1.2) {
    this.targetTrack = trackName

    const ctx = this.getContext()
    if (!ctx) return;

    // Fetch and decode immediately, regardless of unlock state
    // This eliminates the 3-4 click delay by preloading the audio instantly
    let buffer = this.buffers.get(trackName)
    
    if (!buffer) {
      try {
        const url = BGM_TRACKS[trackName] || `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-${trackName}.m4a`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer()
        buffer = await ctx.decodeAudioData(arrayBuffer)
        this.buffers.set(trackName, buffer)
      } catch (e) {
        console.warn(`BGM load failed: ${trackName}`, e)
        this.targetTrack = null
        return
      }
    }

    // Abort if target changed while waiting for fetch
    if (this.targetTrack !== trackName) return

    if (!this.isEnabled) {
      return
    }

    // If not unlocked yet, we just successfully cached it.
    // Save as pending and wait for the user to click somewhere.
    if (!this.isUnlocked) {
      this.pendingTrack = trackName
      return
    }

    if (this.currentTrack === trackName && this.currentSource) return

    if (ctx.state === 'suspended') {
      try { await ctx.resume() } catch(e) {}
    }


    // Fade out current track
    if (this.gainNode && this.currentSource) {
      const oldGain = this.gainNode
      const oldSource = this.currentSource
      this.fadeOut(oldGain, fadeDuration, () => {
        try { oldSource.stop() } catch(e) {}
      })
    }

    // Create new gain node for new track
    const newGain = ctx.createGain()
    newGain.gain.setValueAtTime(0, ctx.currentTime)
    newGain.connect(ctx.destination)

    // Create new source
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(newGain)
    source.start(0)

    // Fade in
    newGain.gain.linearRampToValueAtTime(
      this.masterVolume,
      ctx.currentTime + fadeDuration
    )

    this.gainNode = newGain
    this.currentSource = source
    this.currentTrack = trackName
    
    console.log(`BGM playing: ${trackName}`)
  }

  clearCache() {
    this.buffers.clear()
    console.log('BGM buffer cache cleared for fresh audio sync')
  }

  private fadeOut(
    gain: GainNode, 
    duration: number,
    onComplete?: () => void
  ) {
    const ctx = this.getContext()
    if (!ctx) { onComplete?.(); return; }
    const now = ctx.currentTime
    // FIX FOR OVERLAPPING AUDIO: Use exponential decay from current actual volume
    gain.gain.cancelScheduledValues(now)
    gain.gain.setTargetAtTime(0, now, duration / 3)
    
    setTimeout(
      () => {
        try { gain.gain.linearRampToValueAtTime(0, ctx!.currentTime) } catch(e) {}
        onComplete?.()
      }, 
      duration * 1000
    )
  }

  stop(fadeDuration = 1.5) {
    this.targetTrack = null
    this.pendingTrack = null
    if (!this.gainNode || !this.currentSource) return
    
    const source = this.currentSource
    this.fadeOut(this.gainNode, fadeDuration, () => {
      try { source.stop() } catch(e) {}
    })
    
    this.currentTrack = null
    this.currentSource = null
    this.gainNode = null
  }

  toggle() {
    this.isEnabled = !this.isEnabled
    if (!this.isEnabled) {
      // Save both tracks before stop() clears them
      const lastTarget = this.targetTrack || this.currentTrack;
      const lastPending = this.pendingTrack;
      this.stop(0.8)
      // Restore remembered tracks so re-enable can resume correctly
      this.targetTrack = lastTarget;
      this.pendingTrack = lastPending;
      console.log(`[BGM] Audio stopped, toggle state: off, remembered: ${lastTarget ?? lastPending}`);
    } else {
      // Resume whatever should be playing
      if (this.targetTrack) {
          this.play(this.targetTrack)
      } else if (this.pendingTrack) {
          this.play(this.pendingTrack)
      }
    }
    localStorage.setItem(
      'aya_bgm', 
      this.isEnabled.toString()
    )
  }

  setVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v))
    const ctx = this.getContext()
    if (this.gainNode && ctx) {
      const now = ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setTargetAtTime(
        this.masterVolume,
        now,
        0.1
      )
    }
  }

  loadPreference() {
    const saved = localStorage.getItem('aya_bgm')
    if (saved === 'false') this.isEnabled = false
    const vol = localStorage.getItem('aya_bgm_volume')
    if (vol) this.masterVolume = parseFloat(vol)
  }

  get enabled() { return this.isEnabled }
  get current() { return this.currentTrack }
}

export const bgmManager = new BGMManager()

const BGM_VER = '?v=20260808_sync'

// Track list for preloading
export const BGM_TRACKS: Record<string, string> = {
  'onboarding':    `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-onboarding.m4a${BGM_VER}`,
  'quiz':          `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-quiz.m4a${BGM_VER}`,
  'neon-map':      `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-neon-map.m4a${BGM_VER}`,
  'triumph':       `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-triumph.m4a${BGM_VER}`,
  'grief':         `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-grief.m4a${BGM_VER}`,
  'tension':       `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-tension.m4a${BGM_VER}`,
  'joy':           `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-joy.m4a${BGM_VER}`,
  'hope':          `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-hope.m4a${BGM_VER}`,
  'love':          `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-love.m4a${BGM_VER}`,
  'mystery':       `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-mystery.m4a${BGM_VER}`,
  'calm':          `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-calm.m4a${BGM_VER}`,
  'determination':`https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-determination.m4a${BGM_VER}`,
  'fear':          `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-fear.m4a${BGM_VER}`,
  'anger':         `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-anger.m4a${BGM_VER}`,
  'loneliness':    `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-loneliness.m4a${BGM_VER}`,
  'wonder':        `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-wonder.m4a${BGM_VER}`,
  'nostalgia':     `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-nostalgia.m4a${BGM_VER}`,

  // Custom Emotion BGM Mappings for 15-Year-Old Stories & Specialized Emotions
  'confusion':     `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-mystery.m4a${BGM_VER}`,
  'courage':       `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-determination.m4a${BGM_VER}`,
  'perfection':    `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-tension.m4a${BGM_VER}`,
  'liberation':    `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-hope.m4a${BGM_VER}`,
  'uncertainty':   `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-loneliness.m4a${BGM_VER}`,
  'confidence':    `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-triumph.m4a${BGM_VER}`,
  'pride':         `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-hope.m4a${BGM_VER}`,
  'frustration':   `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-tension.m4a${BGM_VER}`,
  'shyness':       `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-calm.m4a${BGM_VER}`,
  'self-belief':   `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-determination.m4a${BGM_VER}`,
  'curiosity':     `https://aya-assets-proxy.atyouragetechnologies.workers.dev/music/bgm-wonder.m4a${BGM_VER}`,
}
