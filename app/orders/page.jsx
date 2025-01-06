"use client";

import Button from "@/components/Button";
import { useEffect, useState, useRef, useCallback } from "react";

import { getToken } from "@/lib/cookie";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1); // Start with 1 to allow initial fetch
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const observer = useRef();

  // Fetch orders from API
  const fetchOrders = async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/orders/customers?page=${page}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`, // Include the token in the Authorization header
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`);
      }
      const data = await response.json();

      // Prevent duplication by ensuring unique orders
      setOrders((prevOrders) => {
        const newOrders = data.orders.filter(
          (newOrder) =>
            !prevOrders.some((order) => order.orderId === newOrder.orderId)
        );
        return [...prevOrders, ...newOrders];
      });

      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      // Optionally, set an error state here to display in UI
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders(0);
  }, []);

  // Infinite Scroll - Load more orders when the sentinel is visible
  const lastOrderRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage + 1 < totalPages) {
          fetchOrders(currentPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, currentPage, totalPages]
  );

  // Mark order as paid
  const markAsPaid = async (orderId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/orders/pay/${orderId}`, // Adjust the endpoint as per your API
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error marking order as paid: ${response.statusText}`);
      }

      // Update the order status locally
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId ? { ...order, orderStatus: "PAID" } : order
        )
      );
      setSelectedOrder(null); // Close the modal after marking as paid
    } catch (error) {
      console.error("Mark as Paid Error:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-500 mb-6">Order History</h1>

      <div className="grid gap-4">
        {orders.map((order, index) => {
          const isLastOrder = index === orders.length - 1;
          return (
            <div
              ref={isLastOrder ? lastOrderRef : null}
              key={order.orderId}
              className="p-4 bg-white shadow-md rounded-lg grid grid-cols-2 items-center"
            >
              <div>
                <h2 className="font-bold text-md">ID: {order.orderId}</h2>
                <p className="text-gray-600">
                  Total: Rp. {order.totalAmount.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Expired At:{" "}
                  <span className="font-bold">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }).format(new Date(order.expiredAt))}
                  </span>
                </p>
                <p
                  className={`font-bold ${
                    {
                      PAID: "text-green-500",
                      CANCELLED: "text-red-500",
                      PENDING: "text-yellow-500",
                    }[order.orderStatus]
                  }`}
                >
                  {order.orderStatus}
                </p>
              </div>
              <div className="flex justify-end">
                {order.orderStatus !== "PAID" && (
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    className="w-36 py-1 px-3 rounded border border-green-prime"
                  >
                    Pay
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <p className="text-center mt-4 text-gray-600">Loading more orders...</p>
      )}

      {/* Modal for Payment Confirmation */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pay Order</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to pay the order with ID{" "}
              <span className="font-bold text-gray-800">
                {selectedOrder.orderId}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-300 text-gray-700 py-1 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => markAsPaid(selectedOrder.orderId)}
                className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
