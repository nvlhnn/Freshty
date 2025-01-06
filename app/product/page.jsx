"use client"; 

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

const products = [
  { id: 1, name: "Watermelon", price: 1.0, image: "/watermelon.png" },
  { id: 2, name: "Apple", price: 0.2, image: "/apple.png" },
  { id: 3, name: "Pineapple", price: 1.05, image: "/pineapple.png" },
  { id: 4, name: "Banana", price: 0.2, image: "/banana.png" },
];

export default function page() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  return (
    <>
      <Navbar cartItems={cartItems} />
      <div className="grid grid-cols-4 gap-4 p-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>
    </>
  );
}
