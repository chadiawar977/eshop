"use client";
import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { supabase } from "../utils/supabase";
import { Box, Typography, Container, Button } from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import BlogListCarousel from "@/components/BlogListCarousel";
import FeaturedDevices from "@/components/FeaturedDevices";
import CategoryCarousel from "@/components/CategoryCarousel";
interface UserData {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
}

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
async function insertUser(user: UserData) {
  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (existingUser) {
      console.log("User already exists");
      return true;
    }

    const { data, error } = await supabase.from("users").insert({
      user_id: user.id,
      email: user.emailAddresses[0].emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
    });

    if (error) {
      console.error("Error inserting user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in insertUser:", error);
    return false;
  }
}

async function getUser(user_id: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("Error getting users:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUsers:", error);
    return null;
  }
}

export default function Home() {
  const { user } = useUser();
  const { session } = useSession();
  const [userInserted, setUserInserted] = useState(false);
  const [client, setClient] = useState<any>(null);

  // ... (keep the existing useEffect hooks)
  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUser = await getUser(user?.id || "");
      setClient(fetchedUser);
    };

    if (session) {
      fetchUsers();
    }
  }, [session, userInserted]);

  useEffect(() => {
    const handleUserData = async () => {
      if (user && !userInserted) {
        const success = await insertUser(user);
        if (success) {
          setUserInserted(true);
        }
      }
    };

    handleUserData();
  }, [user, userInserted]);
  const shopNow = () => {
    // Get the current scroll position
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    // Calculate the target scroll position (e.g., 200 pixels down)
    const targetScroll = currentScroll + 400;

    // Smoothly scroll to the target position
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  function getRandomCategories(numCategories: number) {
    if (numCategories > DEVICE_CATEGORIES.length) {
      throw new Error(
        "Number of requested categories exceeds the total number of categories available."
      );
    }

    // Create a copy of the original array to avoid modifying it
    const categoriesCopy = [...DEVICE_CATEGORIES];

    // Shuffle the copy using the Fisher-Yates algorithm
    for (let i = categoriesCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [categoriesCopy[i], categoriesCopy[j]] = [
        categoriesCopy[j],
        categoriesCopy[i],
      ];
    }

    // Return the first numCategories elements from the shuffled array
    return categoriesCopy.slice(0, numCategories);
  }

  // Get 4 random categories
  const randCategories = getRandomCategories(4);

  return (
    <Container maxWidth="xl" sx={{ mt: 0 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "calc( 64px)",
          py: 4,
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
            mb: { xs: 4, md: 0 },
          }}
        >
          <Typography
            component={motion.h1}
            variant="h2"
            gutterBottom
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to Our E-Shop
          </Typography>
          <Typography
            component={motion.p}
            variant="h5"
            color="text.secondary"
            paragraph
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Discover amazing products and unbeatable deals. Shop now and
            experience the difference!
          </Typography>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={shopNow}
            >
              Shop Now
            </Button>
          </motion.div>
        </Box>
        <Box
          component={motion.div}
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            height: { xs: "300px", md: "500px" },
            width: "100%",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Image
            src="/hero.jpg"
            alt="E-Shop Hero"
            layout="fill"
            style={{ borderRadius: "" }}
          />
        </Box>
      </Box>
      <BlogListCarousel />
      <FeaturedDevices />
      <CategoryCarousel categoryName={randCategories[0]} />
      <CategoryCarousel categoryName={randCategories[1]} />
      <CategoryCarousel categoryName={randCategories[2]} />
      <CategoryCarousel categoryName={randCategories[3]} />
    </Container>
  );
}
