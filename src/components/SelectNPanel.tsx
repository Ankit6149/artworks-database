import { FiCheck, FiX } from "react-icons/fi";

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
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSelectClick = () => {
    onSelectClick();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="select-n-dialog">
        <div className="select-n-dialog-header">
          <h2 className="select-n-dialog-title">Select Multiple Rows</h2>
          <button
            type="button"
            className="select-n-dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="select-n-dialog-content">
          <p className="text-sm text-slate-600 mb-4">
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
            onClick={handleSelectClick}
          >
            <FiCheck size={14} />
            <span>Select</span>
          </button>
        </div>
      </div>
    </div>
  );
}
