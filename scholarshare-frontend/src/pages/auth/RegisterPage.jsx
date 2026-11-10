import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import GoogleButton from "../../features/auth/GoogleButton";
import FormField from "../../components/formField/FormField";
import { useAuth } from "../../hooks/useAuth";
import { homeRouteForUser } from "../../utils/roles";
import AuthShell from "../../components/auth/AuthShell";

function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await register(form);
      navigate(homeRouteForUser(user), { replace: true });
    } catch (err) {
      setError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // "Sign up with Google": the account is created (or found) and the student goes straight to the dashboard.
  const handleGoogle = async (idToken) => {
    setError(null);
    try {
      const user = await loginWithGoogle(idToken);
      navigate(homeRouteForUser(user), { replace: true });
    } catch (err) {
      setError(err.message ?? "Google sign-up failed. Please try again.");
    }
  };

  return (
    <AuthShell>
      <h1>Create your account</h1>
      <p className="subtitle">
        Join ScholarShare to share and discover research.
      </p>

      {error && <p className="auth-error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <FormField
          label="Full name"
          icon="user"
          id="name"
          placeholder="Your name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
        />

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
          placeholder="At least 8 characters"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          value={form.password}
          onChange={handleChange}
        />

        <label className="auth-agree">
          <input
            type="checkbox"
            checked={agreed}
            required
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I agree to the <Link to="/terms" target="_blank">Terms &amp; Conditions</Link> and the{" "}
            <Link to="/privacy" target="_blank">Privacy Policy</Link>.
          </span>
        </label>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Register for free"}
        </button>
      </form>

      <GoogleButton text="signup_with" onCredential={handleGoogle} onError={setError} />

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export default RegisterPage;
