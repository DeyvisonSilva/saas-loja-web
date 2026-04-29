"use client";

import { useState, useEffect } from 'react';
import './globals.css';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  isAvailable: boolean;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
  order: number;
  products: Product[];
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchCardapio();
  }, []);

  const fetchCardapio = async () => {
    try {
      // Use um tenant ID fixo para teste - SUBSTITUA PELO ID REAL DA SUA LOJA
      const tenantId = "cmokd943b0000r86pi8pw54st"; // COLOQUE O ID REAL AQUI
      const response = await fetch(`http://localhost:3000/cardapio/categories/${tenantId}`);
      const data = await response.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const totalCart = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return <div className="loading">Carregando cardápio...</div>;
  }

  const filteredProducts = categories
    .filter(cat => !selectedCategory || cat.id === selectedCategory)
    .flatMap(cat => cat.products)
    .filter(product => product.isAvailable && product.stock > 0);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🍔 Cardápio Digital</h1>
          <button onClick={() => setShowCart(true)} className="cart-button">
            🛒 Carrinho ({cart.length})
          </button>
        </div>
      </header>

      {/* Categories Tabs */}
      <div className="categories-tabs">
        <div className="tabs-container">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`tab-button ${selectedCategory === null ? 'tab-button-active' : 'tab-button-inactive'}`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`tab-button ${selectedCategory === cat.id ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <main>
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
              )}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">R$ {product.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(product)} className="add-button">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            Nenhum produto disponível no momento.
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2 className="cart-title">Seu Carrinho</h2>
              <button onClick={() => setShowCart(false)} className="close-cart">✕</button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-state">Seu carrinho está vazio</div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">R$ {item.price.toFixed(2)}</div>
                      <div>Qtd: {item.quantity}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{color: '#dc2626'}}>Remover</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">R$ {totalCart.toFixed(2)}</span>
                </div>
                <button className="checkout-button">
                  Finalizar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
