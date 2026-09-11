import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-secondary)] px-4 py-10">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-3xl" />

      <div className="relative w-full max-w-[430px] pt-14">

        {/* Floating Logo */}
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/80 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
            
            {/* Soft bubble highlight */}
            <div className="pointer-events-none absolute left-4 top-3 h-5 w-5 rounded-full bg-white/80 blur-[2px]" />

            <img
              src="/Gfc-logo.svg"
              alt="GFC Logo"
              className="relative z-10 h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="relative rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-7 pb-7 pt-20 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:px-9 sm:pb-9">

          {/* Minimal Header */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Welcome back
            </h1>

            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Sign in to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              icon={<Mail size={18} />}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              icon={<LockKeyhole size={18} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--border-color)] accent-[var(--color-primary)]"
                />

                <span className="text-sm text-[var(--text-secondary)]">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Tiny bottom detail */}
          <div className="mt-6 border-t border-[var(--border-color)] pt-5 text-center">
            <span className="text-xs text-[var(--text-muted)]">
              GFC Management Software
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;