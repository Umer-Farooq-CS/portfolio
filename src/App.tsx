import { lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MotionPolicyProvider } from "@/lib/motion-policy";
import { ThemeProvider } from "@/lib/theme";
import AppShell from "./components/shell/AppShell";
import Index from "./pages/Index";
import ProfileSelectorPage from "./pages/ProfileSelectorPage";

// Routes below the homepage load on demand, so the first paint doesn't pay for
// pages the visitor may never open.
const ProfileLayout = lazy(() => import("./components/profile/ProfileLayout"));
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionPolicyProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter basename={getBasename()}>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<ProfileSelectorPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                  <Route path="/lab" element={<LabPage />} />
                  <Route path="/thanks" element={<ThanksPage />} />
                  <Route path="/cv" element={<CvPage />} />
                  <Route path="/uses" element={<UsesPage />} />
                  <Route path="/notes" element={<NotesPage />} />

                  {/*
                    One parametric block for all three profiles, instead of
                    tripling every route above: React Router ranks the static
                    segments above over ":profile", so "/about" still matches
                    its own literal route first. ProfileLayout 404s on an
                    unknown segment before any child page renders.
                  */}
                  <Route path=":profile" element={<ProfileLayout />}>
                    <Route index element={<Index />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:slug" element={<ProjectDetailPage />} />
                    <Route path="lab" element={<LabPage />} />
                    <Route path="cv" element={<CvPage />} />
                    <Route path="uses" element={<UsesPage />} />
                    <Route path="notes" element={<NotesPage />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MotionPolicyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
