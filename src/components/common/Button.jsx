function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  onClick,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

  const variants = {
    primary:
      "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",

    secondary:
      "bg-slate-100 text-[var(--color-text-primary)] hover:bg-slate-200",

    outline:
      "border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-slate-50",

    danger:
      "bg-[var(--color-danger)] text-white hover:bg-red-700",

    success:
      "bg-[var(--color-success)] text-white hover:bg-green-700",

    ghost:
      "bg-transparent text-[var(--color-text-secondary)] hover:bg-slate-100",
  };

  const sizes = {
    sm: "h-8 px-3 text-[var(--text-sm)] rounded-[var(--radius-sm)]",
    md: "h-10 px-4 text-[var(--text-sm)] rounded-[var(--radius-md)]",
    lg: "h-12 px-5 text-[var(--text-md)] rounded-[var(--radius-md)]",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}

      {!loading && icon && iconPosition === "left" && icon}

      {children}

      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}

export default Button;