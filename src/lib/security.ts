/**
 * Librería de seguridad para el Portal Espiritual
 * Implementa encriptación, sanitización y validación
 */

// Sanitización de texto para prevenir XSS
export function sanitizeText(text: string): string {
  if (!text) return "";
  
  // Escapar caracteres HTML peligrosos
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validación de teléfono
export function validatePhone(phone: string, countryCode: string): boolean {
  // Eliminar espacios y caracteres especiales
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Validar longitud según código de país
  const validLengths: Record<string, number> = {
    "+1": 10,   // USA/Canadá
    "+52": 10,  // México
    "+34": 9,   // España
    "+54": 10,  // Argentina
    "+57": 10,  // Colombia
    "+58": 10   // Venezuela
  };
  
  const expectedLength = validLengths[countryCode] || 10;
  return cleanPhone.length === expectedLength && /^\d+$/.test(cleanPhone);
}

// Validación de nombre
export function validateName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  if (name.length > 100) return false;
  
  // Solo letras, espacios y algunos caracteres especiales
  const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s'-]+$/;
  return nameRegex.test(name);
}

// Validación de texto de problema
export function validateProblem(problem: string): boolean {
  if (!problem || problem.trim().length < 10) return false;
  if (problem.length > 1000) return false;
  return true;
}

// Rate limiting simple (lado del cliente)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar intentos dentro de la ventana de tiempo
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Añadir intento actual
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  getRemainingTime(key: string, maxAttempts: number, windowMs: number): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const remainingMs = windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }
}

export const rateLimiter = new RateLimiter();

// Encriptación simple para localStorage (AES-256-GCM simulation)
// NOTA: Esto es una implementación básica. Para producción usar crypto-js
export function encryptData(data: string, key: string): string {
  // En producción, usar crypto-js o similar
  // Esta es una implementación básica para demostración
  const encrypted = btoa(data); // Base64 simple (NO USAR EN PRODUCCIÓN)
  return encrypted;
}

export function decryptData(encrypted: string, key: string): string {
  try {
    const decrypted = atob(encrypted);
    return decrypted;
  } catch {
    return "";
  }
}

// Generar ID único seguro
export function generateSecureId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validar formato de email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Limpiar HTML de scripts maliciosos
export function stripScripts(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

// Validación de mensaje de chat
export function validateMessage(message: string): boolean {
  if (!message || message.trim().length === 0) return false;
  if (message.length > 5000) return false; // Max 5000 caracteres
  return true;
}

// Detectar contenido sospechoso
export function detectSuspiciousContent(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
    /<iframe/i,
    /eval\(/i,
    /document\.cookie/i,
    /window\.location/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
}

// Limitar longitud de texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}