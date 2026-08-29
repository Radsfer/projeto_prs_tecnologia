FROM node:22-slim

WORKDIR /app

# O query engine do Prisma exige OpenSSL; node:*-slim não o traz por padrão.
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3333

# Migra + seed + sobe a API. Execução via tsx (sem build) para simplicidade local.
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npx tsx src/server.ts"]
