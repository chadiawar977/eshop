import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 2, // Reduced padding
        mt: "auto",
      }}
    >
      <Container maxWidth="md">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">E-Shop</Typography>
          <Typography variant="body2">
            © {new Date().getFullYear()} All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
