// src/utils/cookieUtils.js (Enhanced with debugging)

/**
 * Get a cookie value by name with detailed logging
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  try {
    if (typeof document === 'undefined') {
      console.warn('[Cookie] Document not available (SSR?)');
      return null;
    }

    const allCookies = document.cookie;
    console.log('[Cookie] All cookies:', allCookies);
    
    const value = `; ${allCookies}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      console.log(`[Cookie] Found ${name}:`, cookieValue ? 'Present' : 'Empty');
      return cookieValue;
    }
    
    console.log(`[Cookie] Cookie ${name} not found`);
    return null;
  } catch (error) {
    console.error('[Cookie] Error reading cookie:', error);
    return null;
  }
};

/**
 * Check if user is authenticated by checking for token cookie
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = getCookie('token');
  const authenticated = !!token && token.length > 10; // Basic length check
  console.log('[Auth] Authentication check:', {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    authenticated
  });
  return authenticated;
};

/**
 * Get authentication token from cookie
 * @returns {string|null} Token or null if not found
 */
export const getAuthToken = () => {
  const token = getCookie('token');
  console.log('[Auth] Getting token:', {
    hasToken: !!token,
    tokenStart: token ? token.substring(0, 20) + '...' : 'None',
    tokenLength: token?.length || 0
  });
  return token;
};

/**
 * Parse JWT token payload (client-side only for basic info)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const parseJWT = (token) => {
  try {
    if (!token) {
      console.log('[JWT] No token provided for parsing');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWT] Invalid token format - expected 3 parts, got:', parts.length);
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    console.log('[JWT] Token parsed successfully:', {
      userId: payload.id,
      exp: payload.exp,
      iat: payload.iat
    });
    return payload;
  } catch (error) {
    console.error('[JWT] Error parsing JWT:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export const isTokenExpired = (token) => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    console.log('[JWT] No expiration found in token');
    return true;
  }
  
  const currentTime = Date.now() / 1000;
  const isExpired = payload.exp < currentTime;
  
  console.log('[JWT] Token expiration check:', {
    exp: payload.exp,
    now: currentTime,
    expiresIn: Math.round(payload.exp - currentTime),
    isExpired
  });
  
  return isExpired;
};

/**
 * Comprehensive authentication validation
 * @returns {object} Validation result with details
 */
export const validateAuth = () => {
  console.log('\n=== COMPREHENSIVE AUTH VALIDATION ===');
  
  // Check if we're in browser environment
  if (typeof document === 'undefined') {
    console.log('[Auth] Not in browser environment');
    return { 
      valid: false, 
      reason: 'Not in browser environment',
      details: {}
    };
  }

  // Get all cookies for debugging
  const allCookies = document.cookie;
  console.log('[Auth] All cookies:', allCookies || 'No cookies found');
  
  // Get token
  const token = getAuthToken();
  if (!token) {
    console.log('[Auth] ❌ No token found');
    return { 
      valid: false, 
      reason: 'No token found',
      details: { allCookies }
    };
  }

  // Parse token
  const payload = parseJWT(token);
  if (!payload) {
    console.log('[Auth] ❌ Invalid token format');
    return { 
      valid: false, 
      reason: 'Invalid token format',
      details: { tokenLength: token.length }
    };
  }

  // Check expiration
  const expired = isTokenExpired(token);
  if (expired) {
    console.log('[Auth] ❌ Token expired');
    return { 
      valid: false, 
      reason: 'Token expired',
      details: { 
        exp: payload.exp, 
        now: Date.now() / 1000,
        expiredBy: Math.round((Date.now() / 1000) - payload.exp)
      }
    };
  }

  console.log('[Auth] ✅ Authentication valid');
  return { 
    valid: true, 
    reason: 'Valid authentication',
    details: { 
      userId: payload.id,
      exp: payload.exp,
      tokenLength: token.length
    }
  };
};

// Debug helper - call this in console to check auth status
window.debugAuth = () => {
  console.clear();
  return validateAuth();
};