import { NextApiResponse } from 'next'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown, res: NextApiResponse) {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message
    })
  }

  // Handle rate limiting errors
  if (error instanceof Error && error.message.includes('rate limit')) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.'
    })
  }

  // Handle other errors
  return res.status(500).json({
    error: 'An unexpected error occurred'
  })
}

export function validateApiKey(key: string | undefined, name: string): string {
  if (!key) {
    throw new ApiError(500, `${name} API key is not configured`)
  }
  return key
}

export function validateRequestMethod(
  method: string,
  allowedMethods: string[],
  res: NextApiResponse
): boolean {
  if (!allowedMethods.includes(method)) {
    res.setHeader('Allow', allowedMethods)
    res.status(405).json({ error: 'Method not allowed' })
    return false
  }
  return true
}