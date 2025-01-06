"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getToken } from "@/lib/cookie";
import { toast, ToastContainer } from "react-toastify";

export default function WarehousePage() {
  // State Variables
  const [warehouses, setWarehouses] = useState([]); // Initialize as empty array
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    postalCode: "",
    city: "",
    latitude: "",
    longitude: "",
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0); // Starting from 0
  const [totalPages, setTotalPages] = useState(1); // Default to 1
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Ref for the sentinel element (used in IntersectionObserver)
  const observer = useRef();

  // Ref to track if initial fetch has been done
  const isInitialLoad = useRef(false);

  // Fetch Warehouses Function
  const fetchWarehouses = useCallback(async () => {
    if (!hasMore) return; // No more pages to fetch

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WAREHOUSE_API_URL}/warehouses?page=${currentPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch warehouses");
      }

      const data = await response.json();

      console.log("Fetched Warehouses:", data.warehouses);

      // Filter out any warehouses that already exist in the state to prevent duplicates
      setWarehouses((prevWarehouses) => {
        const newWarehouses = data.warehouses.filter(
          (newWarehouse) =>
            !prevWarehouses.some(
              (w) => w.warehouseId === newWarehouse.warehouseId
            )
        );
        return [...prevWarehouses, ...newWarehouses];
      });

      setTotalPages(data.totalPages);
      setHasMore(currentPage + 1 < data.totalPages);
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore]);

  // Initial Fetch Effect
  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchWarehouses();
      isInitialLoad.current = true; // Prevent future initial fetches
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IntersectionObserver Callback for Infinite Scroll
  const lastWarehouseRef = useCallback(
    (node) => {
      if (loading) return; // Do not observe while loading
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchWarehouses();
        }
      });

      if (node) observer.current.observe(node); // Observe the new node
    },
    [loading, hasMore, fetchWarehouses]
  );

  // Handle Input Changes in the Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Add Warehouse Form Submission
  const handleAddWarehouse = async (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.name ||
      !formData.street ||
      !formData.postalCode ||
      !formData.city ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("Please fill in all fields.");
      return;
    }

    // Construct the payload as per backend requirements
    const payload = {
      name: formData.name,
      warehouseAddress: {
        street: formData.street,
        postalCode: formData.postalCode,
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      },
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WAREHOUSE_API_URL}/warehouses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add warehouse.");
      }

      // Ensure the new warehouse has a unique warehouseId
      if (!data.warehouseId) {
        throw new Error("Invalid response from server.");
      }

      toast.success("Warehouse added successfully.");
      // window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      <div className="p-4 max-w-5xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-500">Warehouse List</h1>
          {/* Add New Warehouse Button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Add New Warehouse
          </button>
        </div>

        {/* Warehouse List */}
        <div className="grid gap-4">
          {warehouses.map((warehouse, index) => {
            if (warehouses.length === index + 1) {
              // Attach ref to the last warehouse element for infinite scroll
              return (
                <div
                  key={warehouse.warehouseId}
                  ref={lastWarehouseRef}
                  className="p-4 bg-white shadow-md rounded-lg"
                >
                  <h2 className="font-bold text-lg">{warehouse.name}</h2>
                  <p className="text-gray-600">
                    <span className="font-bold">City:</span> {warehouse.city}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Postal Code:</span>{" "}
                    {warehouse.postalCode}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Street:</span>{" "}
                    {warehouse.street}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Latitude:</span>{" "}
                    {warehouse.latitude}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Longitude:</span>{" "}
                    {warehouse.longitude}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Active:</span>{" "}
                    {warehouse.active ? "Yes" : "No"}
                  </p>
                </div>
              );
            } else {
              return (
                <div
                  key={warehouse.warehouseId}
                  className="p-4 bg-white shadow-md rounded-lg"
                >
                  <h2 className="font-bold text-lg">{warehouse.name}</h2>
                  <p className="text-gray-600">
                    <span className="font-bold">City:</span> {warehouse.city}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Postal Code:</span>{" "}
                    {warehouse.postalCode}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Street:</span>{" "}
                    {warehouse.street}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Latitude:</span>{" "}
                    {warehouse.latitude}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Longitude:</span>{" "}
                    {warehouse.longitude}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold">Active:</span>{" "}
                    {warehouse.active ? "Yes" : "No"}
                  </p>
                </div>
              );
            }
          })}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center mt-4">
            <p className="text-gray-700">Loading more warehouses...</p>
          </div>
        )}

        {/* No More Warehouses Indicator */}
        {!hasMore && !loading && warehouses.length > 0 && (
          <div className="flex justify-center items-center mt-4">
            <p className="text-gray-700">
              You have reached the end of the list.
            </p>
          </div>
        )}

        {/* Add Warehouse Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Add New Warehouse
              </h3>
              <form onSubmit={handleAddWarehouse}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="street"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Street
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="postalCode"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="city"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="latitude"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="longitude"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setFormData({
                        name: "",
                        street: "",
                        postalCode: "",
                        city: "",
                        latitude: "",
                        longitude: "",
                      });
                      setError("");
                    }}
                    className="bg-gray-300 text-gray-700 py-1 px-4 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
                  >
                    Add Warehouse
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
