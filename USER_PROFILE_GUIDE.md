# User Profile and Permissions Guide

## Overview

This guide explains how to access and use user information, roles, and permissions in the ISP ERP application.

## API Endpoints

### 1. Get Current User Profile
```typescript
// Get complete profile including user info, roles, and permissions
const profile = await authApi.getProfile();
```

**Returns:**
```typescript
{
  user: UserOut,           // Basic user information
  roles: Role[],          // Legacy roles (RBAC v1)
  rolesV2: RoleV2[],      // New roles (RBAC v2)
  permissions: Permission[], // All permissions
  userId: number,         // User ID extracted from JWT
  hasPermission: (perm: string) => boolean,  // Helper function
  hasAnyPermission: (perms: string[]) => boolean  // Helper function
}
```

### 2. Individual Endpoints

#### Get User Info
```http
GET /api/v1/users/{user_id}
Authorization: Bearer {token}
```
Note: The user ID is extracted from the JWT token's `sub` claim.

#### Get Permissions
```http
GET /api/v1/rbac/my-permissions
Authorization: Bearer {token}
```

#### Check Specific Permission
```http
GET /api/v1/rbac/check?permission=project:create:all
Authorization: Bearer {token}
```

#### Check Multiple Permissions
```http
POST /api/v1/rbac/check-batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "permissions": ["project:create:all", "task:read:assigned"]
}
```

## Usage in React Components

### Using the Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    permissions, 
    getProfile, 
    hasPermission,
    hasAnyPermission,
    getUserRoles 
  } = useAuth();

  // Get complete profile
  const loadProfile = async () => {
    const profile = await getProfile();
    console.log('User:', profile.user);
    console.log('Roles:', profile.roles);
    console.log('Permissions:', profile.permissions);
  };

  // Check permissions
  const canCreateProject = hasPermission('project:create:all');
  const hasAdminAccess = hasAnyPermission([
    'system:admin',
    'user:manage:all',
    'role:manage:all'
  ]);

  return (
    <div>
      {user && <p>Welcome, {user.full_name}!</p>}
      {canCreateProject && <button>Create Project</button>}
    </div>
  );
}
```

### Using the UserProfile Component
```typescript
import { UserProfile } from '@/components/auth/UserProfile';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserProfile />
    </div>
  );
}
```

## Permission Format

Permissions follow the format: `resource:action:scope`

### Examples:
- `project:create:all` - Create any project
- `project:read:own` - Read own projects only
- `user:manage:department` - Manage users in same department
- `system:admin` - Full system administrator access

### Common Resources:
- `project` - Project management
- `task` - Task management
- `user` - User management
- `role` - Role management
- `system` - System administration
- `finance` - Financial operations
- `crm` - Customer relationship management

### Common Actions:
- `create` - Create new items
- `read` - View items
- `update` - Modify items
- `delete` - Remove items
- `manage` - Full CRUD access
- `admin` - Administrative access

### Common Scopes:
- `all` - All items in system
- `own` - Only own items
- `department` - Items in same department
- `assigned` - Items assigned to user
- `team` - Items in same team

## Role System

### RBAC v1 (Legacy)
- Stored in `user.roles` array
- Simple role-based permissions
- Permissions defined in `role.permissions`

### RBAC v2 (New)
- Stored in `user.roles_v2` array
- Advanced role-based access control
- Supports hierarchical roles
- More granular permission control

## Helper Functions

### hasPermission(permission: string)
Checks if user has a specific permission.

```typescript
if (hasPermission('project:create:all')) {
  // User can create any project
}
```

### hasAnyPermission(permissions: string[])
Checks if user has any of the specified permissions.

```typescript
if (hasAnyPermission(['project:read:all', 'project:read:own'])) {
  // User can read projects (either all or own)
}
```

### getUserRoles()
Returns array of role names.

```typescript
const roles = getUserRoles();
console.log(roles); // ['Admin', 'Project Manager', ...]
```

## Error Handling

### Common Errors and Solutions

1. **401 Unauthorized**
   - Token expired or invalid
   - Solution: Re-authenticate user

2. **403 Forbidden**
   - User doesn't have required permission
   - Solution: Check permissions before making API calls

3. **404 Not Found**
   - User not found
   - Solution: Verify user exists in database

### Example Error Handling
```typescript
try {
  const profile = await getProfile();
  // Use profile data
} catch (error) {
  if (error.message.includes('401')) {
    // Redirect to login
    navigate('/login');
  } else {
    // Show error message
    setError('Failed to load profile');
  }
}
```

## Testing Permissions

### Test Component
```typescript
function PermissionTester() {
  const { hasPermission, permissions } = useAuth();

  return (
    <div>
      <h3>Permission Test</h3>
      <p>Total permissions: {permissions.length}</p>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={hasPermission('project:create:all')}
            readOnly
          />
          Can create projects
        </label>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={hasPermission('user:manage:all')}
            readOnly
          />
          Can manage users
        </label>
      </div>
    </div>
  );
}
```

## Best Practices

1. **Check permissions before showing UI elements**
   ```typescript
   {hasPermission('project:create:all') && (
     <Button>Create Project</Button>
   )}
   ```

2. **Use permission checks in API calls**
   ```typescript
   const createProject = async (data) => {
     if (!hasPermission('project:create:all')) {
       throw new Error('Insufficient permissions');
     }
     // Make API call
   };
   ```

3. **Cache profile data when possible**
   ```typescript
   const [profile, setProfile] = useState(null);
   
   useEffect(() => {
     getProfile().then(setProfile);
   }, []);
   ```

4. **Handle loading states**
   ```typescript
   const { isLoading } = useAuth();
   
   if (isLoading) {
     return <div>Loading...</div>;
   }
   ```

## Debug Mode

Enable debug mode to see detailed permission information:

```typescript
// In development mode
if (process.env.NODE_ENV === 'development') {
  console.log('User permissions:', permissions);
  console.log('User roles:', getUserRoles());
}
```

The UserProfile component automatically shows debug information in development mode.

## API Response Examples

### User Info Response
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-01T00:00:00Z",
  "roles": [
    {
      "id": 1,
      "name": "Admin",
      "permissions": [
        {"name": "system:admin", "codename": "system_admin"}
      ]
    }
  ],
  "roles_v2": [
    {
      "id": 1,
      "name": "Project Manager",
      "level": 2,
      "status": "active"
    }
  ]
}
```

### Permissions Response
```json
{
  "permissions": [
    {
      "id": 1,
      "name": "project:create:all",
      "codename": "project_create_all",
      "description": "Create any project"
    },
    {
      "id": 2,
      "name": "project:read:all",
      "codename": "project_read_all",
      "description": "Read any project"
    }
  ]
}
```
