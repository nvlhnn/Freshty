"use client"; // Mark the file as a client component

import { createContext, useContext, useState } from "react";
import { getToken } from "@/lib/cookie"; // Import the getToken function

// Create the Cart Context
const CartContext = createContext();

// Create a Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantityToAdd) => {
    let cartItem = cartItems.find(
      (item) => item.productId === product.productId
    );

    if (cartItem && cartItem.quantity + quantityToAdd > product.totalStock) {
      alert("Cannot add more than available stock");
      return;
    }

    setCartItems((prevItems) => {
      if (cartItem) {
        return prevItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: quantityToAdd }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const checkout = async (address) => {
    try {
      // Calculate total price and prepare items for the order
      const totalPrice = cartItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );

      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subTotal: item.price * item.quantity,
      }));

      // Prepare request body
      const orderData = {
        price: totalPrice,
        items: items,
        address: {
          street: address.street,
          postalCode: address.postalCode,
          city: address.city,
          latitude: address.latitude,
          longitude: address.longitude,
        },
      };

      // Make the API request
      const response = await fetch(`${process.env.NEXT_PUBLIC_ORDER_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Handle success (maybe clear cart, show success message, etc.)
        alert("Order placed successfully!");
        setCartItems([]); // Clear the cart after successful checkout
        window.location.href = "/orders";
      } else {
        // Handle failure
        const errorData = await response.json();
        alert(`Failed to place order: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for accessing the Cart Context
export const useCart = () => useContext(CartContext);
