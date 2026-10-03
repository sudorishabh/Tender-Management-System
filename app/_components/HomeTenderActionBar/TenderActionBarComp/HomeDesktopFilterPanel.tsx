import React from "react";
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

  // Fetch departments from database
  const { data: departmentData } = trpc.department.getAll.useQuery();
  const departments = departmentData?.data ?? [];

  return (
    <div className='hidden lg:flex flex-wrap gap-3 items-center'>
      {/* Department Filter */}
      <div className='relative'>
        <Select
          onValueChange={(value) => setHomeTenderDepartment(value)}
          value={department}>
          <SelectTrigger
            className={cn(
              "min-w-[160px] px-2 bg-white !py-[6px] !h-8 border-gray-300 hover:border-primary/50 transition-colors",
              department && "border-primary bg-primary/5"
            )}>
            <div className='flex text-[0.8rem] items-center gap-2'>
              <Building2 className='size-3.5 text-primary' />
              <SelectValue placeholder='Department' />
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
      </div>

      {/* Location Input */}
      <div className='relative'>
        <div className='relative'>
          <MapPin className='absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-primary' />
          <Input
            placeholder='Location...'
            value={location}
            onChange={(e) => setHomeTenderLocation(e.target.value)}
            className={cn(
              "pl-8 pr-2 bg-white !py-[6px] !h-8 border-gray-300 hover:border-primary/50 transition-colors text-[0.8rem] min-w-[140px]",
              location && "border-primary bg-primary/5"
            )}
          />
        </div>
      </div>

      {/* Fee + EMD range filter */}
      <div className='relative'>
        <Select
          onValueChange={(value) => setHomeTenderBudgetRange(value)}
          value={budgetRange}>
          <SelectTrigger
            className={cn(
              "min-w-[160px] px-2 bg-white !py-[6px] !h-8 border-gray-300 hover:border-primary/50 transition-colors",
              budgetRange && "border-primary bg-primary/5"
            )}>
            <div className='flex text-[0.8rem] items-center gap-2'>
              <IndianRupee className='size-3.5 text-primary' />
              <SelectValue placeholder='Fee + EMD' />
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
    </div>
  );
};

export default HomeDesktopFilterPanel;
