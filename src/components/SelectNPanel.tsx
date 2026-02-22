import { FiCheck } from "react-icons/fi";
import { useEffect, useRef } from "react";

interface SelectNPanelProps {
  isOpen: boolean;
  inputValue: string;
  totalRecords: number;
  onInputChange: (value: string) => void;
  onSelectClick: () => void;
  onClose: () => void;
}

export function SelectNPanel({
  isOpen,
  inputValue,
  totalRecords,
  onInputChange,
  onSelectClick,
  onClose,
}: SelectNPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (panelRef.current && target && !panelRef.current.contains(target)) {
        onClose();
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = () => {
    onSelectClick();
    onClose();
  };

  return (
    <div
      className="select-n-floating"
      ref={panelRef}
      role="dialog"
      aria-modal="false"
    >
      <div className="select-n-floating-inner">
        <div className="select-n-floating-header">
          <span className="text-sm font-semibold text-slate-800">
            Select Multiple Rows
          </span>
        </div>

        <div className="select-n-dialog-content">
          <p className="text-sm text-slate-600 mb-2">
            Enter the number of rows to select across all pages
          </p>
          <div className="select-n-controls">
            <input
              id="select-n-input"
              type="number"
              min={0}
              max={totalRecords}
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="e.g., 20"
              className="select-n-input"
              autoFocus
            />
          </div>
        </div>

        <div className="select-n-dialog-footer">
          <button
            type="button"
            className="dialog-btn dialog-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dialog-btn dialog-btn-primary"
            onClick={handleSelect}
          >
            <FiCheck size={14} />
            <span>Select</span>
          </button>
        </div>
      </div>
    </div>
  );
}
