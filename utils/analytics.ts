interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
}

interface PageView {
  path: string
  title: string
  locale: string
}

export class Analytics {
  private static instance: Analytics
  private initialized: boolean = false

  private constructor() {}

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  public init(): void {
    if (this.initialized) return
    
    // Initialize analytics (e.g., Google Analytics)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      // Load Google Analytics script
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
      script.async = true
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID)

      this.initialized = true
    }
  }

  public trackPageView({ path, title, locale }: PageView): void {
    if (!this.initialized) return

    try {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: window.location.href,
        language: locale
      })
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  public trackEvent({ category, action, label, value }: AnalyticsEvent): void {
    if (!this.initialized) return

    try {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  public trackAIInteraction(feature: string, success: boolean): void {
    this.trackEvent({
      category: 'AI Interaction',
      action: feature,
      label: success ? 'Success' : 'Failed'
    })
  }

  public trackLanguageSwitch(from: string, to: string): void {
    this.trackEvent({
      category: 'Language',
      action: 'Switch',
      label: `${from} to ${to}`
    })
  }

  public trackProjectView(projectId: string): void {
    this.trackEvent({
      category: 'Project',
      action: 'View',
      label: projectId
    })
  }

  public trackFormSubmission(formId: string, success: boolean): void {
    this.trackEvent({
      category: 'Form',
      action: 'Submit',
      label: `${formId} - ${success ? 'Success' : 'Failed'}`
    })
  }
}

// Hook for using Analytics in components
export function useAnalytics() {
  const analytics = Analytics.getInstance()

  return {
    trackPageView: (data: PageView) => analytics.trackPageView(data),
    trackEvent: (data: AnalyticsEvent) => analytics.trackEvent(data),
    trackAIInteraction: (feature: string, success: boolean) => 
      analytics.trackAIInteraction(feature, success),
    trackLanguageSwitch: (from: string, to: string) => 
      analytics.trackLanguageSwitch(from, to),
    trackProjectView: (projectId: string) => 
      analytics.trackProjectView(projectId),
    trackFormSubmission: (formId: string, success: boolean) => 
      analytics.trackFormSubmission(formId, success)
  }
}

// Declare global window interface
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}