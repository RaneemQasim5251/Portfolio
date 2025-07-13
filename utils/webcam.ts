export class WebcamManager {
  private stream: MediaStream | null = null
  private videoElement: HTMLVideoElement | null = null
  private onError: (error: Error) => void

  constructor(
    videoElement: HTMLVideoElement,
    onError: (error: Error) => void
  ) {
    this.videoElement = videoElement
    this.onError = onError
  }

  public async startStream(constraints: MediaStreamConstraints = { video: true }): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream
        await this.videoElement.play()
      }
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error('Failed to access webcam'))
    }
  }

  public stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }
  }

  public async captureFrame(): Promise<Blob | null> {
    if (!this.videoElement) return null

    try {
      const canvas = document.createElement('canvas')
      canvas.width = this.videoElement.videoWidth
      canvas.height = this.videoElement.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')

      ctx.drawImage(this.videoElement, 0, 0)
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.95)
      })
    } catch (error) {
      this.onError(error instanceof Error ? error : new Error('Failed to capture frame'))
      return null
    }
  }

  public isStreaming(): boolean {
    return this.stream !== null && this.stream.active
  }

  public cleanup(): void {
    this.stopStream()
  }
}

// Hook for using WebcamManager in components
export function useWebcam(
  videoRef: React.RefObject<HTMLVideoElement>,
  onError: (error: Error) => void
) {
  const webcam = new WebcamManager(
    videoRef.current as HTMLVideoElement,
    onError
  )

  return {
    startStream: (constraints?: MediaStreamConstraints) => webcam.startStream(constraints),
    stopStream: () => webcam.stopStream(),
    captureFrame: () => webcam.captureFrame(),
    isStreaming: () => webcam.isStreaming(),
    cleanup: () => webcam.cleanup()
  }
}