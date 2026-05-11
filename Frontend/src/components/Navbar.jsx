import {
  ChevronDown,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { toggleCart } from "../features/cartSlice";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.users);
  const { cartTotalQuantity } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await apiRequest.post("/users/logout");
    toast.success("Logged out successfully");
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="hidden lg:inline text-2xl font-bold bg-indigo-600 0 bg-clip-text text-transparent">
              E-Commerce
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/categories"
              className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Categories
            </Link>

            <Link
              to="/flash-sales"
              className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Flash Sales
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => dispatch(toggleCart())}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalQuantity > 0 && (
                <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cartTotalQuantity}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1 pl-2 pr-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                    {currentUser.username?.charAt(0) || (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">
                    {currentUser.username}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
                      <div className="px-4 py-2 border-bottom border-slate-50 mb-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Account
                        </p>
                      </div>
                      {currentUser.role === "ADMIN" ? (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/orders/admin/all-orders"
                            className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <ListOrdered className="w-4 h-4" />

                            <span>All Orders</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>Orders</span>
                          </Link>
                        </>
                      )}
                      <div className="my-1 border-t border-slate-100"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              Home
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              Categories
            </Link>

            <Link
              to="/flash-sales"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              Flash Sales
            </Link>
            {!currentUser && (
              <div className="pt-4 grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-center items-center px-4 py-3 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex justify-center items-center px-4 py-3 bg-indigo-600 rounded-xl text-white font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
