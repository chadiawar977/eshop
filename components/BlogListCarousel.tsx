// components/BlogListCarousel.js
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowBackIos";
import ArrowRightIcon from "@mui/icons-material/ArrowForwardIos";
import { useTheme } from "@mui/material/styles";

const BlogListCarousel = () => {
  const [blogPosts, setBlogPosts] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const containerRef = useRef<any>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("blog")
          .select("id, Image, Description")
          .order("id", { ascending: true });

        if (error) {
          throw error;
        }
        setBlogPosts(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const handleNext = () => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.children[0].offsetWidth + 16; // Calculate width of a single card including margin
      // Change to show 3 items
      const newIndex = Math.min(currentIndex + 3, blogPosts.length - 3);
      containerRef.current.scrollLeft += (newIndex - currentIndex) * cardWidth;
      setCurrentIndex(newIndex);
    }
  };

  const handlePrev = () => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.children[0].offsetWidth + 16;
      // Change to show 3 items
      const newIndex = Math.max(currentIndex - 3, 0);
      containerRef.current.scrollLeft -= (currentIndex - newIndex) * cardWidth;
      setCurrentIndex(newIndex);
    }
  };

  return (
    <Box sx={{ overflow: "hidden", my: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Blogs
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={handlePrev}
          disabled={currentIndex === 0 || loading}
        >
          <ArrowLeftIcon />
        </IconButton>
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            display: "flex",
            transition: "transform 0.5s ease-in-out", // Smooth transition
            overflowX: "hidden",
            scrollBehavior: "smooth",
          }}
        >
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="error">Error: {error}</Typography>}
          {!loading &&
            !error &&
            blogPosts.map((post: any) => (
              <Card
                key={post.id}
                // Adjust card size here
                sx={{
                  minWidth: 350, // Increased from 275
                  maxWidth: 400, // Increased from 300
                  mx: 2,
                  flexShrink: 0,
                  height: 350,
                }}
              >
                {post.Image && (
                  <CardMedia
                    component="img"
                    height="194" // Increased height
                    image={post.Image}
                    alt={post.Description}
                  />
                )}
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    // Adjust height for larger card
                    sx={{
                      height: 80, // Increased from 60
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {post.Description}
                  </Typography>
                  <Link href={`/blog?id=${post.id}`}>
                    <Button size="small" sx={{ mt: 1 }}>
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
        </Box>
        <IconButton
          onClick={handleNext}
          // Change to show 3 items
          disabled={currentIndex >= blogPosts.length - 3 || loading}
        >
          <ArrowRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default BlogListCarousel;
