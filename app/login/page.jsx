"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage(null); // Clear previous errors

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password.");
      }

      const data = await response.json();

      document.cookie = `token=${data.token}; path=/;`;
      document.cookie = `user=${JSON.stringify({
        userId: data.userId,
        role: data.role,
        email: data.email,
        name: data.name,
      })}; path=/;`;

      // Redirect based on role
      if (data.role === "SUPER_ADMIN") {
        router.push("/admin"); // Redirect to admin dashboard
      } else {
        window.location.href = "/";
        // router.push("/"); // Redirect to user dashboard
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-500 mb-6">
          Login
        </h2>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-green-secondary text-green-prime py-2 rounded hover:bg-green-prime hover:text-white duration-200"
          >
            Login
          </button>
        </form>

        {/* Register Redirect */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-green-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
