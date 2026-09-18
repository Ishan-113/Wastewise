// WasteWise — API base config
// For local dev: keep as localhost (default in auth.js/dashboard.js will be used if this file is empty)
// For Vercel prod: set to your Render backend URL
// Example: window.__WASTEWISE_API__ = "https://wastewise-backend.onrender.com";
//
// IMPORTANT: After deploying backend to Render, edit this line and redeploy frontend to Vercel.
// On Vercel you can also set this via script injection without editing file — but editing here is simplest.

window.__WASTEWISE_API__ = window.__WASTEWISE_API__ || "http://localhost:8080";

// Uncomment and set for production:
// window.__WASTEWISE_API__ = "https://YOUR-BACKEND.onrender.com";
