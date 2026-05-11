import React, { Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartDrawer from "./components/CartDrawer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { setCheckingAuth, setCurrentUser } from "./features/usersSlice";
import apiRequest from "./utils/apiRequest";

const AddProduct = React.lazy(() => import("./pages/AddProduct"));
const AllOrdersShow = React.lazy(() => import("./pages/AllOrdersShow"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Categories = React.lazy(() => import("./components/Categories"));
const CreateFlashSale = React.lazy(() => import("./pages/CreateFlashSale"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const EditProduct = React.lazy(() => import("./pages/EditProduct"));
const FlashSales = React.lazy(() => import("./pages/FlashSales"));
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Orders = React.lazy(() => import("./pages/Orders"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Register = React.lazy(() => import("./pages/Register"));
const Success = React.lazy(() => import("./pages/Success"));

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
        <Suspense fallback={null}>
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
                path="/edit-product/:productId"
                element={<EditProduct />}
              />
              <Route path="/create-flash-sale" element={<CreateFlashSale />} />
              <Route
                path="/orders/admin/all-orders"
                element={<AllOrdersShow />}
              />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
