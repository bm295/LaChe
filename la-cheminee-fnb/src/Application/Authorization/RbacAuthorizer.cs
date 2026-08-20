using LaCheminee.FnB.Application.Ports;

namespace LaCheminee.FnB.Application.Authorization;

public sealed class RbacAuthorizer(ICurrentUser currentUser)
{
    private static readonly IReadOnlyDictionary<Permission, IReadOnlySet<StaffRole>> AllowedRoles =
        new Dictionary<Permission, IReadOnlySet<StaffRole>>
        {
            [Permission.CloseAndPayOrder] = new HashSet<StaffRole>
            {
                StaffRole.Cashier,
                StaffRole.Manager
            }
        };

    public void Require(Permission permission)
    {
        if (AllowedRoles[permission].Overlaps(currentUser.Roles))
        {
            return;
        }

        throw new UnauthorizedAccessException(
            $"User '{currentUser.Name}' is not authorized for permission '{permission}'.");
    }
}
