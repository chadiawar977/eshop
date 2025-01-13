import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import Link from "next/link";
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

const FeaturedDevices = () => {
  const [devices, setDevices] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const slidesToShow = 4; // Number of slides to show at a time
  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    const fetchFeaturedDevices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("devices")
          .select("*")
          .gt("stock_quantity", 0) // Only get devices with stock
          .order("stock_quantity", { ascending: false })
          .limit(10);

        if (error) throw error;
        setDevices(data);
      } catch (error) {
        console.error("Error fetching devices:", error);
        // Handle error (e.g., display an error message to the user)
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

  const currentDevices = devices.slice(startIndex, startIndex + slidesToShow);

  // Handle cases where there are fewer devices than slidesToShow
  if (currentDevices.length < slidesToShow && devices.length > 0) {
    const remaining = slidesToShow - currentDevices.length;
    currentDevices.push(...devices.slice(0, remaining));
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
            {currentDevices.map((device: any) => (
              <Grid item key={device.device_id} xs={12} sm={6} md={3}>
                <Link href={`/${device.category_name}`} passHref>
                  <Card
                    component="a"
                    sx={{
                      textDecoration: "none",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
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
                </Link>
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
    </Box>
  );
};
export default FeaturedDevices;
