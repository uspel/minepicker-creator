import { createClient } from "@supabase/supabase-js";

export default createClient(
  "https://minepicker.com/api",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGdmb3FxYmx2bnd4YnBrdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE3MDc1MjAsImV4cCI6MjAxNzI4MzUyMH0.p_uoet8LlvOBZ-7QfoQZBfdK836kUvVT4qGOrD3WWsc"
);
