using LaCheminee.FnB.Application.Authorization;
using LaCheminee.FnB.Application.Models;
using LaCheminee.FnB.Application.Ports;
using LaCheminee.FnB.Domain.Entities;
using LaCheminee.FnB.Domain.Enums;
using LaCheminee.FnB.Domain.Services;

namespace LaCheminee.FnB.Application.UseCases;

public sealed class RestaurantService(
    ITableRepository tableRepository,
    IMenuRepository menuRepository,
    IOrderRepository orderRepository,
    IInventoryRepository inventoryRepository,
    IKitchenNotifier kitchenNotifier,
    IPaymentGateway paymentGateway,
    RbacAuthorizer authorizer)
{
    public Task Seed150SeatsLayoutAsync(CancellationToken cancellationToken = default) =>
        tableRepository.SeedLayout150SeatsAsync(cancellationToken);

    public Task AddMenuItemAsync(string code, string name, string category, decimal price, CancellationToken cancellationToken = default) =>
        menuRepository.AddAsync(new MenuItem(code, name, category, price), cancellationToken);

    public async Task<Order> OpenOrderAsync(int tableNumber, string staff, CancellationToken cancellationToken = default)
    {
        var table = await tableRepository.GetAsync(tableNumber, cancellationToken);
        if (table.Status is not (TableStatus.Available or TableStatus.Reserved))
        {
            throw new InvalidOperationException($"Table {tableNumber} is not available.");
        }

        table.Occupy();
        return await orderRepository.CreateAsync(tableNumber, staff, cancellationToken);
    }

    public async Task AddItemToOrderAsync(int orderId, string menuCode, int quantity, string note = "", CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetAsync(orderId, cancellationToken);
        var menuItem = await menuRepository.GetByCodeAsync(menuCode, cancellationToken);
        order.AddItem(menuItem, quantity, note);
        await orderRepository.SaveAsync(order, cancellationToken);
    }

    public async Task RemoveItemFromOrderAsync(int orderId, string menuCode, int quantity, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetAsync(orderId, cancellationToken);
        order.RemoveItem(menuCode, quantity);
        await orderRepository.SaveAsync(order, cancellationToken);
    }

    public async Task SendOrderToKitchenAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetAsync(orderId, cancellationToken);
        order.SendToKitchen();
        await kitchenNotifier.NotifyOrderSentAsync(order, cancellationToken);
        await orderRepository.SaveAsync(order, cancellationToken);
    }

    public async Task DeductInventoryAsync(int orderId, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetAsync(orderId, cancellationToken);
        foreach (var item in order.Items)
        {
            var inventoryItem = await inventoryRepository.GetByMenuCodeAsync(item.Item.Code, cancellationToken);
            inventoryItem.Deduct(item.Quantity);
            await inventoryRepository.SaveAsync(inventoryItem, cancellationToken);
        }
    }

    public async Task<BillSummary> CloseAndPayAsync(
        int orderId,
        string method,
        decimal serviceChargeRate = 0.05m,
        decimal vatRate = 0.10m,
        CancellationToken cancellationToken = default)
    {
        authorizer.Require(Permission.CloseAndPayOrder);

        var order = await orderRepository.GetAsync(orderId, cancellationToken);
        await DeductInventoryAsync(orderId, cancellationToken);

        order.Close();
        var result = BillingCalculator.Calculate(order.Subtotal, serviceChargeRate, vatRate);
        var paymentRequest = new PaymentRequest(order.Id, result.Total, method);
        var payment = await paymentGateway.ProcessAsync(paymentRequest, cancellationToken);

        if (payment.Status != PaymentStatus.Captured)
        {
            throw new InvalidOperationException("Payment could not be captured.");
        }

        order.MarkPaid();

        var table = await tableRepository.GetAsync(order.TableNumber, cancellationToken);
        table.Release();

        await orderRepository.SaveAsync(order, cancellationToken);
        return new BillSummary(result.Subtotal, result.ServiceCharge, result.Vat, result.Total);
    }

    public async Task<OccupancyReport> GetOccupancyReportAsync(CancellationToken cancellationToken = default)
    {
        var tables = await tableRepository.ListAsync(cancellationToken);
        var totalTables = tables.Count;
        var occupiedTables = tables.Count(t => t.Status == TableStatus.Occupied);
        var totalSeats = tables.Sum(t => t.Capacity);
        var occupiedSeats = tables.Where(t => t.Status == TableStatus.Occupied).Sum(t => t.Capacity);

        var occupiedTableRate = totalTables == 0 ? 0 : decimal.Round((decimal)occupiedTables / totalTables * 100, 2);
        var occupiedSeatRate = totalSeats == 0 ? 0 : decimal.Round((decimal)occupiedSeats / totalSeats * 100, 2);

        return new OccupancyReport(occupiedTableRate, occupiedSeatRate);
    }
}
