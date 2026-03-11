const links = [
  { label: "Problems", href: "/" },
  { label: "Submissions", href: "/submissions" },
  { label: "Contests", href: "#", disabled: true }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
      <div className="px-4 py-6">
        <nav className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`block rounded-md px-3 py-2 ${
                link.disabled
                  ? "cursor-not-allowed text-slate-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-disabled={link.disabled ? "true" : "false"}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
