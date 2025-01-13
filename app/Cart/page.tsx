"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { RemoveCart } from "@/functions/RemoveCart";
import { Purchase } from "@/functions/Purchase";
import { ClearCart } from "@/functions/ClearCart";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { DeleteOutline } from "@mui/icons-material";
import { UpdateStock } from "@/functions/UpdateStock";
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
  count: number;
};

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

async function getItems(deviceIds: number[]) {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .in("device_id", deviceIds);

  if (error) {
    console.error("Error fetching devices:", error);
    return [];
  }
  return data;
}

export default function CartPage() {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<Device[]>([]);
  const [purchased, setPurchased] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingCart, setRemovingCart] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    async function fetchCartData() {
      if (!user?.id) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("cart")
          .eq("user_id", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user cart:", userError);
          return;
        }

        const deviceIds = userData?.cart || [];

        if (deviceIds.length === 0) {
          setCartItems([]);
          setIsLoading(false);
          return;
        }

        const devices = await getItems(deviceIds);

        const deviceCounts = deviceIds.reduce(
          (acc: { [key: number]: number }, id: number) => {
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          },
          {}
        );

        const devicesWithCount = devices.map((device: Device) => ({
          ...device,
          count: deviceCounts[device.device_id] || 0,
        }));

        setCartItems(devicesWithCount);
      } catch (error) {
        console.error("Error in fetchCartData:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCartData();
  }, [user?.id]);

  useEffect(() => {
    async function fetchPurchasedData() {
      if (!user?.id) return;

      const { data: purchasedData, error: purchasedError } = await supabase
        .from("users")
        .select("purchased")
        .eq("user_id", user.id)
        .single();

      if (purchasedError) {
        console.error("Error fetching user purchased:", purchasedError);
        return;
      }

      const deviceIds = purchasedData?.purchased || [];
      if (deviceIds.length === 0) {
        setPurchased([]);
        return;
      }

      const devices = await getItems(deviceIds);

      // Calculate counts for purchased items
      const purchasedCounts = deviceIds.reduce(
        (acc: { [key: number]: number }, id: number) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {}
      );

      const purchasedWithCount = devices.map((device: Device) => ({
        ...device,
        count: purchasedCounts[device.device_id] || 0,
      }));

      setPurchased(purchasedWithCount);
    }

    fetchPurchasedData();
  }, [user?.id]);
  const handleRemove = async (deviceId: number) => {
    if (user) {
      setRemovingCart(deviceId);
      const result = await RemoveCart(deviceId, user.id);
      setRemovingCart(null);

      if (result.success) {
        setSnackbar({
          open: true,
          message: "Item removed successfully",
          severity: "success",
        });

        setCartItems((prevItems) => {
          const itemToUpdate = prevItems.find(
            (item) => item.device_id === deviceId
          );
          if (!itemToUpdate) return prevItems;

          if (itemToUpdate.count > 1) {
            return prevItems.map((item) =>
              item.device_id === deviceId
                ? { ...item, count: item.count - 1 }
                : item
            );
          } else {
            return prevItems.filter((item) => item.device_id !== deviceId);
          }
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to remove item from cart",
          severity: "error",
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: "Please log in to remove items from cart",
        severity: "error",
      });
    }
  };

  const handlePurchase = async () => {
    if (!user?.id) return;

    setIsPurchasing(true);
    const result = await Purchase(user.id);

    if (result.success) {
      setPurchaseSuccess(true);
      UpdateStock(purchased);
      setSnackbar({
        open: true,
        message: "Purchase successful!",
        severity: "success",
      });
      // Refresh cart items
      setCartItems([]);
    } else {
      setSnackbar({
        open: true,
        message: "Purchase failed. Please try again.",
        severity: "error",
      });
    }
    setIsPurchasing(false);
  };

  const handleClearCart = async () => {
    if (!user?.id) return;

    const result = await ClearCart(user.id);

    if (result.success) {
      setCartItems([]);
      setSnackbar({
        open: true,
        message: "Cart cleared successfully",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Failed to clear cart",
        severity: "error",
      });
    }
  };

  if (!user)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh" // Optional: Center vertically on the whole page
      >
        <Typography variant="h5" align="center" color="primary">
          Please Sign in to access your Cart
        </Typography>
      </Box>
    );
  if (isLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.count,
    0
  );

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: blue[700], fontWeight: "bold" }}
      >
        Your Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Typography variant="h6">Your cart is empty</Typography>
      ) : (
        <Box>
          <Grid container spacing={4}>
            {cartItems.map((device: Device) => (
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
                    <Typography variant="h6" gutterBottom>
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

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
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
                  </CardContent>

                  <CardActions sx={{ p: 2, flexDirection: "column", gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      align="center"
                      sx={{ width: "100%" }}
                    >
                      Quantity: {device.count}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleRemove(device.device_id)}
                      disabled={removingCart === device.device_id}
                      sx={{
                        bgcolor: blue[600],
                        "&:hover": {
                          bgcolor: blue[700],
                        },
                      }}
                    >
                      {removingCart === device.device_id ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Remove from Cart"
                      )}
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: blue[700] }}>
              Order Summary
            </Typography>
            <Typography variant="h4" sx={{ mt: 2, mb: 3 }}>
              Total: ${totalAmount.toFixed(2)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handlePurchase}
                disabled={cartItems.length === 0 || isPurchasing}
                sx={{
                  bgcolor: blue[600],
                  "&:hover": {
                    bgcolor: blue[700],
                  },
                }}
              >
                {isPurchasing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : purchaseSuccess ? (
                  "Purchase Complete!"
                ) : (
                  "Purchase Items"
                )}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleClearCart}
                disabled={cartItems.length === 0 || isPurchasing}
                startIcon={<DeleteOutline />}
                sx={{
                  borderColor: blue[600],
                  color: blue[600],
                  "&:hover": {
                    borderColor: blue[700],
                    color: blue[700],
                  },
                }}
              >
                Clear Cart
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Box sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: blue[700], fontWeight: "bold" }}
        >
          Purchase History
        </Typography>
        {purchased.length === 0 && (
          <Typography variant="h6">Congratulations You're Broke</Typography>
        )}
        <Grid container spacing={4}>
          {purchased.map((device: Device) => (
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
                  <Typography variant="h6" gutterBottom>
                    {device.device_name}
                  </Typography>

                  <StyledChip
                    label={device.brand}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary" paragraph>
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
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, color: blue[700] }}
                  >
                    Purchased Quantity: {device.count}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
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
  );
}
