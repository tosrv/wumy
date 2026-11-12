import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type GuestStatusFilter = "all" | "responded" | "pending";

interface GuestsFiltersProps {
  status: GuestStatusFilter;
  onStatusChange: (status: GuestStatusFilter) => void;
  counts: { all: number; responded: number; pending: number };
  search: string;
  onSearchChange: (value: string) => void;
  group: string;
  onGroupChange: (value: string) => void;
  groups: string[];
}

export function GuestsFilters({
  status,
  onStatusChange,
  counts,
  search,
  onSearchChange,
  group,
  onGroupChange,
  groups,
}: GuestsFiltersProps) {
  const tabs: { id: GuestStatusFilter; label: string; count: number; dot?: string }[] = [
    { id: "all", label: "All", count: counts.all },
    {
      id: "responded",
      label: "Responded",
      count: counts.responded,
      dot: "bg-[oklch(0.45_0.1_160)]",
    },
    {
      id: "pending",
      label: "Not Responded",
      count: counts.pending,
      dot: "bg-muted-foreground",
    },
  ];

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl bg-card p-3.5 shadow-sm lg:flex-row lg:items-center">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
        {tabs.map((tab) => {
          const active = status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.dot && !active ? <span className={cn("size-2 rounded-full", tab.dot)} /> : null}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  active
                    ? "bg-background/20 text-background"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex max-w-xl flex-1 items-center justify-end gap-2">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guests by name, tag, or slug..."
            className="h-9 rounded-xl border-0 bg-secondary/70 pl-9 pr-8 text-sm shadow-none focus-visible:bg-card focus-visible:ring-1"
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <select
          value={group}
          onChange={(e) => onGroupChange(e.target.value)}
          className="h-9 min-w-[140px] appearance-none rounded-xl bg-secondary/70 px-3 pr-8 text-xs font-semibold text-foreground focus:outline-none"
        >
          <option value="all">All Groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
