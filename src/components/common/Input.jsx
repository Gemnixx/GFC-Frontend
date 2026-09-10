function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helperText = "",
  required = false,
  disabled = false,
  icon = null,
  rightElement = null,
  className = "",
  ...props
}) {
  const hasLeftIcon = Boolean(icon);
  const hasRightElement = Boolean(rightElement);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-danger)]">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error || helperText ? `${name}-message` : undefined
          }
          className={`
            h-10 w-full rounded-[var(--radius-md)]
            border bg-[var(--color-surface)]
            text-[var(--text-sm)] text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            outline-none transition-colors duration-200
            ${
              hasLeftIcon ? "pl-10" : "pl-3"
            }
            ${
              hasRightElement ? "pr-10" : "pr-3"
            }
            ${
              error
                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-red-100"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            }
            disabled:cursor-not-allowed
            disabled:bg-slate-50
            disabled:text-[var(--color-text-muted)]
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          id={`${name}-message`}
          className={`mt-1 text-[var(--text-xs)] ${
            error
              ? "text-[var(--color-danger)]"
              : "text-[var(--color-text-muted)]"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

export default Input;