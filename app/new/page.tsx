"use client";

import { ThemeProvider, createTheme } from "@mui/material";
import FilterComponent from "./Filter";
export default function Page() {
  const theme = createTheme();

  const handleFilterChange = (
    brands: string[],
    minPrice: number,
    maxPrice: number
  ) => {
    console.log("Selected brands:", brands);
    console.log("Price range:", minPrice, "to", maxPrice);
    // Handle the filter changes here
  };

  return (
    <ThemeProvider theme={theme}>
      <FilterComponent onFilterChange={handleFilterChange} cat ='Laptops' />
    </ThemeProvider>
  );
}
