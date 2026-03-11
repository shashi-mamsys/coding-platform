export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none ${className}`}
      {...props}
    />
  );
}
