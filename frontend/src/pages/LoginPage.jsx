import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="animate-fade-up w-full max-w-md rounded-[28px] border border-line bg-white p-8 card-shadow">
        <div className="mb-8 space-y-3 text-center">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-muted">
            Application Logger
          </p>
          <h1 className="font-serif-ui text-5xl leading-none tracking-tight text-ink">
            Sign in
          </h1>
          <p className="text-sm leading-6 text-muted">
            Track every role, follow-up, and recruiter conversation in one workspace.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Email
            </span>
            <input
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              Password
            </span>
            <input
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            className="w-full rounded-full bg-neutral-900 px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.16em] text-muted">
          No account yet?{" "}
          <Link className="text-neutral-900 underline underline-offset-4" to="/signup">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
