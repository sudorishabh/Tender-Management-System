import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";
import { Button } from "@/_components/ui/button";
import {
  ArrowUpDown,
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
  return (
    <div className='flex flex-col items-start'>
      <span className='text-[11px] text-gray-600 px-1 hidden md:block'>
        Sort by
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='hover:bg-gray-100 gap-0 px-1 py-0 h-auto text-gray-700 font-medium text-sm'>
            <span className='mr-2 hidden sm:inline text-[0.8rem]'>
              {getSortByLabel(sortBy)}
            </span>
            <span className='sm:hidden'>Sort</span>
            <ArrowUpDown className='h-4 w-4 text-gray-500' />
          </Button>
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
    </div>
  );
};

export default HomeSortSection;
