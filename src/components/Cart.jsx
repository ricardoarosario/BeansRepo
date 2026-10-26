import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const addToCart = (product) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.name === product.name);

            if (existingItem) {
                return currentItems.map((item) =>
                    item.name === product.name
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentItems, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productName, change) => {
        setItems((currentItems) =>
            currentItems
                .map((item) =>
                    item.name === productName
                        ? { ...item, quantity: item.quantity + change }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, itemCount, addToCart, updateQuantity, isOpen, setIsOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const cart = useContext(CartContext);

    if (!cart) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return cart;
}

export function CartPanel() {
    const { items, updateQuantity, isOpen, setIsOpen } = useCart();
    const total = items.reduce(
        (cartTotal, item) => cartTotal + Number.parseFloat(item.price) * item.quantity,
        0
    );

    if (!isOpen) return null;

    return (
        <>
            <button
                type="button"
                className="cart-backdrop"
                aria-label="Close cart"
                onClick={() => setIsOpen(false)}
            />
            <aside className="cart-panel" aria-label="Shopping cart">
                <div className="cart-panel-header">
                    <div>
                        <span className="cart-summary-label">Your Cart</span>
                        <h2>Fresh beans, ready to go</h2>
                    </div>
                    <button
                        type="button"
                        className="cart-panel-close"
                        aria-label="Close cart"
                        onClick={() => setIsOpen(false)}
                    >
                        ×
                    </button>
                </div>

                {items.length === 0 ? (
                    <p className="cart-empty">Your cart is empty. Add a bag of beans to get started.</p>
                ) : (
                    <div className="cart-items">
                        {items.map((item) => (
                            <div className="cart-item" key={item.name}>
                                <div>
                                    <strong>{item.name}</strong>
                                    <span>${Number.parseFloat(item.price).toFixed(2)} each</span>
                                </div>
                                <div className="cart-item-controls">
                                    <button
                                        type="button"
                                        aria-label={`Decrease ${item.name} quantity`}
                                        onClick={() => updateQuantity(item.name, -1)}
                                    >
                                        −
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        type="button"
                                        aria-label={`Increase ${item.name} quantity`}
                                        onClick={() => updateQuantity(item.name, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="cart-panel-total">
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                </div>
            </aside>
        </>
    );
}
