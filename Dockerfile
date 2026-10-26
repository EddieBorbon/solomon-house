# La Casa de Salomón — imagen de producción autocontenida (roadmap 7.1)
# Construcción multi-etapa: dependencias -> build -> runtime mínimo.

# ---- Etapa 1: dependencias ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Etapa 2: build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# URL del servidor de señalización WebRTC, incrustada en el bundle del
# cliente durante el build (variables NEXT_PUBLIC_*).
ARG NEXT_PUBLIC_SIGNALING_URL=ws://localhost:3001
ENV NEXT_PUBLIC_SIGNALING_URL=$NEXT_PUBLIC_SIGNALING_URL
RUN npm run build

# ---- Etapa 3: runtime ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Salida standalone de Next.js: servidor + dependencias mínimas
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
