import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Validates src/data against its zod schemas and logs any problem immediately.
// The branch is compiled away in production builds.
if (import.meta.env.DEV) {
  void import("./data/validate");
}

createRoot(document.getElementById("root")!).render(<App />);
