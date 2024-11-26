// server.js
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const supabase = require("./database");
const response = require("./response");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Middleware untuk parsing JSON
app.use(express.json());

// Endpoint Utama
app.get("/", (req, res) => {
  response(200, "API Profiler ready to use", "SUCCESS", res);
});

// Mendapatkan Semua Pengguna
app.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("profiler")
    .select("name, email, birthdate, sex, height, weight");

  if (error) {
    return response(500, error.message, "ERROR", res);
  }

  // Mengirimkan data sebagai array
  response(200, data, "SUCCESS", res);
});

// Mendapatkan Pengguna Berdasarkan Email
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  const { data, error } = await supabase
    .from("profiler")
    .select("name, email, birthdate, sex, height, weight")
    .eq("email", email)
    .single();

  if (error) {
    return response(404, error.message, "User not found", res);
  }

  // Pastikan data dibungkus dalam array
  response(200, [data], `Specific data by email '${email}'`, res);
});

// Mendaftarkan Pengguna Baru
app.post("/register", async (req, res) => {
  const { name, email, password, birthdate, sex, height, weight } = req.body;

  const { data, error } = await supabase
    .from("profiler")
    .insert([{ name, email, password, birthdate, sex, height, weight }]);

  if (error) {
    return response(500, error.message, "Error registering user", res);
  }

  // Mengirimkan data sebagai array
  response(200, [data], "User registered successfully", res);
});

// Login Pengguna
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from("profiler")
    .select("email, password")
    .eq("email", email)
    .single();

  if (error || !data) {
    return response(404, [], "User not found", res);
  }

  if (data.password === password) {
    response(200, [{ success: true }], "Login successful", res);
  } else {
    response(200, [{ success: false }], "Invalid email or password", res);
  }
});

// Memperbarui Data Pengguna
app.put("/users/:email", async (req, res) => {
  const email = req.params.email;
  const { name, password, birthdate, sex, height, weight } = req.body;

  const { data, error } = await supabase
    .from("profiler")
    .update({ name, password, birthdate, sex, height, weight })
    .eq("email", email);

  if (error) {
    return response(500, error.message, "Error updating user", res);
  }

  if (data.length > 0) {
    response(200, [data], "User updated successfully", res);
  } else {
    response(404, [], "User not found", res);
  }
});

// Menghapus Pengguna
app.delete("/users", async (req, res) => {
  const { email } = req.body;

  const { data, error } = await supabase
    .from("profiler")
    .delete()
    .eq("email", email);

  if (error) {
    return response(500, error.message, "Error deleting user", res);
  }

  if (data.length > 0) {
    response(200, [data], "User deleted successfully", res);
  } else {
    response(404, [], "User not found", res);
  }
});

// Menjalankan Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
