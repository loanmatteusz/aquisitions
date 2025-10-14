#!/bin/bash

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# 1️⃣ Carregar variáveis do .env.development
if [ ! -f .env.development ]; then
  echo "❌ .env.development not found!"
  exit 1
fi

# Exporta todas as variáveis
set -a
source .env.development
set +a

# 2️⃣ Verificar Docker
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running!"
  exit 1
fi

# 3️⃣ Limpar containers/volumes antigos
echo "🧹 Cleaning old containers and volumes..."
docker compose -f docker-compose.dev.yml down -v

# 4️⃣ Subir apenas o banco de dados
echo "📦 Starting database container..."
docker compose -f docker-compose.dev.yml up -d database

# 5️⃣ Esperar até o banco estar pronto
echo "⏳ Waiting for database '${POSTGRES_DB}' at host '${DATABASE_HOST}'..."
until docker exec acquisitions-db pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} >/dev/null 2>&1; do
  sleep 2
done
echo "✅ Database '${POSTGRES_DB}' is ready!"

# 6️⃣ Rodar migrações dentro do container da app
echo "📜 Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml run --rm \
  -e DATABASE_URL=${DATABASE_URL} \
  app npm run db:migrate

# 7️⃣ Subir o ambiente completo (app + db)
echo "🚀 Starting full development environment..."
docker compose -f docker-compose.dev.yml up --build

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:${PORT}"
echo "   Database URL: ${DATABASE_URL}"
echo ""
echo "To stop: docker compose -f docker-compose.dev.yml down -v"
