# La Cheminée Restaurant - FnB Management (.NET 10 / C# 14)

This project has been refactored to follow **Hexagonal Architecture (Ports & Adapters)** with clear boundaries for Domain, Application, Adapters, and Infrastructure.

## Implemented capabilities
- Table/seat management for a **150-seat** layout.
- Order lifecycle:
  1) Create order
  2) Add item
  3) Remove item
  4) Send to kitchen
  5) Deduct inventory
  6) Close order
  7) Process payment
- Inventory tracking and stock deduction per ordered item.
- Payment processing via an outbound port (`IPaymentGateway`) with simulated adapter.
- Queued kitchen dispatch handled by a background worker behind `IKitchenNotifier`.
- Basic occupancy reporting.
- Role-based access control (RBAC): only staff with the `Cashier` or `Manager` role can close and pay an order.
- Dependency Injection with `Microsoft.Extensions.DependencyInjection`.
- Asynchronous application use cases and ports.

## Structure
```
la-cheminee-fnb/
  Program.cs
  src/
    Domain/
      Entities/
      Enums/
      ValueObjects/
      Services/
    Application/
      Models/
      Ports/
      UseCases/
    Adapters/
      Api/
      Persistence/
      External/
    Infrastructure/
```

## Run
```bash
dotnet run --project la-cheminee-fnb/LaCheminee.FnB.csproj
```
