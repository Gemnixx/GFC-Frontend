function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <div className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">
          {breadcrumb}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;