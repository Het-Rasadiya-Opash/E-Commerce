import React from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  Edit2,
  Package,
  ShieldCheck,
  Settings,
  Bell,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.users);

  const formattedDate = new Date(currentUser.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 animate-in slide-in-from-top">
          <div className="h-40 bg-indigo-600  relative">
            <div className="absolute -bottom-16 left-8">
              <div className="p-1 bg-white rounded-2xl shadow-lg">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-white"
                />
              </div>
            </div>
            <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-20 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900">
                  {currentUser.username}
                </h1>
                {currentUser.role === "ADMIN" && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ADMIN
                  </span>
                )}
              </div>
              <p className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {currentUser.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> Account Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Status
                      </p>
                      <p className="text-xs text-slate-500">
                        {currentUser.isActive ? "Active Account" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Joined On
                    </p>
                    <p className="text-xs text-slate-500">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-500" /> Delivery Address
                </h3>
                <button className="text-indigo-600 text-sm font-semibold hover:underline">
                  Change
                </button>
              </div>

              {currentUser.address ? (
                <div className="space-y-2">
                  <p className="text-slate-800 font-medium">
                    {currentUser.address.street || "Not specified"}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {currentUser.address.city}, {currentUser.address.state}{" "}
                    {currentUser.address.zip}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {currentUser.address.country}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-slate-400 text-sm italic">
                    No address provided yet.
                  </p>
                  <button className="mt-2 text-indigo-600 text-sm font-bold">
                    Add Address
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  Personal Menu
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                <Link
                  to="/orders"
                  className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">My Orders</p>
                      <p className="text-xs text-slate-500">
                        Track, return, or buy things again
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
