/**
 * Simple in-memory rate limiter
 * Útil para ambientes serverless (vercel, aws lambda, etc)
 * Para produção com tráfego alto, considere usar Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit baseado em IP/identificador
 * @param identifier - IP ou user ID único
 * @param limit - Máximo de requisições permitidas
 * @param windowMs - Janela de tempo em ms (padrão: 1 minuto)
 * @returns true se permitido, false se limite excedido
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = identifier;

  if (!store[key]) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  // Se a janela expirou, reseta o contador
  if (now > store[key].resetTime) {
    store[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  // Incrementa o contador
  store[key].count++;

  // Verifica se excedeu o limite
  return store[key].count <= limit;
}

/**
 * Rate limit para autenticação (brute force protection)
 * Mais restritivo para login attempts
 * @param identifier - IP ou user identifier
 * @returns true se permitido, false se limite excedido
 */
export function authRateLimit(identifier: string): boolean {
  // 5 tentativas a cada 15 minutos
  return rateLimit(identifier, 5, 15 * 60 * 1000);
}

/**
 * Rate limit para APIs públicas
 * @param identifier - IP do cliente
 * @returns true se permitido, false se limite excedido
 */
export function apiRateLimit(identifier: string): boolean {
  // 100 requisições a cada minuto
  return rateLimit(identifier, 100, 60 * 1000);
}

/**
 * Limpa o store periodicamente para evitar memory leak
 * Chame isto em um cron job ou scheduled function
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  let count = 0;

  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
      count++;
    }
  }

  console.log(`[rateLimit] Limpou ${count} entradas expiradas`);
}

// Limpa automaticamente a cada 5 minutos
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
