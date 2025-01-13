"use client";
import React, { useState } from "react";
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
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/nextjs";

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

const AddDevice = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState([""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    category_name: "",
    device_name: "",
    description: "",
    price: "",
    stock_quantity: "",
    brand: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      category_name: e.target.value as string,
    }));
  };

  const handleAttributeChange = (index: number, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, ""]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    const filePath = `device-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("Images")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("Images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const filteredAttributes = attributes.filter(
        (attr) => attr.trim() !== ""
      );

      const deviceData = {
        ...formData,
        Attributes: filteredAttributes,
        Image: imageUrl,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      };

      const { data, error } = await supabase
        .from("devices")
        .upsert({ ...deviceData });

      if (error) throw error;

      setOpen(false);
      setFormData({
        category_name: "",
        device_name: "",
        description: "",
        price: "",
        stock_quantity: "",
        brand: "",
      });
      setAttributes([""]);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error adding device:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{
          marginLeft: "50", // Push the button to the right
          marginTop: 2, // Add top padding (using theme spacing)
        }}
      >
        Add Device
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2 }}
          >
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                required
                fullWidth
                id="device_name"
                name="device_name"
                label="Device Name"
                value={formData.device_name}
                onChange={handleInputChange}
              />
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category_name"
                  name="category_name"
                  value={formData.category_name}
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
              value={formData.description}
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
                value={formData.price}
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
                value={formData.stock_quantity}
                onChange={handleInputChange}
              />
            </Box>
            <TextField
              fullWidth
              id="brand"
              name="brand"
              label="Brand"
              value={formData.brand}
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
                    onChange={(e) =>
                      handleAttributeChange(index, e.target.value)
                    }
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? "Adding..." : "Add Device"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddDevice;
