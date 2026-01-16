// Demo mode state management
let isDemoMode = false;
let demoModeChecked = false;

export const setDemoMode = (enabled: boolean) => {
  isDemoMode = enabled;
  demoModeChecked = true;
  if (enabled) {
    localStorage.setItem("demo_mode", "true");
    console.log("🎭 Demo mode enabled - using mock data");
  } else {
    localStorage.removeItem("demo_mode");
  }
};

export const getDemoMode = () => isDemoMode;
export const isDemoModeChecked = () => demoModeChecked;

// Check if we should use demo mode based on backend availability
export const checkBackendAndSetDemoMode = async (backendUrl: string): Promise<boolean> => {
  // Check if demo mode was previously set
  const savedDemoMode = localStorage.getItem("demo_mode");
  if (savedDemoMode === "true") {
    setDemoMode(true);
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Try OPTIONS request to check CORS availability (doesn't require auth)
    const response = await fetch(`${backendUrl}/api/v1/rbac/my-permissions`, {
      method: "OPTIONS",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // If we get any response (even 401/405), backend is reachable
    setDemoMode(false);
    console.log("✅ Backend reachable at", backendUrl);
    return false;
  } catch (error) {
    // Network error means backend is unreachable - enable demo mode
    console.log("⚠️ Backend unreachable, enabling demo mode:", error);
    setDemoMode(true);
    return true;
  }
};

// Force disable demo mode (for when user wants to connect to real backend)
export const forceDisableDemoMode = () => {
  isDemoMode = false;
  demoModeChecked = true;
  localStorage.removeItem("demo_mode");
  console.log("🔌 Demo mode disabled - attempting real backend connection");
};

export const clearDemoMode = () => {
  isDemoMode = false;
  demoModeChecked = false;
  localStorage.removeItem("demo_mode");
};
