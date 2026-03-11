import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../app/providers/authProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return <div className="p-6 text-sm text-slate-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
