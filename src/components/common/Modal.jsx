import { useEffect } from "react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnOverlay = true,
  layer = "base",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const layerClass =
    layer === "nested" ? "z-[200]" : "z-[100]";

  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      closeOnOverlay
    ) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 ${layerClass} flex items-center justify-center bg-slate-900/50 p-4`}
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`relative flex w-full ${
          sizes[size] || sizes.md
        } max-h-[90vh] flex-col overflow-visible rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-[var(--color-text-primary)]"
          >
            {title}
          </h2>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-xl text-[var(--color-text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--color-text-primary)]"
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="min-h-0 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--color-border)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;