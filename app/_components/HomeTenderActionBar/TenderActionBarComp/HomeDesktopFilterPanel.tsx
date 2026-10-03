import React, { useId } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { IndianRupee, Building2, MapPin } from "lucide-react";
import { useTenderContext } from "@/context/TenderContext";
import { cn } from "@/lib/utils";
import { Input } from "@/_components/ui/input";
import { trpc } from "@/lib/trpc";
import LocationSuggestions from "./LocationSuggestions";

// One height, border, text size and focus ring for every filter, so the row
// lines up. Fixed widths keep it steady as values change; long ones truncate
const controlStyle =
  "h-9 rounded-lg border-slate-300 bg-white text-sm text-slate-900 shadow-sm transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20";
const activeControlStyle = "border-primary bg-primary/5";
const selectTriggerStyle = "gap-2 px-3 data-[placeholder]:text-slate-500";

const HomeDesktopFilterPanel = ({
  department,
  location,
  budgetRange,
}: {
  department: string;
  location: string;
  budgetRange: string;
}) => {
  const {
    setHomeTenderDepartment,
    setHomeTenderLocation,
    setHomeTenderBudgetRange,
  } = useTenderContext();

  const locationListId = useId();

  // Fetch departments from database
  const { data: departmentData } = trpc.department.getAll.useQuery();
  const departments = departmentData?.data ?? [];

  return (
    <div className='hidden lg:flex flex-wrap items-center gap-2'>
      {/* Department Filter */}
      <Select
        onValueChange={(value) => setHomeTenderDepartment(value)}
        value={department}>
        <SelectTrigger
          className={cn(
            controlStyle,
            selectTriggerStyle,
            "w-52",
            department && activeControlStyle
          )}>
          <div className='flex min-w-0 items-center gap-2'>
            <Building2
              className='size-4 shrink-0 text-primary'
              aria-hidden='true'
            />
            <span className='min-w-0 truncate'>
              <SelectValue placeholder='Department' />
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className='z-[700]'>
          <SelectGroup>
            <SelectLabel className='text-gray-600 font-medium'>
              Department
            </SelectLabel>
            {departments.map((dept) => (
              <SelectItem
                key={dept.department_id}
                value={dept.division_name}>
                {dept.division_name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Location Input */}
      <div className='relative w-44'>
        <MapPin
          className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary'
          aria-hidden='true'
        />
        <Input
          placeholder='Location'
          aria-label='Location'
          list={locationListId}
          value={location}
          onChange={(e) => setHomeTenderLocation(e.target.value)}
          className={cn(
            controlStyle,
            "pl-9 pr-3 placeholder:text-slate-500",
            location && activeControlStyle
          )}
        />
        <LocationSuggestions id={locationListId} />
      </div>

      {/* Fee + EMD range filter */}
      <Select
        onValueChange={(value) => setHomeTenderBudgetRange(value)}
        value={budgetRange}>
        <SelectTrigger
          className={cn(
            controlStyle,
            selectTriggerStyle,
            "w-48",
            budgetRange && activeControlStyle
          )}>
          <div className='flex min-w-0 items-center gap-2'>
            <IndianRupee
              className='size-4 shrink-0 text-primary'
              aria-hidden='true'
            />
            <span className='min-w-0 truncate'>
              <SelectValue placeholder='Fee + EMD' />
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className='z-[700]'>
          <SelectGroup>
            <SelectLabel className='text-gray-600 font-medium'>
              Document Fee + EMD
            </SelectLabel>
            <SelectItem value='low'>Under ₹10 Lakhs</SelectItem>
            <SelectItem value='mid'>₹10 - 50 Lakhs</SelectItem>
            <SelectItem value='high'>Above ₹50 Lakhs</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default HomeDesktopFilterPanel;
