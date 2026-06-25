/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede clickjacking
          { key: 'X-Frame-Options',        value: 'DENY' },
          // Impede MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Limita referrer em cross-origin
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          // Bloqueia acesso a features sensíveis não usadas
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
          // Força HTTPS por 1 ano (incluindo subdomains)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // CSP: permite apenas recursos do próprio domínio + Supabase + Stripe + Vercel
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
