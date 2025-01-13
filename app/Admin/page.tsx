"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { blue } from "@mui/material/colors";
import theme from "@/utils/theme";
import { getDevices, updateDevice } from "@/utils/supabase";
import SearchBar from "@/components/SearchBar";
import DeviceList from "@/components/DeviceList";
import Pagination from "@/components/Pagination";
import DeviceEditModal from "@/components/DeviceEditModal";
import AddDevice from "@/components/AddDevice";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase";
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

export default function AdminPage() {
  const { user } = useUser();
  useEffect(() => {
    let isAdmin = false;
    const checkAdmin = async () => {
      const { data } = await supabase
        .from("users")
        .select("is_Admin")
        .eq("user_id", user?.id)
        .single();
      isAdmin = data?.is_Admin;
      if (!isAdmin) return <div>You are not an Admin. Please return.</div>;
    };
    checkAdmin();
  }, [user]);
  const pageSize = 9;
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [currentPage, searchQuery]);

  const fetchDevices = async () => {
    const { devices, totalCount } = await getDevices(
      currentPage,
      pageSize,
      searchQuery
    );
    setDevices(devices);
    setTotalPages(Math.ceil(totalCount / pageSize));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const handleSaveDevice = async (updatedDevice: Device) => {
    const result = await updateDevice(updatedDevice.device_id, updatedDevice);
    if (result) {
      setDevices(
        devices.map((d) =>
          d.device_id === updatedDevice.device_id ? updatedDevice : d
        )
      );
    }
    setIsModalOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth={false}
        sx={{ py: 8, width: "calc(100% - 200px)", flexGrow: 1 }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            textTransform: "capitalize",
            color: blue[700],
            fontWeight: "bold",
            mb: 4,
          }}
        >
          Admin Dashboard
        </Typography>
        <AddDevice />
        <SearchBar onSearch={handleSearch} />
        <DeviceList devices={devices} onEdit={handleEditDevice} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
        <DeviceEditModal
          device={editingDevice}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDevice}
        />
      </Container>
    </ThemeProvider>
  );
}
