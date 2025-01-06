"use client";

import { useState, useEffect } from "react";
import { getToken } from "@/lib/cookie";
import { toast, ToastContainer } from "react-toastify";

export default function AdminProductsPage() {
  // State Variables
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stocks, setStocks] = useState({}); // Object for easier access
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [newStockQuantity, setNewStockQuantity] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [error, setError] = useState("");
  const [currentStock, setCurrentStock] = useState(null); // Current stock for selected product and warehouse

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0); // Starting from 0
  const [totalPages, setTotalPages] = useState(1); // Default to 1

  // Fetch Products with Pagination
  useEffect(() => {
    const fetchProducts = async (page) => {
      setLoadingProducts(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`, // Include Authorization if required
              // "Content-Type": "application/json", // Not needed for GET
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages); // Set total pages from API response

        // Initialize stocks based on products' totalStock
        const initialStocks = {};
        data.products.forEach((product) => {
          initialStocks[product.productId] = product.totalStock; // Initialize total stock
        });
        setStocks(initialStocks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts(currentPage);
  }, [currentPage]);

  // Fetch Warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WAREHOUSE_API_URL}/warehouses?page=0&size=100`,
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
        setWarehouses(data.warehouses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingWarehouses(false);
      }
    };

    // Fetch warehouses only after products are fetched
    if (products.length > 0) {
      fetchWarehouses();
    }
  }, [products]);

  // Calculate total stock for a product
  const getTotalStock = (productId) => {
    return stocks[productId] || 0;
  };

  // Fetch and set current stock when selectedWarehouseId or selectedProduct changes
  useEffect(() => {
    const fetchCurrentStock = async () => {
      if (selectedProduct && selectedWarehouseId) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_WAREHOUSE_API_URL}/warehouses/stocks?warehouseId=${selectedWarehouseId}&productId=${selectedProduct.productId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch stock.");
          }
          const data = await response.json();
          setCurrentStock(data.quantity); // Set the current stock in state
        } catch (error) {
          console.error("Error fetching stock:", error);
          setCurrentStock("Error");
        }
      } else {
        setCurrentStock(null); // Reset if no product or warehouse selected
      }
    };

    fetchCurrentStock();
  }, [selectedProduct, selectedWarehouseId]);

  // Update stock quantity
  const handleUpdateStock = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !selectedWarehouseId) {
      setError("Please select a product and warehouse.");
      return;
    }

    const quantity = parseInt(newStockQuantity, 10);
    if (isNaN(quantity)) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (quantity + currentStock < 0) {
      alert("Cannot remove more than available stock");
      return;
    }

    const stockChange = {
      productId: selectedProduct.productId,
      warehouseId: selectedWarehouseId,
      quantity: quantity,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WAREHOUSE_API_URL}/warehouses/stocks/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`, // Include Authorization if required
          },
          body: JSON.stringify(stockChange),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update stock.");
      }

      // Update local stock state
      setStocks((prevStocks) => ({
        ...prevStocks,
        [selectedProduct.productId]:
          prevStocks[selectedProduct.productId] + quantity,
      }));

      // Optionally, update current stock
      setCurrentStock((prev) =>
        typeof prev === "number" ? prev + quantity : prev
      );

      setIsModalOpen(false);
      setSelectedProduct(null);
      setNewStockQuantity("");
      setError("");

      toast.success("Stock updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle adding new product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProductName || !newProductPrice || !selectedImage) {
      setError("Please enter product name, price, and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProductName);
    formData.append("price", newProductPrice);
    formData.append("image", selectedImage);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`, // Include Authorization if required
          // Note: Do NOT set 'Content-Type' to 'multipart/form-data'; the browser sets it automatically
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product.");
      }

      // Add the new product to the state
      setProducts((prevProducts) => [...prevProducts, data]);

      // Initialize stock for the new product across all warehouses
      setStocks((prevStocks) => ({
        ...prevStocks,
        [data.productId]: 0, // Initialize total stock to 0
      }));

      setNewProductName("");
      setNewProductPrice("");
      setSelectedImage(null);
      setIsAddProductModalOpen(false);
      setError("");

      toast.success("Product added successfully.");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle opening the modal
  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setSelectedWarehouseId("");
    setNewStockQuantity("");
    setCurrentStock(null);
    setError("");
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedWarehouseId("");
    setNewStockQuantity("");
    setCurrentStock(null);
    setError("");
  };

  // Pagination Handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
      // Reset stocks when page changes
      setStocks({});
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
      // Reset stocks when page changes
      setStocks({});
    }
  };

  // Loading Indicators
  if (loadingProducts || loadingWarehouses) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-500">Products</h1>
          {/* Add New Product Button */}
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-green-200">
              <tr>
                <th className="text-left p-4">Product Name</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Total Stock</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.productId} className="border-b">
                    <td className="p-4">{product.name}</td>
                    <td className="p-4">
                      Rp. {parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="p-4">{getTotalStock(product.productId)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => openModal(product)}
                        className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                      >
                        Change Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded ${
              currentPage === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Previous
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages - 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Next
          </button>
        </div>

        {/* Change Stock Modal */}
        {isModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Change Stock for {selectedProduct.name}
              </h3>
              <form onSubmit={handleUpdateStock}>
                <div className="mb-4">
                  <label
                    htmlFor="warehouse"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Select Warehouse
                  </label>
                  <select
                    id="warehouse"
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse.warehouseId}
                        value={warehouse.warehouseId}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedWarehouseId && (
                  <div className="mb-4">
                    <p className="text-gray-700 font-bold">
                      Current Stock:{" "}
                      {currentStock !== null ? currentStock : "Loading..."}
                    </p>
                  </div>
                )}
                <div className="mb-4">
                  <label
                    htmlFor="newStock"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Stock Change Quantity
                  </label>
                  <input
                    type="number"
                    id="newStock"
                    value={newStockQuantity}
                    onChange={(e) => setNewStockQuantity(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <small className="text-gray-500">
                    Enter positive number to add stock or negative to reduce.
                  </small>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-700 py-1 px-4 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddProductModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Add New Product
              </h3>
              <form onSubmit={handleAddProduct}>
                <div className="mb-4">
                  <label
                    htmlFor="productName"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="productPrice"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Product Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="productPrice"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="productImage"
                    className="block text-gray-700 font-bold mb-2"
                  >
                    Product Image
                  </label>
                  <input
                    type="file"
                    id="productImage"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddProductModalOpen(false);
                      setNewProductName("");
                      setNewProductPrice("");
                      setSelectedImage(null);
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
                    Add Product
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
