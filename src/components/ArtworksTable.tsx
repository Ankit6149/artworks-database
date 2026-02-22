import type { Artwork } from "../types/artwork";
import { renderCellText } from "../utils/formatters";

interface ArtworksTableProps {
  artworks: Artwork[];
  loading: boolean;
  isCurrentPageFullySelected: boolean;
  pageSelection: Artwork[];
  onToggleSelectPage: () => void;
  onSelectionChange: (nextSelection: Artwork[]) => void;
}

export function ArtworksTable({
  artworks,
  loading,
  isCurrentPageFullySelected,
  pageSelection,
  onToggleSelectPage,
  onSelectionChange,
}: ArtworksTableProps) {
  const pageSelectionIds = new Set(pageSelection.map((row) => row.id));

  return (
    <div className="artworks-table-scroll">
      <table className="artworks-table" aria-label="Artworks data table">
        <thead>
          <tr>
            <th className="checkbox-column">
              <input
                type="checkbox"
                aria-label="Select all rows on this page"
                checked={isCurrentPageFullySelected}
                onChange={onToggleSelectPage}
                disabled={artworks.length === 0}
              />
            </th>
            <th>Title</th>
            <th>Place Of Origin</th>
            <th>Artist Display</th>
            <th>Inscriptions</th>
            <th>Date Start</th>
            <th>Date End</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={7} className="status-cell">
                Loading artworks...
              </td>
            </tr>
          )}
          {!loading && artworks.length === 0 && (
            <tr>
              <td colSpan={7} className="status-cell">
                No artworks found.
              </td>
            </tr>
          )}
          {!loading &&
            artworks.map((row) => {
              const rowSelected = pageSelectionIds.has(row.id);

              return (
                <tr key={row.id} className={rowSelected ? "row-selected" : ""}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      aria-label={`Select row ${row.id}`}
                      checked={rowSelected}
                      onChange={() => {
                        const nextSelection = rowSelected
                          ? pageSelection.filter(
                              (selectedRow) => selectedRow.id !== row.id,
                            )
                          : [...pageSelection, row];
                        onSelectionChange(nextSelection);
                      }}
                    />
                  </td>
                  <td>{renderCellText(row.title)}</td>
                  <td>{renderCellText(row.place_of_origin)}</td>
                  <td>{renderCellText(row.artist_display)}</td>
                  <td>{renderCellText(row.inscriptions)}</td>
                  <td>{renderCellText(row.date_start)}</td>
                  <td>{renderCellText(row.date_end)}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
