import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)] shadow-[var(--shadow-md)]">
              <span className="text-xl font-bold text-[var(--color-text-white)]">
                G
              </span>
            </div>
          </div>

          <h1 className="text-[var(--text-2xl)] font-bold text-[var(--color-text-primary)]">
            GFC
          </h1>

          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Management Software
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-[var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
              Welcome Back
            </h2>

            <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
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
                  className="flex items-center justify-center text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-text-primary)]"
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
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />

                <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-[var(--text-sm)] font-medium text-[var(--color-primary)] transition-colors duration-150 hover:text-[var(--color-primary-hover)]"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
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
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[var(--text-xs)] text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} GFC. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;