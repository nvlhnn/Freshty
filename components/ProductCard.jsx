// components/ProductCard.jsx
"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const increment = () =>
    setQuantity((prev) => (prev < product.totalStock ? prev + 1 : prev));
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (quantity > product.totalStock) {
      alert("Cannot add more than available stock");
      return;
    }
    addToCart(product, quantity);
  };

  return (
    <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Product Image Placeholder */}
      {product.imageUrl ? (
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400 text-sm">{product.name.slice(0, 1)}</p>
        </div>
      )}

      {/* Product Name */}
      <h3 className="font-bold text-center text-black">{product.name}</h3>

      {/* Product Price */}
      <p className="text-gray-500 text-center mb-4">
        Rp. {product.price.toFixed(2)}
      </p>

      {/* Stock Information */}
      <p className="text-sm text-gray-600 text-center mb-4">
        {product.totalStock > 0
          ? `${product.totalStock} in stock`
          : "Out of stock"}
      </p>

      {/* Quantity Selector */}
      {product.totalStock > 0 ? (
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={decrement}
            className="text-gray-700 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            -
          </button>
          <span className="text-lg font-bold text-black">{quantity}</span>
          <button
            onClick={increment}
            className="text-gray-700 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            +
          </button>
        </div>
      ) : (
        // set margin so the space butoon is same
        <div className="h-11"></div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.totalStock === 0}
        className={`w-full py-2 rounded duration-200 ${
          product.totalStock === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-secondary text-green-prime hover:bg-green-prime hover:text-white"
        }`}
      >
        {product.totalStock === 0 ? "Out of Stock" : "Add to cart"}
      </button>
    </div>
  );
}
