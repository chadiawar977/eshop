"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase";
import { AddToCart } from "@/functions/AddToCart";
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Container,
  Grid,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import FilterComponent from "@/components/Filter";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";

// Types remain the same
type Device = {
  device_id: number;
  category_name: string;
  device_name: string;
  description: string;
  price: number;
  stock_quantity: number;
  brand: string;
  Attributes: string[];
  Image: string;
};

type CategoryParams = {
  params: {
    slug: string;
  };
  p_min_price?: number | null;
  p_max_price?: number | null;
  p_brand?: string[] | null;
  p_device_name?: string | null;
};

// Styled components remain the same
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

async function getData(
  slug: string,
  minPrice: number | null,
  maxPrice: number | null,
  brands: string[] | null,
  searchQuery: string | null
) {
  const cat = slug.charAt(0).toUpperCase() + slug.slice(1);

  const { data, error } = await supabase.rpc("filter", {
    p_category: cat,
    p_min_price: minPrice,
    p_max_price: maxPrice,
    p_brands: brands,
    p_search: searchQuery, // Add search parameter to the RPC call
  });

  if (error) {
    throw new Error(`Error fetching devices: ${error.message}`);
  }
  return { data };
}

export default function CategoryPage({ params }: any) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [searchQuery, setSearchQuery] = useState("");
  const cat = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const { user } = useUser();

  // Fetch data when filters, category, or search changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getData(
          params.slug,
          minPrice,
          maxPrice,
          selectedBrands,
          searchQuery || null
        );
        setDevices(data || []);
        setFilteredDevices(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unexpected error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, minPrice, maxPrice, selectedBrands, searchQuery]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const handleFilterChange = (
    brands: string[],
    newMinPrice: number,
    newMaxPrice: number
  ) => {
    setSelectedBrands(brands.length > 0 ? brands : null);
    setMinPrice(newMinPrice || null);
    setMaxPrice(newMaxPrice || null);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  const handleAddToCart = async (deviceId: number) => {
    if (user) {
      setAddingToCart(deviceId);
      const result = await AddToCart(deviceId, user.id, params.slug);
      setAddingToCart(null);

      setSnackbar({
        open: true,
        message: result.success
          ? "Item added successfully"
          : "Failed to add item to cart",
        severity: result.success ? "success" : "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Please log in to add items to cart",
        severity: "error",
      });
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" color="error" gutterBottom>
          Error loading devices
        </Typography>
        <Typography>{error.message}</Typography>
      </Container>
    );
  }

  if (loading && devices.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      <FilterComponent onFilterChange={handleFilterChange} cat={cat} />
      <Container
        maxWidth={false}
        sx={{
          py: 8,
          width: "calc(100% - 200px)",
          flexGrow: 1,
        }}
      >
        <SearchBar onSearch={handleSearch} />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            textTransform: "capitalize",
            color: blue[700],
            fontWeight: "bold",
            mb: 4,
          }}
        >
          {decodeURIComponent(params.slug)} Devices
        </Typography>
        {currentItems.length === 0 ? (
          <Typography variant="h5" gutterBottom>
            No devices found with the selected filters
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {currentItems.map((device: Device) => (
              <Grid item key={device.device_id} xs={12} sm={6} md={4}>
                <StyledCard>
                  {device.Image && (
                    <CardMedia
                      component="div"
                      sx={{ pt: "56.25%", position: "relative" }}
                    >
                      <Image
                        src={device.Image}
                        alt={device.device_name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </CardMedia>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {device.device_name}
                    </Typography>
                    <StyledChip
                      label={device.brand}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {device.description}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {device.Attributes?.map((attr, index) => (
                        <StyledChip
                          key={index}
                          label={attr}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Box sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" color={blue[700]}>
                          ${device.price.toFixed(2)}
                        </Typography>
                        <Typography
                          color={
                            device.stock_quantity > 0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {device.stock_quantity > 0
                            ? `${device.stock_quantity} in stock`
                            : "Out of stock"}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleAddToCart(device.device_id)}
                        disabled={
                          device.stock_quantity === 0 ||
                          addingToCart === device.device_id
                        }
                        sx={{
                          bgcolor: blue[600],
                          "&:hover": {
                            bgcolor: blue[700],
                          },
                        }}
                      >
                        {addingToCart === device.device_id ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Add to Cart"
                        )}
                      </Button>
                    </Box>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
