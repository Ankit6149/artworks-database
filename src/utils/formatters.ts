export const numberFormatter = new Intl.NumberFormat("en-US");

export const formatCount = (value: number): string =>
  numberFormatter.format(value);

export const renderCellText = (value: string | number | null): string =>
  value === null || value === "" ? "-" : String(value);
