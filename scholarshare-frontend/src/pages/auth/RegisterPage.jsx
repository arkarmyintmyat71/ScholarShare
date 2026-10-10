import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormField from "../../components/formField/FormField";
import { useAuth } from "../../hooks/useAuth";
import "./AuthPage.css";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">
          Join ScholarShare to share and discover research.
        </p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField
            label="Full name"
            id="name"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleChange}
          />

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
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={handleChange}
          />

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Register for free"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
