import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ScrollToTop from "../components/ScrollToTop";
import Dashboard from "../admin/Dashboard";
import Categories from "../admin/Categories";
import Attributes from "../admin/Attributes";
import ActiveRentals from "../admin/ActiveRentals";
import CompletedOrders from "../admin/CompletedOrders";
import AvailabilityCalendar from "../admin/AvailabilityCalendar";
import SalesReports from "../admin/SalesReports";
import Inventory from "../admin/Inventory";






// Pages
import Home from "../pages/Home/Home";
import FAQ from "../pages/FAQ/FAQ";
import Contact from "../pages/Contact/Contact";
import About from "../pages/About/About";

import ProductPage from "../pages/Product/ProductPage";
import CategoryPage from "../pages/Category/CategoryPage";
import Shop from "../pages/Shop/shop";
import SecondHProducts from "../pages/SecondHProducts/buyproducts";

// 🛒 NEW Checkout Flow Pages
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderCompletePage from "../pages/OrderCompletePage";

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
 
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/buyproducts" element={<SecondHProducts />} />

          {/* 🛒 Checkout Flow */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-complete" element={<OrderCompletePage />} />

          {/* Admin Login */}
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
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/attributes" element={<Attributes />} />
          <Route path="/admin/orders/active" element={<ActiveRentals />} />
          <Route path="/admin/orders/completed" element={<CompletedOrders />} />
          <Route
  path="/admin/AvailabilityCalendar"
  element={<AvailabilityCalendar />}
/>
<Route path="/admin/reports/sales" element={<SalesReports />} />
<Route path="/admin/inventory" element={<Inventory />} />








        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;
