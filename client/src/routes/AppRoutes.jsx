import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ScrollToTop from "../components/ScrollToTop";

// Pages
import Home from "../pages/Home/Home";
import FAQ from "../pages/FAQ/FAQ";
import Contact from "../pages/Contact/Contact";
import About from "../pages/About/About";
import Home2 from "../pages/Home2/Home2";
import ProductPage from "../pages/Product/ProductPage";
import CategoryPage from "../pages/Category/CategoryPage";
import Shop from "../pages/Shop/shop";
import SecondHProducts from "../pages/SecondHProducts/buyproducts";

// Admin Pages
import AdminLogin from "../admin/Login";
import Products from "../admin/Products";
import AddProduct from "../admin/AddProduct";
import Orders from "../admin/Orders";  
import EditProduct from "../admin/EditProduct";


const AppRoutes = () => {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Layout>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/faqs" element={<FAQ />} />  
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/home2" element={<Home2 />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/buyproducts" element={<SecondHProducts />} />

          {/* Admin Login - Unprotected */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <Products />
              </ProtectedAdminRoute>
            }
          />

          <Route 
            path="/admin/products/new"
            element={
              <ProtectedAdminRoute>
                <AddProduct />
              </ProtectedAdminRoute>
            }
          />

          <Route 
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <Orders />
              </ProtectedAdminRoute>
            }
          />
          <Route
  path="/admin/products/edit/:id"
  element={
    <ProtectedAdminRoute>
      <EditProduct />
    </ProtectedAdminRoute>
  }
/>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;
