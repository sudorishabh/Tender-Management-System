"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface TenderAdminFilter {
  searchQuery: string;
  department: string;
}

/** Which tenders the home list shows, by whether bidding is still open */
export type TenderAvailability = "open" | "closed" | "all";

interface TenderHomeFilter {
  availability: TenderAvailability;
  search: string;
  department: string;
  location: string;
  budgetRange: string;
  publishDate: string;
  status: string;
  sortBy: string;
}

interface Pagination {
  currentPage: number;
}

interface HomePagination {
  latestPage: number;
}

interface TenderContextType {
  tenderAdminFilter: TenderAdminFilter;
  tenderHomeFilter: TenderHomeFilter;
  pagination: Pagination;
  homePagination: HomePagination;
  setManageTenderSearchQuery: (query: string) => void;
  setTenderDepartmentAdmin: (department: string) => void;
  setHomeTenderAvailability: (availability: TenderAvailability) => void;
  setHomeTenderSearch: (search: string) => void;
  setHomeTenderDepartment: (department: string) => void;
  setHomeTenderLocation: (location: string) => void;
  setHomeTenderBudgetRange: (range: string) => void;
  setHomeTenderPublishDate: (date: string) => void;
  setHomeTenderStatus: (status: string) => void;
  setHomeTenderSortBy: (sortBy: string) => void;
  resetTenderFilterOptions: () => void;
  resetHomeTenderFilterOptions: () => void;
  setCurrentPage: (page: number) => void;
  resetPagination: () => void;
  setLatestPage: (page: number) => void;
  resetLatestPage: () => void;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export const useTenderContext = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error("useTenderContext must be used within TenderProvider");
  }
  return context;
};

export const TenderProvider = ({ children }: { children: ReactNode }) => {
  const [tenderAdminFilter, setTenderAdminFilter] = useState<TenderAdminFilter>(
    {
      searchQuery: "",
      department: "",
    }
  );

  const [tenderHomeFilter, setTenderHomeFilter] = useState<TenderHomeFilter>({
    availability: "open",
    search: "",
    department: "",
    location: "",
    budgetRange: "",
    publishDate: "",
    status: "",
    sortBy: "",
  });

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
  });

  const [homePagination, setHomePagination] = useState<HomePagination>({
    latestPage: 1,
  });

  const setManageTenderSearchQuery = useCallback((query: string) => {
    setTenderAdminFilter((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setTenderDepartmentAdmin = useCallback((department: string) => {
    setTenderAdminFilter((prev) => ({ ...prev, department }));
  }, []);

  const setHomeTenderAvailability = useCallback(
    (availability: TenderAvailability) => {
      setTenderHomeFilter((prev) => ({ ...prev, availability }));
    },
    []
  );

  const setHomeTenderSearch = useCallback((search: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, search }));
  }, []);

  const setHomeTenderDepartment = useCallback((department: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, department }));
  }, []);

  const setHomeTenderLocation = useCallback((location: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, location }));
  }, []);

  const setHomeTenderBudgetRange = useCallback((range: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, budgetRange: range }));
  }, []);

  const setHomeTenderPublishDate = useCallback((date: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, publishDate: date }));
  }, []);

  const setHomeTenderStatus = useCallback((status: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, status }));
  }, []);

  const setHomeTenderSortBy = useCallback((sortBy: string) => {
    setTenderHomeFilter((prev) => ({ ...prev, sortBy }));
  }, []);

  const resetTenderFilterOptions = useCallback(() => {
    setTenderAdminFilter({
      searchQuery: "",
      department: "",
    });
  }, []);

  // Keeps the open/closed tab - it is a view of the list, not a filter
  const resetHomeTenderFilterOptions = useCallback(() => {
    setTenderHomeFilter((prev) => ({
      availability: prev.availability,
      search: "",
      department: "",
      location: "",
      budgetRange: "",
      publishDate: "",
      status: "",
      sortBy: "",
    }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setPagination({ currentPage: page });
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({ currentPage: 1 });
  }, []);

  const setLatestPage = useCallback((page: number) => {
    setHomePagination((prev) => ({ ...prev, latestPage: page }));
  }, []);

  const resetLatestPage = useCallback(() => {
    setHomePagination((prev) => ({ ...prev, latestPage: 1 }));
  }, []);

  const value = {
    tenderAdminFilter,
    tenderHomeFilter,
    pagination,
    homePagination,
    setManageTenderSearchQuery,
    setTenderDepartmentAdmin,
    setHomeTenderAvailability,
    setHomeTenderSearch,
    setHomeTenderDepartment,
    setHomeTenderLocation,
    setHomeTenderBudgetRange,
    setHomeTenderPublishDate,
    setHomeTenderStatus,
    setHomeTenderSortBy,
    resetTenderFilterOptions,
    resetHomeTenderFilterOptions,
    setCurrentPage,
    resetPagination,
    setLatestPage,
    resetLatestPage,
  };

  return (
    <TenderContext.Provider value={value}>{children}</TenderContext.Provider>
  );
};
