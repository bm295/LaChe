# La Cheminée FnB

Restaurant operations backend built with TypeScript, NestJS, Fastify, and a hexagonal architecture.

Requires Node.js 22 or later (Node.js 24 LTS is used in CI).

## Commands

```bash
npm install
npm run start:dev
npm test
npm run test:coverage
```

## Structure

```text
src/
  domain/          Business entities, value objects, and policies
  application/     Use cases and ports
  adapters/        HTTP and persistence implementations
  infrastructure/  Framework composition
```
