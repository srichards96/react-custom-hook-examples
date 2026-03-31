import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

const RootLayout = () => (
  <>
    <div className="flex flex-col min-h-screen bg-slate-800 text-white">
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>

    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
