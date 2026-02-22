import { useState } from "react";

interface UseSelectNPanelReturn {
  isSelectPanelOpen: boolean;
  selectCountInput: string;
  setIsSelectPanelOpen: (open: boolean) => void;
  setSelectCountInput: (value: string) => void;
  resetPanel: () => void;
}

export function useSelectNPanel(): UseSelectNPanelReturn {
  const [isSelectPanelOpen, setIsSelectPanelOpen] = useState(false);
  const [selectCountInput, setSelectCountInput] = useState("");

  function resetPanel(): void {
    setSelectCountInput("");
    setIsSelectPanelOpen(false);
  }

  return {
    isSelectPanelOpen,
    selectCountInput,
    setIsSelectPanelOpen,
    setSelectCountInput,
    resetPanel,
  };
}
