"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";

export default function BlogDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [blogPost, setBlogPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("blog")
          .select("*")
          .eq("id", id)
          .single(); // Use .single() since we expect only one result

        if (error) {
          throw error;
        }

        setBlogPost(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h5" color="error" mt={5}>
          Error: {error}
        </Typography>
      </Container>
    );
  }

  if (!blogPost) {
    return (
      <Container>
        <Typography variant="h5" mt={5}>
          Blog post not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        {blogPost.Image && (
          <CardMedia
            component="img"
            height="300"
            image={blogPost.Image}
            alt="Blog Image"
          />
        )}
        <CardContent>
          <Typography variant="h4" component="div" gutterBottom>
            {blogPost.Description}
          </Typography>

          <Typography variant="body1">{blogPost.Content}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
