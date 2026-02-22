import { FiCheck } from "react-icons/fi";

interface SelectNPanelProps {
  isOpen: boolean;
  inputValue: string;
  totalRecords: number;
  onInputChange: (value: string) => void;
  onSelectClick: () => void;
}

export function SelectNPanel({
  isOpen,
  inputValue,
  totalRecords,
  onInputChange,
  onSelectClick,
}: SelectNPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div id="select-n-panel" className="select-n-panel">
      <label
        htmlFor="select-n-input"
        className="text-sm font-semibold text-slate-800"
      >
        Select Multiple Rows
      </label>
      <p className="text-xs text-slate-500">
        Enter number of rows to select across all pages
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
        />
        <button type="button" className="select-n-btn" onClick={onSelectClick}>
          <FiCheck size={14} />
          <span>Select</span>
        </button>
      </div>
    </div>
  );
}
