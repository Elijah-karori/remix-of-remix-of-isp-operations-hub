# Authentication Enhancement - Usage Examples

## Quick Start

### 1. Using the Login Modal

```typescript
import { LoginModal } from '@/components/auth/LoginModal';
import { useState } from 'react';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowLogin(true)}>Login</button>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
```

### 2. Using Permission Hooks

```typescript
import { usePermission, useResourcePermissions } from '@/hooks/usePermissions';

function ProjectActions() {
  const canCreate = usePermission('project:create:all');
  const projectPerms = useResourcePermissions('project');
  
  return (
    <div>
      {canCreate && <button>Create Project</button>}
      {projectPerms.canUpdate && <button>Edit</button>}
      {projectPerms.canDelete && <button>Delete</button>}
    </div>
  );
}
```

### 3. Using Permission Gates

```typescript
import { PermissionGate } from '@/components/auth/PermissionGate';

function Dashboard() {
  return (
    <div>
      <PermissionGate permission="finance:read:all">
        <FinanceWidget />
      </PermissionGate>
      
      <PermissionGate 
        permission="admin:manage" 
        fallback={<p>Admin access required</p>}
      >
        <AdminPanel />
      </PermissionGate>
    </div>
  );
}
```

### 4. Using Session Timeout Warning

```typescript
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';

function App() {
  return (
    <AuthProvider>
      <SessionTimeoutWarning />
      <YourApp />
    </AuthProvider>
  );
}
```

### 5. Using Dynamic Sidebar

```typescript
import { DynamicSidebar } from '@/components/navigation/DynamicSidebar';

function Layout() {
  return (
    <div className="flex">
      <aside className="w-64">
        <DynamicSidebar />
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
```

### 6. Using Permission Debugger (Dev Only)

```typescript
import { PermissionDebugger } from '@/components/permissions/PermissionDebugger';

function DevTools() {
  return (
    <div>
      {/* Only shows in development */}
      <PermissionDebugger />
    </div>
  );
}
```

### 7. Using Role-Based Dashboard

```typescript
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';

function DashboardPage() {
  return <RoleBasedDashboard />;
}
```

### 8. Initialize Security Features

```typescript
// In your main.tsx or App.tsx
import { initializeSecurity } from '@/lib/security/csp';

// Call on app initialization
initializeSecurity();
```

## Advanced Examples

### Custom Permission Hook

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const useProjectPermissions = (projectId: number) => {
  const { hasPermission, user } = useAuth();
  
  return {
    canView: hasPermission('project:read:all'),
    canEdit: hasPermission('project:update:all') || 
             (hasPermission('project:update:own') && 
              user?.id === project.manager_id),
    canDelete: hasPermission('project:delete:all'),
    canManageBudget: hasPermission('finance:manage:all'),
  };
};
```

### Rate Limit Handling

```typescript
import { loginRateLimiter } from '@/lib/security/rateLimit';

const handleLogin = async () => {
  if (loginRateLimiter.isLockedOut()) {
    const remaining = loginRateLimiter.getRemainingLockoutTime();
    alert(`Locked out for ${Math.ceil(remaining / 60)} minutes`);
    return;
  }
  
  try {
    await login(email, password);
    loginRateLimiter.recordSuccess();
  } catch (error) {
    loginRateLimiter.recordFailedAttempt();
    const attemptsLeft = loginRateLimiter.getRemainingAttempts();
    alert(`${attemptsLeft} attempts remaining`);
  }
};
```

## Component Integration

### Complete Auth Flow

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { initializeSecurity } from '@/lib/security/csp';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initializeSecurity();
  }, []);
  
  return (
    <AuthProvider>
      <SessionTimeoutWarning />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<MagicLinkVerify />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RoleBasedDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/finance" element={
          <ProtectedRoute requiredPermission="finance:read:all">
            <FinancePage />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
```
