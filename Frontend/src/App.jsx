import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { Route, Routes, useLocation } from "react-router";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import { useDispatch } from "react-redux";
import apiRequest from "./utils/apiRequest";
import { setCheckingAuth, setCurrentUser } from "./features/usersSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./components/Categories";
import Cart from "./pages/Cart";
import CartDrawer from "./components/CartDrawer";
import Success from "./pages/Success";
import Orders from "./pages/Orders";
import AllOrdersShow from "./pages/AllOrdersShow";
import Profile from "./pages/Profile";
import FlashSales from "./pages/FlashSales";

const App = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  const dispatch = useDispatch();

  const hasCheckedAuth = React.useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users");
        const user = response.data.data;
        dispatch(setCurrentUser(user));
      } catch (err) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}
      <CartDrawer />
      <main className={!hideNavbar ? "pt-24" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/flash-sales" element={<FlashSales />} />
          </Route>

          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/success" element={<Success />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route
              path="/orders/admin/all-orders"
              element={<AllOrdersShow />}
            />
          </Route>
        </Routes>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
