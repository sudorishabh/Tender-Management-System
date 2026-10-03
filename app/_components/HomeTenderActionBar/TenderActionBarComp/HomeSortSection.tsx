import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenderContext } from "@/context/TenderContext";

const getSortByLabel = (value: string) => {
  switch (value) {
    case "deadline-soon":
      return "Deadline Soon";
    case "budget-high":
      return "Fee + EMD (High to Low)";
    case "budget-low":
      return "Fee + EMD (Low to High)";
    case "oldest":
      return "Oldest First";
    case "latest":
    default:
      return "Latest First";
  }
};

const HomeSortSection = ({ sortBy }: { sortBy: string }) => {
  const { setHomeTenderSortBy } = useTenderContext();
  const isCustomSort = Boolean(sortBy) && sortBy !== "latest";

  return (
    <DropdownMenu>
      {/* Plain text on the tabs row, sized like a tab so the labels line up.
          A sort other than the default is picked out in the brand colour */}
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          className='-mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-transparent pb-2 text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'>
          <ArrowUpDown
            className='size-3.5 text-primary'
            aria-hidden='true'
          />
          <span className='hidden sm:inline'>
            Sort:{" "}
            <span
              className={cn(
                "font-medium",
                isCustomSort ? "text-primary" : "text-slate-900"
              )}>
              {getSortByLabel(sortBy)}
            </span>
          </span>
          <span className={cn("sm:hidden", isCustomSort && "text-primary")}>
            Sort
          </span>
          <ChevronDown
            className='size-3.5 text-slate-400'
            aria-hidden='true'
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-56 border-gray-300 shadow-lg z-[700] rounded-lg'>
        <DropdownMenuLabel className='text-gray-600 font-medium'>
          Sort Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-3 cursor-pointer py-3",
            (sortBy === "" || sortBy === "latest") &&
              "text-primary bg-primary/5"
          )}
          onClick={() => setHomeTenderSortBy("latest")}>
          <Calendar
            className={cn(
              "h-4 w-4",
              sortBy === "" || sortBy === "latest"
                ? "text-primary"
                : "text-gray-400"
            )}
          />
          <div>
            <div className='font-medium'>Latest First</div>
            <div className='text-xs text-gray-500'>
              Most recently published tenders
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-3 cursor-pointer py-3",
            sortBy === "deadline-soon" && "text-primary bg-primary/5"
          )}
          onClick={() => setHomeTenderSortBy("deadline-soon")}>
          <Clock
            className={cn(
              "h-4 w-4",
              sortBy === "deadline-soon" ? "text-primary" : "text-gray-400"
            )}
          />
          <div>
            <div className='font-medium'>Deadline Soon</div>
            <div className='text-xs text-gray-500'>
              Urgently expiring tenders first
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-3 cursor-pointer py-3",
            sortBy === "budget-high" && "text-primary bg-primary/5"
          )}
          onClick={() => setHomeTenderSortBy("budget-high")}>
          <TrendingUp
            className={cn(
              "h-4 w-4",
              sortBy === "budget-high" ? "text-primary" : "text-gray-400"
            )}
          />
          <div>
            <div className='font-medium'>Fee + EMD (High to Low)</div>
            <div className='text-xs text-gray-500'>
              Highest document fee + EMD first
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-3 cursor-pointer py-3",
            sortBy === "budget-low" && "text-primary bg-primary/5"
          )}
          onClick={() => setHomeTenderSortBy("budget-low")}>
          <TrendingDown
            className={cn(
              "h-4 w-4",
              sortBy === "budget-low" ? "text-primary" : "text-gray-400"
            )}
          />
          <div>
            <div className='font-medium'>Fee + EMD (Low to High)</div>
            <div className='text-xs text-gray-500'>
              Lowest document fee + EMD first
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "flex items-center gap-3 cursor-pointer py-3",
            sortBy === "oldest" && "text-primary bg-primary/5"
          )}
          onClick={() => setHomeTenderSortBy("oldest")}>
          <History
            className={cn(
              "h-4 w-4",
              sortBy === "oldest" ? "text-primary" : "text-gray-400"
            )}
          />
          <div>
            <div className='font-medium'>Oldest First</div>
            <div className='text-xs text-gray-500'>
              Earliest published tenders
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HomeSortSection;
