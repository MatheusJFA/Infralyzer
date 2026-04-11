import { NextResponse} from 'next/server';
import type { NextRequest} from 'next/server';

// Rate Limit Local (Em Memória)
const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 30; 
const ipStore = new Map<string, { count: number; resetTime: number}>();

export function middleware(request: NextRequest) {
 // Aplica rate limit apenas em rotas consumindo as APIs REST "/api/..."
 if (request.nextUrl.pathname.startsWith("/api/")) {
 const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
 const now = Date.now();

 // Limpeza básica do Map (Garbage collector)
 if (ipStore.size > 1000) {
 ipStore.forEach((value, key) => {
 if (value.resetTime < now) ipStore.delete(key);
 });
 }

 let rateRecord = ipStore.get(ip);
 
 // Inicia nova janela se expirou ou não existe
 if (!rateRecord || rateRecord.resetTime < now) {
 rateRecord = { count: 1, resetTime: now + WINDOW_MS};
 } else {
 rateRecord.count += 1;
 }
 
 ipStore.set(ip, rateRecord);

 const remaining = Math.max(0, MAX_REQUESTS - rateRecord.count);
 
 // Se excedeu o limite, retorna 429
 if (rateRecord.count > MAX_REQUESTS) {
 return new NextResponse(
 JSON.stringify({ 
 error: "Too Many Requests", 
 message: "Você excedeu o limite de requisições local (30/min)." 
 }),
 { 
 status: 429, 
 headers: { 
 'Content-Type': 'application/json',
 'X-RateLimit-Limit': MAX_REQUESTS.toString(),
 'X-RateLimit-Remaining': '0',
 } 
 }
 );
 }

 const response = NextResponse.next();
 response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
 response.headers.set('X-RateLimit-Remaining', remaining.toString());
 
 return response;
 }

 return NextResponse.next();
}

export const config = {
 matcher: '/api/:path*',
};
