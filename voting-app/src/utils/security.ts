// Security utilities for input validation and sanitization

export const LIMITS = {
  USER_NAME_MAX: 30,
  USER_NAME_MIN: 1,
  SUBMISSION_NAME_MAX: 50,
  SUBMISSION_NAME_MIN: 1,
  MESSAGE_MAX: 200,
  VOTE_KEY_MAX: 100,
  USER_ID_MAX: 50
} as const;

// Sanitize user input to prevent XSS and injection attacks
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .substring(0, 200); // Limit length
}

// Validate user name
export function validateUserName(name: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < LIMITS.USER_NAME_MIN) {
    return { valid: false, error: 'El nombre es muy corto' };
  }
  
  if (sanitized.length > LIMITS.USER_NAME_MAX) {
    return { valid: false, error: 'El nombre es muy largo (máximo 30 caracteres)' };
  }
  
  // Check for valid characters only
  if (!/^[a-zA-Z0-9\s\u00C0-\u017F]+$/.test(sanitized)) {
    return { valid: false, error: 'El nombre solo puede contener letras, números y espacios' };
  }
  
  return { valid: true };
}

// Validate submission name
export function validateSubmissionName(name: string): { valid: boolean; error?: string } {
  const sanitized = sanitizeString(name);
  
  if (sanitized.length < LIMITS.SUBMISSION_NAME_MIN) {
    return { valid: false, error: 'El nombre de la sugerencia es muy corto' };
  }
  
  if (sanitized.length > LIMITS.SUBMISSION_NAME_MAX) {
    return { valid: false, error: 'El nombre es muy largo (máximo 50 caracteres)' };
  }
  
  return { valid: true };
}

// Generate secure user ID
export function generateSecureUserId(name: string): string {
  const sanitized = sanitizeString(name);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${sanitized.replace(/\s+/g, '_').toLowerCase()}_${timestamp}_${random}`.substring(0, LIMITS.USER_ID_MAX);
}

// Rate limiting helper (simple client-side implementation)
export class RateLimiter {
  private actions: Map<string, number[]> = new Map();
  private maxActions: number;
  private windowMs: number;

  constructor(maxActions: number = 10, windowMs: number = 60000) {
    this.maxActions = maxActions;
    this.windowMs = windowMs;
  }

  canPerformAction(userId: string): boolean {
    const now = Date.now();
    const userActions = this.actions.get(userId) || [];
    
    // Remove old actions outside the window
    const recentActions = userActions.filter(actionTime => now - actionTime < this.windowMs);
    
    if (recentActions.length >= this.maxActions) {
      return false;
    }
    
    // Add current action
    recentActions.push(now);
    this.actions.set(userId, recentActions);
    
    return true;
  }
}

// Create rate limiters for different actions
export const votingRateLimiter = new RateLimiter(20, 60000); // 20 votes per minute
export const submissionRateLimiter = new RateLimiter(5, 300000); // 5 submissions per 5 minutes
export const notificationRateLimiter = new RateLimiter(50, 60000); // 50 notifications per minute