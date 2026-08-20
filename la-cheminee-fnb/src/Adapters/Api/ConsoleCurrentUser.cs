using LaCheminee.FnB.Application.Authorization;
using LaCheminee.FnB.Application.Ports;

namespace LaCheminee.FnB.Adapters.Api;

public sealed class ConsoleCurrentUser : ICurrentUser
{
    public string Name => "Marie";

    public IReadOnlySet<StaffRole> Roles { get; } = new HashSet<StaffRole>
    {
        StaffRole.Cashier
    };
}
