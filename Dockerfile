FROM node:22-bookworm-slim

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080
ENV VITE_AUTH_ENABLED=false
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:8080/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node scripts/migrate.mjs && npm run dev"]
