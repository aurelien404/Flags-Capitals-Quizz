import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import "./i18n";

import Header from "./components/Header.jsx";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<App />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  </BrowserRouter>
);
