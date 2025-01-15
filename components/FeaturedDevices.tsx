import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import DeviceModal from "./DeviceModal";

const FeaturedDevices = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const slidesToShow = 4;
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedDevices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("devices")
          .select("*")
          .gt("stock_quantity", 0)
          .order("stock_quantity", { ascending: false })
          .limit(10);

        if (error) throw error;
        setDevices(data || []);
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDevices();
  }, []);

  const nextSlide = () => {
    setStartIndex((startIndex + slidesToShow) % devices.length);
  };

  const prevSlide = () => {
    setStartIndex(
      (startIndex - slidesToShow + devices.length) % devices.length
    );
  };

  const handleOpenModal = (device: any) => {
    setSelectedDevice(device);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDevice(null);
  };

  let currentDevices = devices.slice(startIndex, startIndex + slidesToShow);

  // Handle cases where there are fewer devices than slidesToShow
  if (currentDevices.length < slidesToShow && devices.length > 0) {
    const remaining = slidesToShow - currentDevices.length;
    currentDevices = [...currentDevices, ...devices.slice(0, remaining)];
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <Typography variant="h4" component="h2" gutterBottom>
        Featured Devices
      </Typography>

      <Box display="flex" alignItems="center">
        <IconButton
          onClick={prevSlide}
          aria-label="Previous"
          disabled={devices.length <= slidesToShow}
        >
          <ChevronLeft />
        </IconButton>

        <Box flexGrow={1}>
          <Grid container spacing={2} justifyContent="center">
            {currentDevices.map((device) => (
              <Grid item key={device.device_id} xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => handleOpenModal(device.device_id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={device.Image}
                    alt={device.device_name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {device.device_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: ${device.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <IconButton
          onClick={nextSlide}
          aria-label="Next"
          disabled={devices.length <= slidesToShow}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Render the DeviceModal component */}
      <DeviceModal
        open={modalOpen}
        device_id={selectedDevice}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default FeaturedDevices;
