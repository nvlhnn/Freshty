import Cookies from "js-cookie";

// Function to get the token from cookies
export const getToken = () => {
  return Cookies.get("token"); // Retrieve the token stored in the 'token' cookie
};

// Function to set a token in the cookies
export const setToken = (token) => {
  Cookies.set("token", token, { expires: 7, secure: true, sameSite: "Strict" }); // Optional settings: expiry, secure flag
};

export const getUser = () => {
  return JSON.parse(Cookies.get("user"));
}
// Function to remove the token from cookies
export const removeToken = () => {
  Cookies.remove("token");
};
