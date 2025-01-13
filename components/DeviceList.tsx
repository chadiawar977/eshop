import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import { blue } from "@mui/material/colors";
import Image from "next/image";
import { Container, Snackbar, Alert, CircularProgress } from "@mui/material";
interface Device {
  device_id: number;
  device_name: string;
  brand: string;
  description: string;
  price: number;
  stock_quantity: number;
  Image: string;
  Attributes: string[];
  category_name: string;
}

interface DeviceListProps {
  devices: Device[];
  onEdit: (device: Device) => void;
}

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

export default function DeviceList({ devices, onEdit }: DeviceListProps) {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 8,
        width: "calc(100% - 200px)",
        flexGrow: 1,
      }}
    >
      <Grid container spacing={4}>
        {devices.map((device) => (
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
                    onClick={() => onEdit(device)}
                    sx={{
                      bgcolor: blue[600],
                      "&:hover": {
                        bgcolor: blue[700],
                      },
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
