export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-green-secondary text-green-prime py-2 rounded hover:bg-green-prime hover:text-white duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
