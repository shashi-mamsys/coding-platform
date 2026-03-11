import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { authService } from "../../../services/authService";
import { tokenStorage } from "../../../services/tokenStorage";
import { useAuthContext } from "../../../app/providers/authProvider";
import { Navbar } from "../../../components/layout/Navbar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const session = await authService.signup({ email, password });
      tokenStorage.set(session.token);
      setUser?.(session.user);
      navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto mt-12 max-w-md rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-800">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500">
            Sign up
          </Button>
        </form>
      </div>
    </>
  );
}
