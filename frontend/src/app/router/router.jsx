import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import ProblemsPage from "../../features/problems/pages/ProblemsPage";
import ProblemDetailPage from "../../features/problems/pages/ProblemDetailPage";
import SubmissionsPage from "../../features/submissions/SubmissionsPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import ProtectedRoute from "../../components/layout/ProtectedRoute";
import RoleProtectedRoute from "../../components/layout/RoleProtectedRoute";
import ProblemImportPage from "../../components/admin/ProblemImportPage";
import ProblemsAdminPage from "../../features/admin/ProblemsAdminPage";
import SignupPage from "../../features/auth/pages/SignupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ProblemsPage /> },
      { path: "problems/:id", element: <ProblemDetailPage /> },
      {
        path: "submissions",
        element: (
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/admin/problems/import",
    element: (
      <RoleProtectedRoute role="admin">
        <App />
      </RoleProtectedRoute>
    ),
    children: [{ index: true, element: <ProblemImportPage /> }]
  },
  {
    path: "/admin/problems",
    element: (
      <RoleProtectedRoute role="admin">
        <App />
      </RoleProtectedRoute>
    ),
    children: [{ index: true, element: <ProblemsAdminPage /> }]
  }
]);
