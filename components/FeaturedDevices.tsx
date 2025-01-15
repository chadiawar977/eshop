import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  Box,
  Typography,
  IconButton,
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  useEffect(() => {
    const fetchFeaturedDevices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("devices")
          .select("*")
          .gt("stock_quantity", 0)
          .order("stock_quantity", { ascending: false })
          .limit(20);

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
    setStartIndex((prevIndex) => {
      const newIndex = Math.min(
        prevIndex + slidesToShow,
        devices.length - slidesToShow
      );
      setShowLeftArrow(true);
      return newIndex;
    });
  };

  const prevSlide = () => {
    setStartIndex((prevIndex) => {
      const newIndex = Math.max(prevIndex - slidesToShow, 0);
      setShowLeftArrow(newIndex > 0);
      return newIndex;
    });
  };

  const handleOpenModal = (device: any) => {
    setSelectedDevice(device);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDevice(null);
  };

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

  const visibleDevices = devices.slice(startIndex, startIndex + slidesToShow);

  return (
    <Box padding={4}>
      <Typography variant="h4" component="h2" gutterBottom>
        Featured Devices
      </Typography>

      <Box display="flex" alignItems="center">
        {showLeftArrow && (
          <IconButton
            onClick={prevSlide}
            aria-label="Previous"
            disabled={startIndex === 0}
          >
            <ChevronLeft />
          </IconButton>
        )}

        <Box flexGrow={1} overflow="hidden">
          <Box
            display="flex"
            sx={{
              transition: "transform 0.3s ease-in-out",
            }}
          >
            {visibleDevices.map((device) => (
              <Box
                key={device.device_id}
                width={`${100 / slidesToShow}%`}
                padding={1}
                flexShrink={0}
              >
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
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton
          onClick={nextSlide}
          aria-label="Next"
          disabled={startIndex >= devices.length - slidesToShow}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      <DeviceModal
        open={modalOpen}
        device_id={selectedDevice}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default FeaturedDevices;
