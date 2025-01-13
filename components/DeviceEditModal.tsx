"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  IconButton,
  SelectChangeEvent,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";

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

interface DeviceEditModalProps {
  device: Device | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedDevice: Device) => void;
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

export default function DeviceEditModal({
  device,
  open,
  onClose,
  onSave,
}: DeviceEditModalProps) {
  const [editedDevice, setEditedDevice] = useState<Device | null>(null);
  const [attributes, setAttributes] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // Added state for image file

  useEffect(() => {
    if (device) {
      setEditedDevice(device);
      setAttributes(device.Attributes || []);
      setImagePreview(device.Image || "");
    }
  }, [device]);

  if (!editedDevice) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedDevice((prev) => ({ ...prev!, [name]: value }));
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setEditedDevice((prev) => ({
      ...prev!,
      category_name: e.target.value as string,
    }));
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = value;
    setAttributes(newAttributes);
    setEditedDevice((prev) => ({ ...prev!, Attributes: newAttributes }));
  };

  const addAttribute = () => {
    setAttributes([...attributes, ""]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    setEditedDevice((prev) => ({ ...prev!, Attributes: newAttributes }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);

      try {
        const imageUrl = await uploadImage(file); // Assuming uploadImage function is defined elsewhere
        setEditedDevice((prev) => ({ ...prev!, Image: imageUrl }));
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    }
  };

  const handleSave = async () => {
    if (editedDevice) {
      if (imageFile) {
        try {
          const imageUrl = await uploadImage(imageFile);
          setEditedDevice((prev) => ({ ...prev!, Image: imageUrl }));
        } catch (error) {
          console.error("Error uploading image:", error);
          // Handle the error appropriately (e.g., show an error message to the user)
          return;
        }
      }
      onSave(editedDevice);
      onClose();
    }
  };

  // Placeholder for the uploadImage function.  Replace with your actual implementation.
  const uploadImage = async (file: File): Promise<string> => {
    // Your image upload logic here.  This is a placeholder.
    // Replace with your actual upload function that returns a URL.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("https://example.com/image.jpg"); // Replace with actual URL
      }, 500);
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Device</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              required
              fullWidth
              id="device_name"
              name="device_name"
              label="Device Name"
              value={editedDevice.device_name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category_name"
                name="category_name"
                value={editedDevice.category_name}
                onChange={handleCategoryChange}
                label="Category"
              >
                {DEVICE_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            id="description"
            name="description"
            label="Description"
            value={editedDevice.description}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              required
              fullWidth
              type="number"
              id="price"
              name="price"
              label="Price"
              value={editedDevice.price}
              onChange={handleInputChange}
              inputProps={{ step: "0.01" }}
            />
            <TextField
              required
              fullWidth
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              label="Stock Quantity"
              value={editedDevice.stock_quantity}
              onChange={handleInputChange}
            />
          </Box>
          <TextField
            fullWidth
            id="brand"
            name="brand"
            label="Brand"
            value={editedDevice.brand}
            onChange={handleInputChange}
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Attributes</Typography>
            {attributes.map((attr, index) => (
              <Box key={index} sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                  fullWidth
                  value={attr}
                  onChange={(e) => handleAttributeChange(index, e.target.value)}
                  placeholder="Enter attribute (e.g., Color: Red, RAM: 8GB)"
                />
                {attributes.length > 1 && (
                  <IconButton
                    onClick={() => removeAttribute(index)}
                    color="error"
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addAttribute}
              sx={{ mt: 1 }}
            >
              Add Attribute
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Device Image</Typography>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="raised-button-file">
              <Button variant="outlined" component="span">
                Upload Image
              </Button>
            </label>
            {imagePreview && (
              <Box
                sx={{
                  mt: 2,
                  position: "relative",
                  width: "100%",
                  height: 200,
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
