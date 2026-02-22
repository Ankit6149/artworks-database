import { FiX } from "react-icons/fi";
import { formatCount } from "../utils/formatters";

interface SelectionBarProps {
  selectedCount: number;
  onClearClick: () => void;
  isClearDisabled: boolean;
}

export function SelectionBar({
  selectedCount,
  onClearClick,
  isClearDisabled,
}: SelectionBarProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="selected-pill">
        Selected:{" "}
        <span className="selected-pill-count">
          {formatCount(selectedCount)}
        </span>{" "}
        rows
      </div>

      <div>
        <button
          type="button"
          onClick={onClearClick}
          disabled={isClearDisabled}
          className="action-btn"
          title="Clear all selections"
        >
          <FiX size={15} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
