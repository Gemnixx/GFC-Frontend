function Loader({
  size = "md",
  text = "",
  fullScreen = false,
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
  };

  const loader = (
    <div className="flex items-center justify-center gap-2">
      <span
        className={`animate-spin rounded-full border-[var(--color-border)] border-t-[var(--color-primary)] ${sizes[size]}`}
        aria-hidden="true"
      />

      {text && (
        <span className="text-sm text-[var(--color-text-muted)]">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        {loader}
      </div>
    );
  }

  return loader;
}

export default Loader;