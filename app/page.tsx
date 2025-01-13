"use client";
import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { supabase } from "../utils/supabase";
import { Box, Typography, Container } from "@mui/material";
import Image from "next/image";
interface UserData {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
}

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

  if (!session) {
    return <div className="text-center p-4">Please sign in to continue</div>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "40vh ",
        }}
      >
        <Image src="/main.jpeg" alt="logo" width={800} height={300} />
      </div>
    </Container>
  );
}
