import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { Search, Heart, Users, ClipboardCheck, Loader2 } from "lucide-react";
import { globalSearch } from "@/features/search/api/search-api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    donors: [] as Awaited<ReturnType<typeof globalSearch>>["donors"],
    patients: [] as Awaited<ReturnType<typeof globalSearch>>["patients"],
    checks: [] as Awaited<ReturnType<typeof globalSearch>>["checks"],
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ donors: [], patients: [], checks: [] });
    }
  }, [open]);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ donors: [], patients: [], checks: [] });
        return;
      }

      setLoading(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch (error) {
        console.error("Error during global search:", error);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-hairline bg-canvas">
        <Command className="flex flex-col w-full focus:outline-none">
          <div className="flex items-center px-4 py-3 border-b border-hairline">
            <Search className="w-5 h-5 mr-3 shrink-0 text-mute" />
            <Command.Input
              autoFocus
              placeholder="Search checks, donors, patients..."
              value={query}
              onValueChange={setQuery}
              className="flex-1 bg-transparent text-body-sm text-ink outline-none placeholder:text-mute w-full"
            />
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-mute ml-2" />
            )}
          </div>

          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            {!loading && !query && (
              <div className="py-6 text-center text-body-sm text-mute">
                Type to search the blood bank database
              </div>
            )}

            {!loading &&
              query &&
              !results.donors.length &&
              !results.patients.length &&
              !results.checks.length && (
                <div className="py-6 text-center text-body-sm text-mute">
                  No results found for "{query}"
                </div>
              )}

            {results.checks.length > 0 && (
              <Command.Group
                heading="Donation Checks"
                className="px-2 py-1.5 text-xs font-semibold text-mute"
              >
                <div className="mt-1 space-y-1">
                  {results.checks.map((check) => (
                    <Command.Item
                      key={check.id}
                      value={`check-${check.serial}-${check.id}`}
                      onSelect={() => handleSelect(`/checks/${check.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-sm text-body-sm text-ink cursor-pointer hover:bg-canvas-soft-2 focus:bg-canvas-soft-2 outline-none select-none transition-colors"
                    >
                      <ClipboardCheck className="w-4 h-4 text-mute shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium">{check.serial}</span>
                        <span className="text-caption text-mute">
                          Donor: {check.donors?.full_name ?? "Unknown"}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </div>
              </Command.Group>
            )}

            {results.donors.length > 0 && (
              <Command.Group
                heading="Donors"
                className="px-2 py-1.5 text-xs font-semibold text-mute mt-3"
              >
                <div className="mt-1 space-y-1">
                  {results.donors.map((donor) => (
                    <Command.Item
                      key={donor.id}
                      value={`donor-${donor.full_name}-${donor.id}`}
                      onSelect={() => handleSelect(`/donors/${donor.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-sm text-body-sm text-ink cursor-pointer hover:bg-canvas-soft-2 focus:bg-canvas-soft-2 outline-none select-none transition-colors"
                    >
                      <Heart className="w-4 h-4 text-mute shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium">{donor.full_name}</span>
                        <span className="text-caption text-mute">
                          National ID: {donor.national_id}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </div>
              </Command.Group>
            )}

            {results.patients.length > 0 && (
              <Command.Group
                heading="Patients"
                className="px-2 py-1.5 text-xs font-semibold text-mute mt-3"
              >
                <div className="mt-1 space-y-1">
                  {results.patients.map((patient) => (
                    <Command.Item
                      key={patient.id}
                      value={`patient-${patient.full_name}-${patient.id}`}
                      onSelect={() => handleSelect(`/patients/${patient.id}`)}
                      className="flex items-center gap-3 px-2 py-2 rounded-sm text-body-sm text-ink cursor-pointer hover:bg-canvas-soft-2 focus:bg-canvas-soft-2 outline-none select-none transition-colors"
                    >
                      <Users className="w-4 h-4 text-mute shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.full_name}</span>
                        <span className="text-caption text-mute">
                          File Number: {patient.file_number}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </div>
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
