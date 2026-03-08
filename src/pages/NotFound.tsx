import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center px-4">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Page not found</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="text-primary font-medium underline hover:no-underline">
            Return to Home
          </Link>
          <Link to="/projects" className="text-primary font-medium underline hover:no-underline">
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
