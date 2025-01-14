"use client";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Drawer,
  Container,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Badge,
} from "@mui/material";
import { NumberProvider } from "../app/context/CartContext";

import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeIcon from "@mui/icons-material/Home";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { supabase } from "../utils/supabase";
import { template } from "lodash";
import { useNumber } from "./context/CartContext";
const DEVICE_CATEGORIES = [
  "Smartphones",
  "Laptops",
  "Tablets",
  "Desktop Computers",
  "Monitors",
  "Printers",
  "Smart Watches",
  "Cameras",
  "Audio Devices",
  "Gaming Consoles",
  "Network Equipment",
  "Storage Devices",
  "Smart Home Devices",
  "TV & Entertainment",
  "Computer Accessories",
];

const AdminButton = () => {
  const { user } = useUser();

  const isAdmin = supabase
    .from("users")
    .select("is_admin")
    .eq("user_id", user?.id)
    .single();

  if (!isAdmin) return null;

  return (
    <>
      {/* Desktop version */}
      <Box sx={{ display: { xs: "none", md: "flex" } }}>
        <Button
          component={Link}
          href="/Admin"
          sx={{ color: "white" }}
          startIcon={<AdminPanelSettingsIcon />}
        >
          Admin
        </Button>
      </Box>

      {/* Mobile version */}
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          color="inherit"
          component={Link}
          href="/Admin"
          aria-label="admin"
        >
          <AdminPanelSettingsIcon />
        </IconButton>
      </Box>
    </>
  );
};
const CartButton = () => {
  const { user } = useUser();
  const { setNumber, number } = useNumber();
  useEffect(() => {
    const fetchCartData = async () => {
      const { data: cartData, error: cartError } = await supabase
        .from("users")
        .select("cart")
        .eq("user_id", user?.id)
        .single();

      if (cartError) {
        console.error(cartError);
      } else {
        const num = cartData?.cart.length;
        console.log(num);
        setNumber(num);
      }
    };

    fetchCartData();
  }, [user?.id]);
  let cartCount = number;
  // const [cartCount, setCartCount] = useState<number>(0);
  useEffect(() => {
    const getcartcount = async () => {
      cartCount = number;
    };

    getcartcount();
    const interval = setInterval(getcartcount, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);
  return (
    <>
      {/* Desktop version */}
      <Box sx={{ display: { xs: "none", md: "flex" } }}>
        <Button component={Link} href="/Cart" sx={{ color: "white" }}>
          <Badge
            badgeContent={cartCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                right: -3,
                top: 3,
                border: "2px solid",
                borderColor: "background.paper",
              },
            }}
          >
            <ShoppingCartIcon />
          </Badge>
             Cart
        </Button>
      </Box>

      {/* Mobile version */}
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          color="inherit"
          component={Link}
          href="/Cart"
          aria-label={`cart with ${cartCount} items`}
        >
          <Badge
            badgeContent={cartCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                right: -3,
                top: 3,
                border: "2px solid",
                borderColor: "background.paper",
              },
            }}
          >
            <ShoppingCartIcon />
               Cart
          </Badge>
        </IconButton>
      </Box>
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categoryDrawer, setCategoryDrawer] = useState(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setCategoryDrawer(open);
    };

  const categoryList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {DEVICE_CATEGORIES.map((category) => (
          <ListItem key={category}>
            <ListItemText
              primary={
                <Typography component="span">
                  <Typography
                    component="a"
                    href={`/${category.toLowerCase().replace(/\s+/g, "-")}`}
                    sx={{
                      textDecoration: "none", // Remove underline
                      color: "inherit", // Inherit color from parent
                      "&:hover": {
                        textDecoration: "underline", // Underline on hover
                        color: "blue", // Change color on hover (example)
                      },
                    }}
                  >
                    {category}
                  </Typography>
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ClerkProvider>
      <NumberProvider>
        <html lang="en">
          <body>
            <Box sx={{ flexGrow: 1 }}>
              <AppBar position="static">
                <Container maxWidth="xl">
                  <Toolbar disableGutters>
                    {/* Categories Menu Icon */}
                    <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      sx={{ mr: 2 }}
                      onClick={toggleDrawer(true)}
                    >
                      <MenuIcon />
                    </IconButton>

                    {/* Logo */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: { xs: 1, md: 0 },
                      }}
                    >
                      <Image
                        src="/favicon.ico"
                        alt="Logo"
                        width={50}
                        height={50}
                        style={{ marginRight: "8px" }}
                      />
                    </Box>

                    {/* Desktop Menu */}
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: { xs: "none", md: "flex" },
                        justifyContent: "center",
                        gap: "20px",
                      }}
                    >
                      <Button
                        component={Link}
                        href="/"
                        sx={{ color: "white" }}
                        startIcon={<HomeIcon />}
                      >
                        Home
                      </Button>
                      {/* <Button
                      component={Link}
                      href="/Cart"
                      sx={{ color: "white" }}
                      startIcon={<ShoppingCartIcon />}
                    >
                      Cart
                    </Button> */}
                      <CartButton />
                      <SignedIn>
                        <AdminButton />
                      </SignedIn>
                    </Box>

                    {/* Mobile Menu */}
                    <Box
                      sx={{ display: { xs: "flex", md: "none" }, gap: "10px" }}
                    >
                      <IconButton
                        color="inherit"
                        component={Link}
                        href="/"
                        aria-label="home"
                      >
                        <HomeIcon />
                      </IconButton>
                      {/* <IconButton
                      color="inherit"
                      component={Link}
                      href="/Cart"
                      aria-label="cart"
                    >
                      <ShoppingCartIcon />
                    </IconButton> */}
                      <CartButton />
                      <SignedIn>
                        <AdminButton />
                      </SignedIn>
                    </Box>

                    {/* User Menu */}
                    <Box sx={{ ml: 2 }}>
                      <SignedOut>
                        <SignInButton />
                      </SignedOut>
                      <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </Box>
                  </Toolbar>
                </Container>
              </AppBar>

              {/* Categories Drawer */}
              <Drawer
                anchor="left"
                open={categoryDrawer}
                onClose={toggleDrawer(false)}
              >
                {categoryList}
              </Drawer>

              {children}
            </Box>
          </body>
        </html>
      </NumberProvider>
    </ClerkProvider>
  );
}
function single() {
  throw new Error("Function not implemented.");
}
