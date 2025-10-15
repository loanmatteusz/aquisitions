# Acquisitions API

API para gerenciamento de usuários e autenticação.

## Requisitos

- Node.js 18+
- Docker e Docker Compose

## Ambiente de Desenvolvimento

1. Copie o arquivo de variáveis de ambiente:

```sh
cp .env.example .env.development
```

2. Edite `.env.development` com suas configurações locais.

3. Inicie o ambiente de desenvolvimento com Docker Compose:

```sh
./scripts/dev.sh
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

## Scripts úteis

- Parar o ambiente:  
  ```sh
  docker compose -f docker-compose.dev.yml down -v
  ```
- Rodar testes:  
  ```sh
  npm test
  ```

---
Desenvolvido por loanmatteusz
