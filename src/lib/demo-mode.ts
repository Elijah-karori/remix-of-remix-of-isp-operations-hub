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
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${backendUrl}/api/v1/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      setDemoMode(false);
      return false;
    } else {
      setDemoMode(true);
      return true;
    }
  } catch {
    setDemoMode(true);
    return true;
  }
};

export const clearDemoMode = () => {
  isDemoMode = false;
  demoModeChecked = false;
  localStorage.removeItem("demo_mode");
};
