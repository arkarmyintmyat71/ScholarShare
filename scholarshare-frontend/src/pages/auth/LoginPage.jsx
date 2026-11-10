import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import GoogleButton from "../../features/auth/GoogleButton";
import FormField from "../../components/formField/FormField";
import { useAuth } from "../../hooks/useAuth";
import { homeRouteForUser } from "../../utils/roles";
import AuthShell from "../../components/auth/AuthShell";

function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
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

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(() => login(form));
  };

  const handleGoogle = (idToken) => submit(() => loginWithGoogle(idToken));

  const submit = async (signIn) => {
    setError(null);
    setAccountStatus(null);
    setIsSubmitting(true);

    try {
      const user = await signIn();
      // Role is only known once login succeeds: admins and students land in different places.
      navigate(cameFrom ?? homeRouteForUser(user), { replace: true });
    } catch (err) {
      // err.message comes from the interceptor in services/api/httpClient.js
      // 403 carries a clear reason: the account is disabled.
      setError(err.message ?? "Sign in failed. Please try again.");
      setAccountStatus(err.details?.accountStatus ?? null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
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
          icon="mail"
          id="email"
          placeholder="you@university.edu"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <FormField
          label="Password"
          icon="lock"
          id="password"
          placeholder="Your password"
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

      <GoogleButton onCredential={handleGoogle} onError={setError} />

      <p className="auth-switch">
        New to ScholarShare? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export default LoginPage;
