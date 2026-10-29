//---Imports---
import { createContext, useContext, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Button from "./ui/Button";

const CartContext = createContext(null);

const cartStyles = `
.cart-nav-button {
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid rgba(74, 55, 44, 0.25);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--brown-700);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
}

.cart-nav-button:hover {
    background: var(--brown-700);
    color: var(--cream);
}

.cart-nav-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 5px;
    border-radius: 50%;
    background: var(--amber);
    color: var(--brown-900);
    font-size: 11px;
}

.cart-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1100;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(15, 13, 11, 0.48);
    cursor: pointer;
}

.cart-panel {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1101;
    display: flex;
    flex-direction: column;
    width: min(420px, 100%);
    height: 100%;
    padding: 32px 24px;
    background: var(--brown-900);
    color: var(--cream);
    box-shadow: -12px 0 40px rgba(0, 0, 0, 0.25);
    overflow-y: auto;
}

.cart-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.cart-panel-header h2 {
    margin: 4px 0 0;
    font-family: var(--font-heading);
    font-size: 26px;
    line-height: 1.15;
}

.cart-panel-close {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    background: transparent;
    color: var(--cream);
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
}

.cart-panel .cart-items {
    margin-top: 28px;
}

.cart-panel-total {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--cream);
    font-size: 18px;
}

.cart-panel-total strong {
    color: var(--amber-light);
}

.cart-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    color: var(--cream);
    font-size: 14px;
}

.cart-item > div:first-child {
    display: flex;
    flex-direction: column;
}

.cart-summary-label {
    color: var(--amber-light);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.cart-empty {
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.55);
    font-size: 14px;
}

.cart-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-item > div:first-child span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}

.cart-item-controls {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.cart-item-controls button {
    width: 28px;
    height: 28px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    background: transparent;
    color: var(--cream);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
}

.cart-item-controls button:hover {
    background: var(--amber);
    border-color: var(--amber);
    color: var(--brown-900);
}
`;

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
            <style>{cartStyles}</style>
            {children}
        </CartContext.Provider>
    );
}

function useCart() {
    const cart = useContext(CartContext);

    if (!cart) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return cart;
}

export function CartButton({ className = "", onClick }) {
    const { itemCount, setIsOpen } = useCart();

    return (
        <button
            type="button"
            className={`cart-nav-button ${className}`}
            onClick={() => {
                setIsOpen(true);
                onClick?.();
            }}
            aria-label={`Open cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        >
            <ShoppingBag size={20} strokeWidth={2.2} aria-hidden="true" />
            <span className="cart-nav-count">{itemCount}</span>
        </button>
    );
}

export function AddToCartButton({ product }) {
    const { addToCart } = useCart();

    return (
        <Button
            variant="primary"
            size="sm"
            className="w-full mt-3"
            onClick={() => addToCart(product)}
        >
            Add To Cart
        </Button>
    );
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
