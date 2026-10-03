import React, { FC } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenderContext } from "@/context/TenderContext";
import { inputStyle } from "@/app/styles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const LiveTendersFilterBar: FC = () => {
  const {
    tenderAdminFilter: { searchQuery, department },
    setManageTenderSearchQuery,
    setTenderDepartmentAdmin,
    resetTenderFilterOptions,
  } = useTenderContext();

  const { data } = trpc.department.getAll.useQuery();

  const departments = Array.isArray(data?.data)
    ? data.data.map((dept: { division_name: string }) => ({
      label: dept.division_name,
      value: String(dept.division_name),
    }))
    : [];

  function handleResetNav() {
    resetTenderFilterOptions();
  }

  return (
    <div className='sticky bg-canvas top-14 z-[1] justify-center flex items-center py-3'>
      <div className='flex gap-4 items-center w-full'>
        <div className='flex items-center w-[30rem]'>
          <label
            htmlFor='search'
            className='rounded-lg flex w-full items-center bg-white'>
            <div className='relative w-full sm:w-auto sm:flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-700' />
              <Input
                id='search'
                className={inputStyle}
                style={{ paddingLeft: "2rem" }}
                value={searchQuery}
                onChange={(e) => setManageTenderSearchQuery(e.target.value)}
                placeholder='Search tenders by Title, Location, Department, etc.'
              />
            </div>
          </label>
        </div>

        <div>
          <Select
            value={department}
            onValueChange={(value) => setTenderDepartmentAdmin(value)}>
            <SelectTrigger
              id='department'
              className={cn(inputStyle, "w-44")}>
              <SelectValue placeholder='Select Department' />
            </SelectTrigger>
            <SelectContent align='center'>
              {departments.map((department) => (
                <SelectItem
                  key={department.value}
                  value={department.value}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant='outline'
          className='py-1.5 px-3 bg-red-50 border-0 rounded-md text-xs text-red-800 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary focus:border-primary'
          onClick={handleResetNav}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default LiveTendersFilterBar;
