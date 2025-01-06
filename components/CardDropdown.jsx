export default function CartDropdown({ cartItems }) {
  return (
    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded p-4 w-64">
      {cartItems.length > 0 ? (
        cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <img src={item.image} alt={item.name} className="w-8 h-8" />
            <span className="font-bold">{item.name}</span>
            <span>Rp. {item.price.toFixed(2)}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-500">Cart is empty</p>
      )}
      <button className="w-full bg-green-500 text-white mt-4 py-1 rounded">
        Proceed to checkout
      </button>
    </div>
  );
}
