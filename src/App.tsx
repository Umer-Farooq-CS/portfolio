import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import { ThemeProvider } from "@/lib/theme";
import AppShell from "./components/shell/AppShell";
import Index from "./pages/Index";

// Routes below the homepage load on demand, so the first paint doesn't pay for
// pages the visitor may never open.
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ThanksPage = lazy(() => import("./pages/ThanksPage"));
const LabPage = lazy(() => import("./pages/LabPage"));
const CvPage = lazy(() => import("./pages/CvPage"));
const UsesPage = lazy(() => import("./pages/UsesPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // live data is revalidated at most every 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * The router basename comes from Vite's BASE_URL, which is derived from `base` in
 * vite.config.ts. Inferring it from window.location (as this used to) breaks deep
 * links: opening /about on a user site would set the basename to "/about".
 */
function getBasename(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  if (base === "./" || base === "/" || base === "") return "/";
  return base.replace(/\/+$/, "") || "/";
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionPolicyProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter basename={getBasename()}>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                    <Route path="/lab" element={<LabPage />} />
                    <Route path="/thanks" element={<ThanksPage />} />
                    <Route path="/cv" element={<CvPage />} />
                    <Route path="/uses" element={<UsesPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </MotionPolicyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
