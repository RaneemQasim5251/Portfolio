export class AudioManager {
  private static instance: AudioManager
  private audioElements: Map<string, HTMLAudioElement>
  private currentlyPlaying: string | null

  private constructor() {
    this.audioElements = new Map()
    this.currentlyPlaying = null
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  public async playAudio(id: string, src: string): Promise<void> {
    // Stop any currently playing audio
    if (this.currentlyPlaying) {
      await this.stopAudio(this.currentlyPlaying)
    }

    let audio = this.audioElements.get(id)

    if (!audio) {
      audio = new Audio(src)
      this.audioElements.set(id, audio)

      // Set up event listeners
      audio.addEventListener('ended', () => {
        this.currentlyPlaying = null
      })

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e)
        this.currentlyPlaying = null
      })
    }

    try {
      await audio.play()
      this.currentlyPlaying = id
    } catch (error) {
      console.error('Failed to play audio:', error)
      throw error
    }
  }

  public async stopAudio(id: string): Promise<void> {
    const audio = this.audioElements.get(id)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      this.currentlyPlaying = null
    }
  }

  public isPlaying(id: string): boolean {
    return this.currentlyPlaying === id
  }

  public cleanup(): void {
    this.audioElements.forEach((audio) => {
      audio.pause()
      audio.remove()
    })
    this.audioElements.clear()
    this.currentlyPlaying = null
  }
}

// Hook for using AudioManager in components
export function useAudio() {
  const audioManager = AudioManager.getInstance()

  return {
    playAudio: (id: string, src: string) => audioManager.playAudio(id, src),
    stopAudio: (id: string) => audioManager.stopAudio(id),
    isPlaying: (id: string) => audioManager.isPlaying(id),
    cleanup: () => audioManager.cleanup()
  }
}