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
import { ChevronRight } from "@mui/icons-material";
import DeviceModal from "./DeviceModal";
import Link from "next/link";

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
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const slidesToShow = 5;

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

  const currentDevices = devices.slice(0, slidesToShow);

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={2}
        >
          <Typography variant="h4" component="h2">
            {categoryName}
          </Typography>
        </Box>

        <Box>
          <Grid container spacing={2} justifyContent="space-between">
            {currentDevices.map((device) => (
              <Grid item key={device.device_id} xs={12} sm={6} md={2.4}>
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
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Link href={`/${categoryName}`} passHref>
            <IconButton color="primary" aria-label="See More">
              <ChevronRight />
            </IconButton>
          </Link>
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
