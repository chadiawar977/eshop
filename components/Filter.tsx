"use client";

import { useState, useEffect } from "react";
import {
  Checkbox,
  TextField,
  Slider,
  Button,
  Typography,
  InputAdornment,
  Box,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { supabase } from "@/utils/supabase";
interface Brand {
  brand: string;
  count: number;
}

interface FilterComponentProps {
  cat: any;
  onFilterChange: (
    brands: string[],
    minPrice: number,
    maxPrice: number
  ) => void;
}
async function getBrandCounts(cat: any): Promise<Brand[] | null> {
  try {
    // Fetch distinct brand names and their counts
    const { data, error } = await supabase.rpc("get_brand_count", {
      category_name_input: cat,
    });

    if (error) {
      throw error;
    }
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching brand counts:", error);
    return null;
  }
}
async function getRange(cat: any) {
  const { data, error } = await supabase.rpc("get_category_price_range", {
    p_category_name: cat,
  });
  return data;
}
export default function FilterComponent({
  onFilterChange,
  cat,
}: FilterComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [minP, setmin] = useState(0);
  const [maxP, setmax] = useState(9999);
  useEffect(() => {
    async function fetchRange() {
      const result = await getRange(cat);
      setmin(result[0].min_price);
      setmax(result[0].max_price);
    }
    fetchRange();
  }, [cat]);
  const [minPrice, setMinPrice] = useState(minP);
  const [maxPrice, setMaxPrice] = useState(maxP);
  useEffect(() => {
    async function fetchBrands() {
      const brandCounts = await getBrandCounts(cat);
      if (brandCounts) {
        setBrands(brandCounts);
      }
    }
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleBrands = showAll ? filteredBrands : filteredBrands.slice(0, 7);

  useEffect(() => {
    onFilterChange(selectedBrands, minPrice, maxPrice);
  }, [selectedBrands, minPrice, maxPrice, onFilterChange]);

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandName)) {
        return prev.filter((b) => b !== brandName);
      }
      return [...prev, brandName];
    });
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setMinPrice(newValue[0]);
      setMaxPrice(newValue[1]);
    }
  };

  const handleGoClick = () => {
    onFilterChange(selectedBrands, minPrice, maxPrice);
  };

  return (
    <Box sx={{ maxWidth: 360, paddingTop: 15, paddingLeft: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Brand
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search brand"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {visibleBrands.map((brand) => (
            <FormControlLabel
              key={brand.brand}
              control={
                <Checkbox
                  checked={selectedBrands.includes(brand.brand)}
                  onChange={() => handleBrandToggle(brand.brand)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  {brand.brand} ({brand.count})
                </Typography>
              }
            />
          ))}
        </Box>
        {filteredBrands.length > 7 && (
          <Button
            onClick={() => setShowAll(!showAll)}
            sx={{ p: 0, minWidth: "auto", textTransform: "none" }}
          >
            {showAll ? "Show less" : "Show more"}
          </Button>
        )}
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Price range
        </Typography>
        <Slider
          value={[minPrice, maxPrice]}
          onChange={handlePriceChange}
          min={minP}
          max={maxP}
          valueLabelDisplay="auto"
          sx={{ mt: 2, mb: 4 }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            type="number"
            size="small"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            sx={{ width: 80 }}
          />
          <Typography>to</Typography>
          <TextField
            type="number"
            size="small"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            sx={{ width: 80 }}
          />
          <Button variant="contained" size="small" onClick={handleGoClick}>
            Go
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
