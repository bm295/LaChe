# La Cheminee FnB

Restaurant operations application with a NestJS/Fastify API and a React staff interface. It currently supports bill estimation and kitchen production planning from available ingredient packs.

## Requirements

- Node.js 22 or later (CI uses Node.js 24)
- npm

## Run locally

Install dependencies for both applications:

```bash
npm install
npm --prefix web install
```

Start the API at `http://localhost:3000`:

```bash
npm run start:dev
```

In a second terminal, start the staff interface at the URL shown by Vite (normally `http://localhost:5173`):

```bash
npm --prefix web run dev
```

The browser app calls the local API by default. Set `VITE_API_URL` when the API is hosted elsewhere.

## Available API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/menu/:id` | Get a menu item |
| `GET` | `/bills/estimate?subtotal=1000000` | Estimate a bill including service charge and VAT |
| `POST` | `/recipes/maximum-portions` | Calculate complete portions possible from inventory |
| `POST` | `/reports/most-ordered-menu-item` | Find the most ordered menu item in a selected shift, day, or week |

Example production-planning request:

```json
{
  "ingredients": [
    { "ingredientName": "Coffee", "unitsRequiredPerPortion": 2, "packCount": 3, "unitsPerPack": 24 },
    { "ingredientName": "Milk", "unitsRequiredPerPortion": 3, "packCount": 2, "unitsPerPack": 36 }
  ]
}
```

The response is `{ "maximumPortions": 24 }`. The ingredient that can produce the fewest portions determines the result.

Example most-ordered-item request. The API accepts real order lines and filters them to the inclusive-start, exclusive-end reporting period:

```json
{
  "reportingPeriod": {
    "startsAt": "2026-09-05T18:00:00+07:00",
    "endsAt": "2026-09-05T22:00:00+07:00"
  },
  "orders": [
    { "menuItemId": "house-coffee", "orderedAt": "2026-09-05T18:10:00+07:00", "quantity": 2 },
    { "menuItemId": "iced-latte", "orderedAt": "2026-09-05T18:30:00+07:00", "quantity": 3 },
    { "menuItemId": "iced-latte", "orderedAt": "2026-09-05T20:15:00+07:00", "quantity": 2 }
  ]
}
```

The response is `{ "menuItemId": "iced-latte", "orderedQuantity": 5 }`. The report supports unbounded string IDs and order-line quantities. For equal quantities, the lexical-smaller menu ID wins so the result is deterministic.

## Development commands

```bash
npm test                 # Run API/domain tests
npm run test:coverage    # Run tests with terminal and Cobertura coverage
npm run build            # Build the API
npm --prefix web run build # Build the React interface
```

GitHub Actions runs both builds and the tests for pushes and pull requests targeting `master`. Coverage is printed in the workflow output and job summary.

## Project structure

```text
src/
  domain/          Business rules, including billing and production capacity
  application/     Use cases and ports
  adapters/        HTTP and persistence implementations
  infrastructure/  NestJS composition
web/               React/Vite staff interface
test/              Vitest domain tests
features/          Gherkin business scenarios
```
