function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variants = {
    default:
      "bg-slate-100 text-slate-700",

    success:
      "bg-[var(--color-success-light)] text-[var(--color-success)]",

    danger:
      "bg-[var(--color-danger-light)] text-[var(--color-danger)]",

    warning:
      "bg-[var(--color-warning-light)] text-[var(--color-warning)]",

    info:
      "bg-[var(--color-info-light)] text-[var(--color-info)]",

    primary:
      "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;