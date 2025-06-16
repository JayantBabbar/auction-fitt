
// Input validation utilities for security
export const sanitizeHTML = (input: string): string => {
  // Basic HTML sanitization - remove potentially dangerous tags
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateBidAmount = (amount: number, minBid: number): { valid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Bid amount must be a positive number' };
  }
  
  if (amount < minBid) {
    return { valid: false, error: `Bid amount must be at least $${minBid}` };
  }
  
  // Check for reasonable maximum (prevent extremely large numbers)
  if (amount > 10000000) {
    return { valid: false, error: 'Bid amount exceeds maximum allowed value' };
  }
  
  return { valid: true };
};

export const validateAuctionTitle = (title: string): { valid: boolean; error?: string; sanitized?: string } => {
  const sanitized = sanitizeHTML(title.trim());
  
  if (sanitized.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters long' };
  }
  
  if (sanitized.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  
  return { valid: true, sanitized };
};

export const validateAuctionDescription = (description: string): { valid: boolean; error?: string; sanitized?: string } => {
  const sanitized = sanitizeHTML(description.trim());
  
  if (sanitized.length < 10) {
    return { valid: false, error: 'Description must be at least 10 characters long' };
  }
  
  if (sanitized.length > 5000) {
    return { valid: false, error: 'Description must be less than 5000 characters' };
  }
  
  return { valid: true, sanitized };
};
