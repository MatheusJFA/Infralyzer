import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const WINDOW_MS = 60 * 1000; // 1 minuto de janela
const MAX_REQUESTS = 30;     // 30 requisições permitidas por IP dentro do minuto

// Cache In-Memory Simples (funciona bem local e containers isolados)
const ipStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Aplica rate limit apenas em rotas consumindo as APIs REST "/api/..."
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const now = Date.now();

    // Garbage collector básico para liberar ram do Map se passar de 10k acessos diferentes
    if (ipStore.size > 10000) {
      for (const [key, value] of ipStore.entries()) {
        if (value.resetTime < now) ipStore.delete(key);
      }
    }

    let rateRecord = ipStore.get(ip);
    
    // Inicia nova janela para o IP se ele não existe ou se já expirou
    if (!rateRecord || rateRecord.resetTime < now) {
      rateRecord = { count: 1, resetTime: now + WINDOW_MS };
      ipStore.set(ip, rateRecord);
    } else {
      rateRecord.count += 1;
      ipStore.set(ip, rateRecord);

      // Bloqueia com 429 Too Many Requests se ultrapassou o volume da janela
      if (rateRecord.count > MAX_REQUESTS) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Too Many Requests", 
            message: "Você excedeu o limite do Rate Limit. Tente novamente em alguns instantes." 
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const response = NextResponse.next();
    // Headers didáticos do protocolo de Rate Limiting
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - rateRecord.count).toString());
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
