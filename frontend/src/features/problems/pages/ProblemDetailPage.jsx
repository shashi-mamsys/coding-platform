import { useParams } from "react-router-dom";
import ProblemWorkspace from "../../../components/layout/ProblemWorkspace";
import { useProblem } from "../hooks/useProblem";

export default function ProblemDetailPage() {
  const { id } = useParams();
  const { problem, error, loading } = useProblem(id);
  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!problem) return <div className="text-sm text-slate-600">Problem not found</div>;
  return <ProblemWorkspace problem={problem} />;
}
