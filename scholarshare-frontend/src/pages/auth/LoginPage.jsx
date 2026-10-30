import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import FormField from "../../components/formField/FormField";
import { useAuth } from "../../hooks/useAuth";
import { homeRouteForUser } from "../../utils/roles";
import "./AuthPage.css";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Set by ProtectedRoute when someone was bounced to the login page.
  const cameFrom = location.state?.from;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setAccountStatus(null);
    setIsSubmitting(true);

    try {
      const user = await login(form);
      // Role is only known once login succeeds: admins and students land in different places.
      navigate(cameFrom ?? homeRouteForUser(user), { replace: true });
    } catch (err) {
      // err.message comes from the interceptor in services/api/httpClient.js
      // 403 carries a clear reason: waiting for approval, rejected, or disabled.
      setError(err.message ?? "Sign in failed. Please try again.");
      setAccountStatus(err.details?.accountStatus ?? null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue to ScholarShare.</p>

        {error && (
          <p className={`auth-error ${accountStatus ? "auth-notice" : ""}`} role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <FormField
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
          />

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          New to ScholarShare? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
