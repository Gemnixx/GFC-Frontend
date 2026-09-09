function Card({
  children,
  title,
  description,
  headerAction,
  padding = true,
  className = "",
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] ${className}`}
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {title}
              </h3>
            )}

            {description && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
          </div>

          {headerAction && (
            <div className="shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className={padding ? "p-5" : ""}>{children}</div>
    </div>
  );
}

export default Card;