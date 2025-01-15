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
  styled,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import DeviceModal from "./DeviceModal"; // Adjust the import path as needed

interface CategoryCarouselProps {
  categoryName: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categoryName,
}) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const slidesToShow = 4;

  useEffect(() => {
    const fetchDevicesByCategory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("devices")
          .select("*")
          .eq("category_name", categoryName)
          .gt("stock_quantity", 0)
          .order("device_id", { ascending: true })
          .limit(20);

        if (error) throw error;

        const shuffled = data.sort(() => 0.5 - Math.random());
        setDevices(shuffled.slice(0, 10));
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevicesByCategory();
  }, [categoryName]);

  const handleOpenModal = (deviceId: number) => {
    setSelectedDeviceId(deviceId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDeviceId(null);
  };

  const nextSlide = () => {
    setStartIndex((startIndex + slidesToShow) % devices.length);
  };

  const prevSlide = () => {
    setStartIndex(
      (startIndex - slidesToShow + devices.length) % devices.length
    );
  };

  let currentDevices = devices.slice(startIndex, startIndex + slidesToShow);

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
    <>
      <Box padding={4}>
        <Typography variant="h4" component="h2" gutterBottom>
          {categoryName}
        </Typography>

        <Box display="flex" alignItems="center">
          <IconButton
            onClick={prevSlide}
            aria-label="Previous"
            disabled={devices.length <= slidesToShow}
            sx={{
              "&.Mui-disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronLeft />
          </IconButton>

          <Box flexGrow={1}>
            <Grid container spacing={2} justifyContent="center">
              {currentDevices.map((device) => (
                <Grid item key={device.device_id} xs={12} sm={6} md={3}>
                  <StyledCard onClick={() => handleOpenModal(device.device_id)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={device.Image}
                      alt={device.device_name}
                      sx={{
                        objectFit: "cover",
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.2,
                          height: "2.4em",
                        }}
                      >
                        {device.device_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: "medium" }}
                      >
                        ${device.price.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          <IconButton
            onClick={nextSlide}
            aria-label="Next"
            disabled={devices.length <= slidesToShow}
            sx={{
              "&.Mui-disabled": {
                opacity: 0.3,
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      <DeviceModal
        open={modalOpen}
        onClose={handleCloseModal}
        device_id={selectedDeviceId}
      />
    </>
  );
};

export default CategoryCarousel;
