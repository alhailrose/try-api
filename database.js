const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = "https://ntgqznghihfoaneddfyl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Z3F6bmdoaWhmb2FuZWRkZnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MzExMDcsImV4cCI6MjA0NjQwNzEwN30.K49slppVYb_o-kXKz11ITVl-_gKW3LdaShXM3sz_jN4";

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // Tes query ke database (contoh: membaca tabel "profiler")
    const { data, error } = await supabase
      .from("profiler") // Nama tabel di database Supabase Anda
      .select("*");

    if (error) {
      console.error("Error accessing database:", error.message);
    } else {
      console.log("Connection successful. Data from 'profiler':", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
})();

module.exports = supabase;
