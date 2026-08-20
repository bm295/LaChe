using LaCheminee.FnB.Application.Authorization;

namespace LaCheminee.FnB.Application.Ports;

public interface ICurrentUser
{
    string Name { get; }
    IReadOnlySet<StaffRole> Roles { get; }
}
