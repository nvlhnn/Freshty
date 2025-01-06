// app/page.js
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import OrderLineChart from "@/components/OrderLineChart";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "@/lib/cookie";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminPage() {
  // State variables for order statistics
  const [orderData, setOrderData] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false); // Tracks initial load

  // State variables for latest orders
  const [latestOrders, setLatestOrders] = useState([]);
  const [isLoadingLatestOrders, setIsLoadingLatestOrders] = useState(false);
  const [latestOrdersError, setLatestOrdersError] = useState(null);
  const [hasLoadedLatestOrders, setHasLoadedLatestOrders] = useState(false); // Tracks initial load

  const hasMounted = useRef(false); // Ref to track component mount status
  const clientRef = useRef(null); // Ref for the WebSocket client

  // Function to fetch order statistics for the chart
  const fetchOrderStats = useCallback(async () => {
    setIsLoadingOrders(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/orders/stats`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch order stats");
      }
      const result = await response.json();

      console.log("Fetched order data:", result.dailyStats);

      // Update state only if data has changed
      setOrderData(result.dailyStats);

      if (!hasLoadedOrders) {
        setHasLoadedOrders(true); // Mark initial load as complete
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
      setError("Failed to load order statistics.");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [hasLoadedOrders]);

  // Function to fetch the latest 3 orders
  const fetchLatestOrders = useCallback(async () => {
    setIsLoadingLatestOrders(true);
    setLatestOrdersError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/orders?page=0&size=3`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch latest orders");
      }
      const result = await response.json();

      console.log("Fetched latest orders:", result.orders);

      // Update state only if data has changed
      setLatestOrders(result.orders);

      if (!hasLoadedLatestOrders) {
        setHasLoadedLatestOrders(true); // Mark initial load as complete
      }
    } catch (error) {
      console.error("Error fetching latest orders:", error);
      setLatestOrdersError("Failed to load latest orders.");
    } finally {
      setIsLoadingLatestOrders(false);
    }
  }, [hasLoadedLatestOrders]);

  // Initial data fetch on component mount
  useEffect(() => {
    if (!hasMounted.current) {
      fetchOrderStats(); // Load order stats initially
      fetchLatestOrders(); // Load latest orders initially
      hasMounted.current = true;
    }
  }, [fetchOrderStats, fetchLatestOrders]);

  // Initialize WebSocket connection
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_ORDER_API_URL}/ws`),
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // Attempt reconnection every 5 seconds if disconnected
      onConnect: () => {
        console.log("Connected to WebSocket");

        // Subscribe to the topic for new orders
        client.subscribe("/topic/order-created", (message) => {
          console.log("WebSocket Message Received:", message.body); // Should log "order created"

          // Trigger data refetching without showing spinners
          fetchLatestOrders();
          fetchOrderStats();

          // Show toast notification
          toast.success("A new order has been created!");
        });
      },
      onStompError: (frame) => {
        console.error("WebSocket error", frame);
        toast.error("WebSocket connection error.");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [fetchLatestOrders, fetchOrderStats]);

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">
          Admin Dashboard
        </h1>

        {/* Main Container with Fixed Minimum Height */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md flex-1 h-[582px] relative">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Orders in the Last 7 Days
            </h2>
            {isLoadingOrders && !hasLoadedOrders ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="h-full w-full">
                <OrderLineChart data={orderData} />
              </div>
            )}
          </div>

          {/* Latest 3 Orders as Cards with Smooth Transitions */}
          <div className="bg-white p-6 rounded-lg shadow-md w-full lg:w-1/3 h-[582px]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Latest 3 Orders
            </h2>
            {isLoadingLatestOrders && !hasLoadedLatestOrders ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div>
              </div>
            ) : latestOrdersError ? (
              <div className="text-red-500">{latestOrdersError}</div>
            ) : latestOrders.length === 0 ? (
              <p className="text-gray-600">No orders found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {latestOrders.map((order) => (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      layout
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        {/* Order ID and Amount */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-1">
                            Order ID:{" "}
                            <span className="text-gray-600">
                              {order.orderId}
                            </span>
                          </h3>
                          <p className="text-gray-700 text-sm">
                            <strong>Amount:</strong> Rp.{" "}
                            {parseFloat(order.totalAmount).toFixed(2)}
                          </p>
                        </div>

                        {/* Order Status */}
                        <div
                          className={`flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                            order.orderStatus === "PAID"
                              ? "bg-green-100 text-green-800"
                              : order.orderStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.orderStatus === "PAID" && (
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 00-1.414 1.414l4.828 4.828a1 1 0 001.414 0l9-9a1 1 0 00-1.414-1.414L8.414 13.586 5.879 11.05a1 1 0 10-1.414 1.414L8.414 16l9-9a1 1 0 00-1.414-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {order.orderStatus === "PENDING" && (
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
                            </svg>
                          )}
                          {order.orderStatus === "CANCELLED" && (
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {order.orderStatus}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
