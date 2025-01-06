"use client";

import React, { useState } from "react";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { FaMinus, FaPlus } from "react-icons/fa";

const ProductComponent = () => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  return (
    <Box bg="white" shadow="md" rounded="lg" overflow="hidden" w="200px">
      <Image src="/apple.png" alt="Apple" />
      <Box p={4}>
        <Text fontWeight="bold" mb={2}>
          Apple
        </Text>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="bold">Rp. 0.20</Text>
          <Flex align="center">
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-2 rounded"
              onClick={handleDecrement}
              disabled={quantity === 1}
            >
              <FaMinus />
            </button>
            <Text mx={2}>{quantity}</Text>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-2 rounded"
              onClick={handleIncrement}
            >
              <FaPlus />
            </button>
          </Flex>
        </Flex>
        <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
          Add to cart
        </button>
      </Box>
    </Box>
  );
};

export default ProductComponent;
