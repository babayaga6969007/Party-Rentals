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









// Pages
import Home from "../pages/Home/Home";
import Contract from "../pages/Contract/Contract";
import FAQ from "../pages/FAQ/FAQ";
import Contact from "../pages/Contact/Contact";
import About from "../pages/About/About";

import ProductPage from "../pages/Product/ProductPage";
import UpdatedProductPage from "../pages/Product/UpdatedProductPage";
import CategoryPage from "../pages/Category/CategoryPage";
import Shop from "../pages/Shop/shop";
import SecondHProducts from "../pages/SecondHProducts/buyproducts";
import SignageEditor from "../pages/Signage/SignageEditor";
import Gallery from "../pages/Gallery/Gallery";

// 🛒 NEW Checkout Flow Pages
import CartPage from "../pages/CartPage";
import CheckoutWrapper from "../pages/CheckoutWrapper";

import OrderCompletePage from "../pages/OrderCompletePage";

// Admin Pages
import AdminLogin from "../admin/Login";
import Products from "../admin/Products";
import AddProduct from "../admin/AddProduct";
import Orders from "../admin/Orders";  
import Inventory from "../admin/Inventory";
import AdminCoupons from "../admin/AdminCoupons";
import AdminSignages from "../admin/AdminSignages";
import AdminSignageConfig from "../admin/AdminSignageConfig";
import AdminShelvingConfig from "../admin/AdminShelvingConfig";
import AdminShippingConfig from "../admin/AdminShippingConfig";
import GalleryAdmin from "../admin/Gallery";


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
          <Route path="/gallery" element={<Gallery />} />
 
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/product/demo" element={<UpdatedProductPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/contract" element={<Contract />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/buyproducts/:id" element={<SecondHProducts />} />
          <Route path="/signage" element={<SignageEditor />} />
          <Route path="/signage/:id" element={<SignageEditor />} />
          <Route path="/signage/share/:token" element={<SignageEditor />} />

          {/* 🛒 Checkout Flow */}
          <Route path="/cart" element={<CartPage />} />
<Route path="/checkout" element={<CheckoutWrapper />} />
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
  path="/admin/coupons"
  element={
    <ProtectedAdminRoute>
      <AdminCoupons />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/signages"
  element={
    <ProtectedAdminRoute>
      <AdminSignages />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/signage-config"
  element={
    <ProtectedAdminRoute>
      <AdminSignageConfig />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/shelving-config"
  element={
    <ProtectedAdminRoute>
      <AdminShelvingConfig />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/shipping-config"
  element={
    <ProtectedAdminRoute>
      <AdminShippingConfig />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/gallery"
  element={
    <ProtectedAdminRoute>
      <GalleryAdmin />
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
  path="/admin/categories"
  element={
    <ProtectedAdminRoute>
      <Categories />
    </ProtectedAdminRoute>
  }
/>

<Route
  path="/admin/attributes"
  element={
    <ProtectedAdminRoute>
      <Attributes />
    </ProtectedAdminRoute>
  }
/>

<Route
  path="/admin/orders/active"
  element={
    <ProtectedAdminRoute>
      <ActiveRentals />
    </ProtectedAdminRoute>
  }
/>

<Route
  path="/admin/orders/completed"
  element={
    <ProtectedAdminRoute>
      <CompletedOrders />
    </ProtectedAdminRoute>
  }
/>

<Route
  path="/admin/inventory"
  element={
    <ProtectedAdminRoute>
      <Inventory />
    </ProtectedAdminRoute>
  }
/>
         
<Route
  path="/admin/products/edit/:id"
  element={
    <ProtectedAdminRoute>
      <AddProduct />
    </ProtectedAdminRoute>
  }
/>

         <Route
  path="/admin/AvailabilityCalendar"
  element={
    <ProtectedAdminRoute>
      <AvailabilityCalendar />
    </ProtectedAdminRoute>
  }
/>
<Route
  path="/admin/reports/sales"
  element={
    <ProtectedAdminRoute>
      <SalesReports />
    </ProtectedAdminRoute>
  }
/>

        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRoutes;
