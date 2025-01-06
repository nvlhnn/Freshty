import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    green: {
      500: "#00B74A", // Customize the green shade for your logo
    },
  },
  fonts: {
    heading: "Arial, sans-serif",
    body: "Arial, sans-serif",
  },
});

export default theme;
