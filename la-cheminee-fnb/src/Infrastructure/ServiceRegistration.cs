using LaCheminee.FnB.Adapters.Api;
using LaCheminee.FnB.Adapters.External;
using LaCheminee.FnB.Adapters.Persistence;
using LaCheminee.FnB.Application.Authorization;
using LaCheminee.FnB.Application.Ports;
using LaCheminee.FnB.Application.UseCases;
using Microsoft.Extensions.DependencyInjection;

namespace LaCheminee.FnB.Infrastructure;

public static class ServiceRegistration
{
    public static IServiceCollection AddFnbServices(this IServiceCollection services)
    {
        services.AddSingleton<ITableRepository, InMemoryTableRepository>();
        services.AddSingleton<IMenuRepository, InMemoryMenuRepository>();
        services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();
        services.AddSingleton<IInventoryRepository, InMemoryInventoryRepository>();
        services.AddSingleton<IPaymentGateway, SimulatedPaymentGateway>();
        services.AddSingleton<IKitchenNotifier, ConsoleKitchenNotifier>();
        services.AddSingleton<ICurrentUser, ConsoleCurrentUser>();
        services.AddSingleton<RbacAuthorizer>();
        services.AddSingleton<RestaurantService>();
        return services;
    }
}
