import React, { useEffect, useState } from "react";
import {
  Dialog,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/nextjs";
import { AddToCart } from "@/functions/AddToCart";
import { blue } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { useNumber } from "@/app/context/CartContext";
import CloseIcon from "@mui/icons-material/Close";

interface Device {
  device_id: number;
  category_name: string;
  device_name: string;
  description: string;
  price: number;
  stock_quantity: number;
  brand: string;
  Attributes: string[];
  Image: string;
}

interface DeviceModalProps {
  open: boolean;
  onClose: () => void;
  device_id: any;
}

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

export default function DeviceModal({
  open,
  onClose,
  device_id,
}: DeviceModalProps) {
  const { user } = useUser();
  const [device, setDevice] = useState<Device>();
  const { number, setNumber } = useNumber();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleAddToCart = async (deviceId: number) => {
    if (user) {
      setAddingToCart(deviceId);
      try {
        const result = await AddToCart(deviceId, user.id, "/");

        const { data: cartData, error: cartError } = await supabase
          .from("users")
          .select("cart")
          .eq("user_id", user?.id)
          .single();

        if (cartError) {
          console.error(cartError);
        } else {
          const num = cartData?.cart.length;
          setNumber(num);
        }

        setSnackbar({
          open: true,
          message: result.success
            ? "Item added successfully"
            : "Failed to add item to cart",
          severity: result.success ? "success" : "error",
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to add item to cart",
          severity: "error",
        });
      } finally {
        setAddingToCart(null);
      }
    } else {
      setSnackbar({
        open: true,
        message: "Please log in to add items to cart",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchDevice = async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("device_id", device_id)
        .single();
      if (data) {
        setDevice(data);
      } else if (error) {
        console.error("Error fetching device:", error);
      }
    };

    if (device_id) {
      fetchDevice();
    }
  }, [device_id]);

  if (!device) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <StyledDialogTitle>
          <Typography variant="h6" component="h2">
            {device.device_name}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
          >
            {/* Image Section */}
            <Box
              sx={{
                flex: "0 0 50%",
                position: "relative",
                height: { xs: 300, md: 400 },
              }}
            >
              <Image
                src={device.Image}
                alt={device.device_name}
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </Box>

            {/* Content Section */}
            <Box sx={{ flex: "1", p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <StyledChip
                  label={device.brand}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <Typography variant="h6" color={blue[700]} gutterBottom>
                  ${device.price.toFixed(2)}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color={
                    device.stock_quantity > 0 ? "success.main" : "error.main"
                  }
                  gutterBottom
                >
                  {device.stock_quantity > 0
                    ? `${device.stock_quantity} in stock`
                    : "Out of stock"}
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {device.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Features:
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
                  py: 1.5,
                }}
              >
                {addingToCart === device.device_id ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </>
  );
}
