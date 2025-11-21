import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";

// Pages
import Home from "../pages/Home/Home";
import FAQ from "../pages/FAQ/FAQ";
import Contact from "../pages/Contact/Contact";
import About from "../pages/About/About";
import Home2 from "../pages/Home2/Home2";
import ProductPage from "../pages/Product/ProductPage";



const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faqs" element={<FAQ />} />  
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/product/:id" element={<ProductPage />} />


          

        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;
