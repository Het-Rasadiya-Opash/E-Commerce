import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import apiRequest from "../utils/apiRequest";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await apiRequest.get("/orders");
      console.log(res.data.data);
      setOrderst(res.data.data);
    };
    fetchOrders();
  }, []);
  return <div>Order</div>;
};

export default Orders;
