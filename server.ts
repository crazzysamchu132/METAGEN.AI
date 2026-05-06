import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Multer setup for temporary storage if needed (though we'll use FE mostly)
  const upload = multer({ dest: 'uploads/' });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example endpoint for CSV generation if requested by user specifically for backend
  app.post("/api/export-csv", (req, res) => {
    const { data } = req.body;
    // Simple JSON to CSV logic
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data" });
    }
    
    // Logic could go here, but we'll prioritize client-side for immediate response
    res.json({ message: "Export ready" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
