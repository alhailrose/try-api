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
  try {
    const { data, error } = await supabase
      .from("profiler")
      .select("name, email, birthdate, sex, height, weight");

    if (error) {
      console.error("Error fetching users:", error.message);
      return response(500, null, "ERROR fetching users", res);
    }

    response(200, data, "SUCCESS", res);
  } catch (err) {
    console.error("Unexpected error:", err.message);
    response(500, null, "Unexpected error occurred", res);
  }
});

// Mendapatkan Pengguna Berdasarkan Email
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const { data, error } = await supabase
      .from("profiler")
      .select("name, email, birthdate, sex, height, weight")
      .eq("email", email)
      .single();

    if (error) {
      console.error(`Error fetching user with email ${email}:`, error.message);
      return response(404, null, "User not found", res);
    }

    response(200, data, `Specific data by email '${email}'`, res);
  } catch (err) {
    console.error("Unexpected error:", err.message);
    response(500, null, "Unexpected error occurred", res);
  }
});

// Mendaftarkan Pengguna Baru
app.post("/register", async (req, res) => {
  const { name, email, password, birthdate, sex, height, weight } = req.body;

  // Validasi input (tambahkan validasi lebih lanjut sesuai kebutuhan)
  if (!name || !email || !password) {
    return response(400, null, "Name, email, and password are required", res);
  }

  try {
    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Operasi insert dengan select untuk mengembalikan data yang dimasukkan
    const { data, error } = await supabase
      .from("profiler")
      .insert([{ name, email, password: hashedPassword, birthdate, sex, height, weight }])
      .select("id, name, email, birthdate, sex, height, weight");

    if (error) {
      console.error("Error registering user:", error.message);
      return response(500, null, "Error registering user", res);
    }

    // Pastikan data dikembalikan
    if (data && data.length > 0) {
      return response(201, data[0], "User registered successfully", res);
    } else {
      return response(500, null, "User registered but no data returned", res);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    response(500, null, "Unexpected error occurred", res);
  }
});

// Login Pengguna
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return response(400, null, "Email and password are required", res);
  }

  try {
    const { data, error } = await supabase
      .from("profiler")
      .select("email, password")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error(`User with email ${email} not found:`, error ? error.message : "No data");
      return response(404, { success: false }, "User not found", res);
    }

    // Bandingkan password dengan hashed password di database
    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (isPasswordValid) {
      response(200, { success: true }, "Login successful", res);
    } else {
      response(401, { success: false }, "Invalid email or password", res);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    response(500, null, "Unexpected error occurred", res);
  }
});

// Memperbarui Data Pengguna
app.put("/users/:email", async (req, res) => {
  const email = req.params.email;
  const { name, password, birthdate, sex, height, weight } = req.body;

  // Validasi input (setidaknya salah satu field harus diubah)
  if (!name && !password && !birthdate && !sex && !height && !weight) {
    return response(400, null, "At least one field must be provided for update", res);
  }

  try {
    // Jika password diubah, hash password terlebih dahulu
    let updateData = { name, birthdate, sex, height, weight };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Hapus field yang tidak disediakan (undefined)
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    const { data, error } = await supabase
      .from("profiler")
      .update(updateData)
      .eq("email", email)
      .select("id, name, email, birthdate, sex, height, weight");

    if (error) {
      console.error(`Error updating user with email ${email}:`, error.message);
      return response(500, null, "Error updating user", res);
    }

    if (data && data.length > 0) {
      response(200, data[0], "User updated successfully", res);
    } else {
      response(404, null, "User not found", res);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    response(500, null, "Unexpected error occurred", res);
  }
});

// Menghapus Pengguna
app.delete("/users", async (req, res) => {
  const { email } = req.body;

  // Validasi input
  if (!email) {
    return response(400, null, "Email is required to delete user", res);
  }

  try {
    const { data, error } = await supabase
      .from("profiler")
      .delete()
      .eq("email", email)
      .select("id, name, email");

    if (error) {
      console.error(`Error deleting user with email ${email}:`, error.message);
      return response(500, null, "Error deleting user", res);
    }

    if (data && data.length > 0) {
      response(200, data[0], "User deleted successfully", res);
    } else {
      response(404, null, "User not found", res);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
    response(500, null, "Unexpected error occurred", res);
  }
});

// Menjalankan Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
