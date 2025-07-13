interface RequestOptions extends RequestInit {
  params?: Record<string, string>
  timeout?: number
  retries?: number
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const DEFAULT_TIMEOUT = 30000 // 30 seconds
const DEFAULT_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT } = options
  
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  
  if (!response.ok) {
    const error = isJson ? await response.json() : await response.text()
    throw new ApiError(
      response.status,
      error.message || error || 'An error occurred'
    )
  }

  if (isJson) {
    return response.json()
  }

  return response.blob() as Promise<T>
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, timeout = DEFAULT_TIMEOUT, retries = DEFAULT_RETRIES, ...init } = options
  let attempt = 0

  while (attempt < retries) {
    try {
      // Add query parameters if provided
      let url = endpoint
      if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value)
        })
        url = `${endpoint}?${searchParams.toString()}`
      }

      // Set default headers
      const headers = new Headers(init.headers)
      if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
      }

      const response = await fetchWithTimeout(url, {
        ...init,
        headers,
        timeout
      })

      const data = await handleResponse<T>(response)
      return { data }
    } catch (error) {
      attempt++
      console.error(`API request attempt ${attempt} failed:`, error)
      
      if (attempt === retries) {
        if (error instanceof ApiError) {
          return { error: error.message }
        }
        return { error: 'An unexpected error occurred' }
      }
      
      // Wait before retrying
      await wait(RETRY_DELAY * attempt)
    }
  }

  return { error: 'Maximum retry attempts reached' }
}

// API endpoints
const endpoints = {
  chat: '/api/chat',
  tts: '/api/tts',
  stt: '/api/stt',
  generateImage: '/api/generate-image',
  contact: '/api/contact'
} as const

// Typed API functions
export const api = {
  chat: (messages: any[]) => 
    apiRequest(endpoints.chat, {
      method: 'POST',
      body: JSON.stringify({ messages })
    }),

  generateSpeech: (text: string, language: string = 'ar') =>
    apiRequest<Blob>(endpoints.tts, {
      method: 'POST',
      body: JSON.stringify({ text, language })
    }),

  transcribeAudio: (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    return apiRequest(endpoints.stt, {
      method: 'POST',
      body: formData
    })
  },

  generateImage: (verse: string) =>
    apiRequest(endpoints.generateImage, {
      method: 'POST',
      body: JSON.stringify({ verse })
    }),

  contact: (data: { name: string; email: string; message: string }) =>
    apiRequest(endpoints.contact, {
      method: 'POST',
      body: JSON.stringify(data)
    })
}