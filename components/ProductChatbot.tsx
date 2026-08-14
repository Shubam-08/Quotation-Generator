'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSuggestion[];
  timestamp: Date;
};

type ProductSuggestion = {
  _id: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  watt?: number;
  lumen?: string;
  beamAngle?: string;

  ipRating?: string;
  application?: string;
  relevanceScore?: number;
};

export default function ProductChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! 👋 I'm your lighting assistant.\n\nTo get started, type:\n• \"categories\" - to see all available product categories\n• Or directly tell me what you need (e.g., \"bollard lights\", \"linear lights\")\n\nI can also answer questions like:\n• \"What's the average price?\"\n• \"How many products do you have?\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send conversation history for context
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input.trim(),
          history: conversationHistory
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        products: data.products || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: ProductSuggestion) => {
    addToCart(product as any);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-yellow-400 hover:bg-yellow-500 text-black p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center gap-2 group"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
            Ask about products
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-full">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Product Assistant</h3>
                <p className="text-xs text-black/70">Ask me anything about our products</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/10 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {/* Product Suggestions */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product._id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-yellow-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-gray-900">{product.sku}</h4>
                              <p className="text-xs text-gray-600 mt-1">{product.category}</p>
                              {product.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {product.watt && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    {product.watt}W
                                  </span>
                                )}
                                {product.lumen && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {product.lumen}
                                  </span>
                                )}
                                {product.ipRating && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                    {product.ipRating}
                                  </span>
                                )}
                                {product.application && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    {product.application}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-yellow-600 text-sm">
                                ${product.price.toFixed(2)}
                              </p>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs opacity-60 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about products..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-sm text-gray-900 placeholder-gray-400 bg-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
