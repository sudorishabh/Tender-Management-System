"use client";
import React from "react";
import { trpc } from "@/lib/trpc";

/**
 * Browser autocomplete for a location input, filled with the locations of
 * published tenders. Typing stays free-form, so a partial "Delhi" still
 * matches every Delhi address.
 */
const LocationSuggestions = ({ id }: { id: string }) => {
  const { data } = trpc.tender.getHomeLocations.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });

  return (
    <datalist id={id}>
      {data?.locations.map((location) => (
        <option
          key={location}
          value={location}
        />
      ))}
    </datalist>
  );
};

export default LocationSuggestions;
