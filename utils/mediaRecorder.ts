export class MediaRecorderManager {
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: Blob[] = []
  private onDataAvailable: (blob: Blob) => void
  private onError: (error: Error) => void

  constructor(
    onDataAvailable: (blob: Blob) => void,
    onError: (error: Error) => void
  ) {
    this.onDataAvailable = onDataAvailable
    this.onError = onError
  }

  public async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.chunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' })
        this.onDataAvailable(blob)
        this.chunks = []
      }

      this.mediaRecorder.onerror = (event) => {
        this.onError(new Error('MediaRecorder error: ' + event.error))
      }

      this.mediaRecorder.start()
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'))
    }
  }

  public stopRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop()
    }
    
    this.stream?.getTracks().forEach(track => track.stop())
    this.stream = null
  }

  public isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  public cleanup(): void {
    this.stopRecording()
    this.chunks = []
  }
}

// Hook for using MediaRecorderManager in components
export function useMediaRecorder(
  onDataAvailable: (blob: Blob) => void,
  onError: (error: Error) => void
) {
  const recorder = new MediaRecorderManager(onDataAvailable, onError)

  return {
    startRecording: () => recorder.startRecording(),
    stopRecording: () => recorder.stopRecording(),
    isRecording: () => recorder.isRecording(),
    cleanup: () => recorder.cleanup()
  }
} 