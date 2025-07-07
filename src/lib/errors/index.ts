export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 500);
    this.name = 'NetworkError';
  }
}

export function createErrorResponse(error: AppError | Error, defaultMessage: string = 'An error occurred') {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  // Handle specific error types
  if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
    return {
      error: 'Rate limit exceeded. Please wait a moment and try again.',
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429
    };
  }

  if (error.message?.includes('API key') || error.message?.includes('authentication')) {
    return {
      error: 'Authentication error. Please check your API configuration.',
      code: 'AUTH_ERROR', 
      statusCode: 401
    };
  }

  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      error: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      statusCode: 500
    };
  }

  return {
    error: defaultMessage,
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  };
}

export function logError(error: Error, context?: string) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorInfo);
  } else {
    // In production, you might want to send this to a logging service
    console.error(`[${timestamp}] ${context || 'Unknown'}: ${error.message}`);
  }
}
