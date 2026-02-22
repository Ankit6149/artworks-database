import { FiChevronDown } from "react-icons/fi";

interface TableToolbarProps {
  isSelectPanelOpen: boolean;
  onToggleSelectPanel: () => void;
  isCurrentPageFullySelected: boolean;
  onToggleSelectPage: () => void;
  isSelectPageDisabled: boolean;
}

export function TableToolbar({
  isSelectPanelOpen,
  onToggleSelectPanel,
  isCurrentPageFullySelected,
  onToggleSelectPage,
  isSelectPageDisabled,
}: TableToolbarProps) {
  return (
    <div className="artworks-table-toolbar">
      <button
        type="button"
        className="selection-header-trigger"
        aria-expanded={isSelectPanelOpen}
        aria-controls="select-n-panel"
        onClick={onToggleSelectPanel}
      >
        <FiChevronDown size={16} />
      </button>
      <button
        type="button"
        className="action-btn"
        onClick={onToggleSelectPage}
        disabled={isSelectPageDisabled}
      >
        {isCurrentPageFullySelected ? "Unselect page" : "Select page"}
      </button>
    </div>
  );
}
