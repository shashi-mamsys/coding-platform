import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";

export default function App() {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith("/problems/");
  return (
    <>
      <Navbar />
      <div className="flex">
        {!isWorkspace && <Sidebar />}
        <main className={`flex-1 px-6 py-6 ${isWorkspace ? "" : "mx-auto"}`}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
