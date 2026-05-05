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
      <main className={!hideNavbar ? "pt-24" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
