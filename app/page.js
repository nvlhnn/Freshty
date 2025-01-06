"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasMounted = useRef(false); // Ref to track mounting
  const observer = useRef(); // Ref for Intersection Observer

  console.log("Loaded Environment Variables:", process.env);

  console.log("API URL:", process.env.NEXT_PUBLIC_PRODUCT_API_URL);

  const fetchProducts = async (page = 0) => {
    if (isLoading || page >= totalPages) return;

    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products?page=${page}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();

      setProducts((prevProducts) => {
        const newProducts = result.products;
        const uniqueProducts = [
          ...prevProducts,
          ...newProducts.filter(
            (newProduct) =>
              !prevProducts.some(
                (existingProduct) =>
                  existingProduct.productId === newProduct.productId // Use productId consistently
              )
          ),
        ];
        return uniqueProducts;
      });

      setTotalPages(result.totalPages);
      setCurrentPage((prevPage) => prevPage + 1); // Increment page correctly
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      fetchProducts(); // Load the first page initially
      hasMounted.current = true;
    }
  }, []);

  const lastProductRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && currentPage < totalPages) {
            fetchProducts(currentPage);
          }
        },
        {
          root: null, // viewport
          rootMargin: "0px",
          threshold: 1.0,
        }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, currentPage, totalPages]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {products.map((product, index) => {
        if (index === products.length - 1) {
          return (
            <div ref={lastProductRef} key={product.productId}>
              <ProductCard product={product} />
            </div>
          );
        } else {
          return <ProductCard key={product.productId} product={product} />;
        }
      })}
      {isLoading && (
        <div className="flex justify-center items-center col-span-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
}
