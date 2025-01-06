"use client"; // Required for using hooks in this component

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // Import AuthContext
import {
  FiShoppingCart,
  FiBox,
  FiUser,
  FiFileText,
  FiLogIn,
} from "react-icons/fi"; // Import icons
import { AiOutlineDelete } from "react-icons/ai";
import Button from "./Button";
import Link from "next/link";

export default function Navbar() {
  const { cartItems, removeFromCart, checkout } = useCart();
  const { user, logout } = useAuth(); // Get user and logout function from AuthContext
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [orderConfirmationVisible, setOrderConfirmationVisible] =
    useState(false);
  const [address, setAddress] = useState({
    street: "",
    postalCode: "",
    city: "",
    latitude: "",
    longitude: "",
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckout = () => {
    if (
      !address.street ||
      !address.postalCode ||
      !address.city ||
      !address.latitude ||
      !address.longitude
    ) {
      alert("Please fill in all address fields.");
      return;
    }
    // Pass address to checkout function
    checkout(address);
    setOrderConfirmationVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const hideDropdown = () => {
    setDropdownVisible(false);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white px-4 py-3 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-500">
          Freshty
        </Link>

        {/* Navbar Icons */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Products Icon */}
              <Link
                href="/"
                className="text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-full"
                title="Products"
              >
                <FiBox />
              </Link>

              {/* Orders Icon */}
              <Link
                href="/orders"
                className="text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-full"
                title="Orders"
              >
                <FiFileText />
              </Link>

              {/* User Icon */}
              <div className="relative">
                <button
                  className="text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-full"
                  title="User"
                  onClick={toggleDropdown}
                  // onBlur={hideDropdown} // Hide dropdown when the button loses focus
                >
                  <FiUser />
                </button>

                {dropdownVisible && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white shadow-2xl rounded-lg p-2 z-50"
                    // Hide dropdown when the mouse leaves
                  >
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-green-prime">
                        <span className="text-gray-500">Welcome,</span>{" "}
                        {user.name}
                      </p>
                      <p className="font-bold text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-[10ch]"></p>
                    </div>
                    <button
                      onClick={() => {
                        // Add logout logic here
                        logout();
                        // refresh page
                        window.location.reload();
                        hideDropdown();
                      }}
                      className="w-full text-left text-red-500 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <div className="relative">
                <button
                  onClick={toggleCart}
                  className="text-2xl p-2 hover:bg-gray-100 rounded-full relative"
                  title="Cart"
                >
                  <FiShoppingCart />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50">
                    <h3 className="font-bold mb-2">Your Cart</h3>
                    <div className="divide-y divide-gray-200">
                      {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8"
                              />
                              <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">
                                Rp. {(item.price * item.quantity).toFixed(2)}
                              </p>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <AiOutlineDelete />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center">
                          Cart is empty
                        </p>
                      )}
                    </div>

                    <Button
                      className="py-2 rounded mt-4"
                      onClick={setOrderConfirmationVisible}
                    >
                      Proceed to checkout
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Guest User: Show only Login Icon
            <Link
              href="/login"
              className="text-gray-700 text-xl p-2 hover:bg-gray-100 rounded-full"
              title="Login"
            >
              <FiLogIn />
            </Link>
          )}
        </div>
      </div>

      {orderConfirmationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Make Order</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to make the order ?
              <span className="font-bold text-gray-800"></span>{" "}
            </p>

            {/* Address Form */}
            <div className="mb-4">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700"
              >
                Street Address
              </label>
              <input
                id="street"
                name="street"
                type="text"
                value={address.street}
                onChange={handleAddressChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="123 Main St"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-gray-700"
              >
                Postal Code
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                value={address.postalCode}
                onChange={handleAddressChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="12345"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={address.city}
                onChange={handleAddressChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Metropolis"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                value={address.latitude}
                onChange={handleAddressChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="37.7749"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                value={address.longitude}
                onChange={handleAddressChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="-122.4194"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setOrderConfirmationVisible(false)}
                className="bg-gray-300 text-gray-700 py-1 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
