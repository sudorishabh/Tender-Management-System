import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/_components/ui/select";
import { Card, CardContent } from "@/_components/ui/card";
import { Label } from "@/_components/ui/label";
import { Input } from "@/_components/ui/input";
import { IndianRupee, Building2, MapPin } from "lucide-react";
import { useTenderContext } from "@/context/TenderContext";
import { Button } from "@/_components/ui/button";
import { cn } from "@/lib/utils";
import { primaryButtonStyle } from "@/app/styles";
import { trpc } from "@/lib/trpc";

const HomeMobileFilterPanel = ({
  department,
  location,
  budgetRange,
  // sortBy,
  clearAllFilters,
  setIsMobileFiltersOpen,
}: {
  department: string;
  location: string;
  budgetRange: string;
  sortBy: string;
  clearAllFilters: () => void;
  setIsMobileFiltersOpen: (value: boolean) => void;
}) => {
  const {
    setHomeTenderDepartment,
    setHomeTenderLocation,
    setHomeTenderBudgetRange,
    // setHomeTenderSortBy,
  } = useTenderContext();

  // Fetch departments from database
  const { data: departmentData } = trpc.department.getAll.useQuery();
  const departments = departmentData?.data ?? [];

  return (
    <Card className='lg:hidden'>
      <CardContent className='p-4 space-y-4'>
        {/* Sort By Filter */}
        {/* <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <ArrowUpDown className='size-3' />
            <p className='!text-xs'>Sort By</p>
          </Label>
          <Select
            onValueChange={(value) => setHomeTenderSortBy(value)}
            value={sortBy || "latest"}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select sorting' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Options</SelectLabel>
                <SelectItem value='latest'>Latest First</SelectItem>
                <SelectItem value='deadline-soon'>Deadline Soon</SelectItem>
                <SelectItem value='budget-high'>
                  Fee + EMD (High to Low)
                </SelectItem>
                <SelectItem value='budget-low'>Fee + EMD (Low to High)</SelectItem>
                <SelectItem value='oldest'>Oldest First</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}

        {/* Department Filter */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <Building2 className='size-3' />
            <p className='!text-xs'>Department</p>
          </Label>
          <Select
            onValueChange={(value) => setHomeTenderDepartment(value)}
            value={department}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select department' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Department</SelectLabel>
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
        </div>

        {/* Fee + EMD range filter */}
        <div className='space-y-2 '>
          <Label className='  flex items-center gap-2'>
            <IndianRupee className='size-3' />
            <p className='!text-xs'>Document fee + EMD</p>
          </Label>
          <Select
            onValueChange={(value) => setHomeTenderBudgetRange(value)}
            value={budgetRange}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select fee + EMD range' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='low'>Under ₹10 Lakhs</SelectItem>
              <SelectItem value='mid'>₹10 - 50 Lakhs</SelectItem>
              <SelectItem value='high'>Above ₹50 Lakhs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <MapPin className='size-3' />
            <p className='!text-xs'>Location</p>
          </Label>
          <Input
            placeholder='Enter location...'
            value={location}
            onChange={(e) => setHomeTenderLocation(e.target.value)}
          />
        </div>

        {/* Mobile Filter Actions */}
        <div className='flex gap-2 pt-2'>
          <Button
            onClick={() => setIsMobileFiltersOpen(false)}
            className={cn(primaryButtonStyle, "flex-1")}>
            Apply
          </Button>
          <Button
            variant='outline'
            onClick={clearAllFilters}
            className='flex-1'>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeMobileFilterPanel;
