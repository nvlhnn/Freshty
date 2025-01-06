import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; // Import AuthProvider

export const metadata = {
  title: "E-commerce App",
  description: "A simple e-commerce app built with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script 
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="SB-Mid-client-gVE4X3zaEcJZh1N2"
        ></script>
      </head>
      <body>
        <AuthProvider>
          {" "}
          {/* Wrap the entire app with AuthProvider */}
          <CartProvider>
            <div className="w-full flex flex-col">
              <NavbarWrapper />
              <main className="min-h-min">{children}</main>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
