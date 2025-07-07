import { validateEnv } from "@/config/env";

export function initializeApp() {
  try {
    validateEnv();
    console.log("✅ Environment validation passed");
  } catch (error) {
    console.error(
      "❌ Environment validation failed:",
      (error as Error).message
    );
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

export function setupGlobalErrorHandlers() {
  if (typeof window !== "undefined") {
    // Client-side error handling
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
    });
  } else {
    // Server-side error handling
    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled rejection at:", promise, "reason:", reason);
      process.exit(1);
    });
  }
}
