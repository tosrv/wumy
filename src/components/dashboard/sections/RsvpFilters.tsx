import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { fieldClass, selectFieldClass } from "@/components/ui/field-styles";

export type RsvpStatusFilter = "all" | "attending" | "pending" | "declined";
export type RsvpSort = "newest" | "oldest" | "pax-high" | "pax-low";

interface RsvpFiltersProps {
  status: RsvpStatusFilter;
  onStatusChange: (status: RsvpStatusFilter) => void;
  counts: {
    all: number;
    attending: number;
    pending: number;
    declined: number;
  };
  search: string;
  onSearchChange: (value: string) => void;
  circle: string;
  onCircleChange: (value: string) => void;
  circles: string[];
  sort: RsvpSort;
  onSortChange: (value: RsvpSort) => void;
}

export function RsvpFilters({
  status,
  onStatusChange,
  counts,
  search,
  onSearchChange,
  circle,
  onCircleChange,
  circles,
  sort,
  onSortChange,
}: RsvpFiltersProps) {
  const tabs: {
    id: RsvpStatusFilter;
    label: string;
    count: number;
    dot?: string;
  }[] = [
    { id: "all", label: "All", count: counts.all },
    {
      id: "attending",
      label: "Attending",
      count: counts.attending,
      dot: "bg-accent",
    },
    {
      id: "pending",
      label: "Awaiting Reply",
      count: counts.pending,
      dot: "bg-foreground",
    },
    {
      id: "declined",
      label: "Declined",
      count: counts.declined,
      dot: "bg-muted-foreground",
    },
  ];

  return (
    <div className="mb-1 flex flex-col justify-between gap-4 rounded-xl bg-card p-3.5 shadow-sm lg:flex-row lg:items-center">
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

      <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap">
        <div className="relative min-w-[12rem] flex-1 sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or message..."
            className={cn(fieldClass, "h-10 pl-9")}
          />
        </div>
        <select
          value={circle}
          onChange={(e) => onCircleChange(e.target.value)}
          className={cn(selectFieldClass, "h-10 w-auto appearance-none pr-8")}
        >
          <option value="all">All Groups</option>
          {circles.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as RsvpSort)}
          className={cn(selectFieldClass, "h-10 w-auto appearance-none pr-8")}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="pax-high">Party size: High to Low</option>
          <option value="pax-low">Party size: Low to High</option>
        </select>
      </div>
    </div>
  );
}
