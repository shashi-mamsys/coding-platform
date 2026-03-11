import { useAuthContext } from "../../app/providers/authProvider";
import { useTheme } from "../../app/providers/themeProvider";
import { Button } from "../ui/Button";

export function Navbar() {
  const { user, logout } = useAuthContext();
  const { theme, toggle } = useTheme();
  return (
    <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <a href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
              Coding Platform
            </a>
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            <a href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
              Dashboard
            </a>
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
          <Button
            onClick={toggle}
            className="bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
          {user ? (
            <>
              {user.role === "admin" && (
                <div className="flex gap-2">
                  <a
                    href="/admin/problems"
                    className="rounded-md bg-slate-100 px-3 py-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Admin
                  </a>
                  <a
                    href="/admin/problems/import"
                    className="rounded-md bg-slate-100 px-3 py-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Import
                  </a>
                </div>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{user.email}</span>
              <Button
                onClick={logout}
                className="bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <a
                href="/signup"
                className="rounded-md bg-slate-200 px-3 py-2 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Sign up
              </a>
              <a
                href="/login"
                className="rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500"
              >
                Login
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
