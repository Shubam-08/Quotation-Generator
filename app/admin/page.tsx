"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, X } from "lucide-react";

interface IpRatingPrice {
  rating: string;
  price: number;
}

interface Product {
  _id: string;
  sku: string;
  category: string;
  categoryFilter?: string; // Main category for filtering
  application?: string;
  inputVoltage?: string;
  watt?: number;
  lumen?: string;
  beamAngle?: string;
  dimension?: string;
  cutOut?: string;
  ipRatings?: IpRatingPrice[]; // New structure with individual prices
  ipRating?: string[]; // Legacy field for backward compatibility
  price: number; // Legacy field
  images?: string[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [ipRatings, setIpRatings] = useState<IpRatingPrice[]>([]);
  const [newIpRating, setNewIpRating] = useState<string>("");
  const [newIpPrice, setNewIpPrice] = useState<string>("");

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/products");
        return;
      }
      fetchProducts();
    }
  }, [status, session?.user?.role]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isLikelyImageUrl = (value: string) => {
    // Basic heuristic: ends with common image extensions (ignores query params)
    try {
      const u = new URL(value);
      const pathname = u.pathname.toLowerCase();
      const hostname = u.hostname.toLowerCase();
      
      // Check for direct image extensions
      if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)$/.test(pathname)) {
        return true;
      }
      
      // Google Drive thumbnail URLs are valid direct image URLs
      if (hostname === "drive.google.com" && pathname.includes("/thumbnail")) {
        return true;
      }
      
      // Google User Content CDN
      if (hostname.includes("googleusercontent.com")) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  };

  const handleAddImage = async () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!isValidUrl(trimmed)) {
      setError("Please enter a valid image URL (http/https)");
      return;
    }

    // If not a likely direct image link, try to resolve via API (og:image)
    if (!isLikelyImageUrl(trimmed)) {
      try {
        const res = await fetch("/api/resolve-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const data = await res.json();
        if (res.ok && data.url && isValidUrl(data.url)) {
          setImages((prev) => [...prev, data.url]);
          setNewImageUrl("");
          return;
        } else {
          setError(data.error || "Could not resolve a direct image URL from the provided link");
          return;
        }
      } catch (e) {
        setError("Failed to resolve image URL. Please paste a direct image link ending with .jpg/.png/etc.");
        return;
      }
    }

    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddIpRating = async () => {
    const trimmed = newIpRating.trim().toUpperCase();
    const priceValue = parseFloat(newIpPrice);
    
    if (!trimmed) {
      setError("Please enter an IP rating");
      return;
    }
    
    if (!newIpPrice || isNaN(priceValue) || priceValue <= 0) {
      setError("Please enter a valid price for this IP rating");
      return;
    }
    
    // Validate IP rating format (e.g., IP20, IP30, IP40, IP65, etc.)
    if (!/^IP\d{2}$/.test(trimmed)) {
      setError("Please enter a valid IP rating (e.g., IP20, IP65)");
      return;
    }
    
    if (ipRatings.some(ip => ip.rating === trimmed)) {
      setError("This IP rating is already added");
      return;
    }
    
    // Convert USD to INR only when adding new product (not editing)
    let finalPrice = priceValue;
    if (!editingProduct) {
      try {
        const response = await fetch('/api/convert-usd-to-inr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usdAmount: priceValue })
        });
        const data = await response.json();
        if (response.ok && data.inrAmount) {
          finalPrice = Math.round(data.inrAmount * 10) / 10;
        }
      } catch (err) {
        console.error('Error converting USD to INR:', err);
        setError('Failed to convert currency. Please try again.');
        return;
      }
    }
    
    setIpRatings((prev) => [...prev, { rating: trimmed, price: finalPrice }]);
    setNewIpRating("");
    setNewIpPrice("");
    setError("");
  };

  const handleRemoveIpRating = (index: number) => {
    setIpRatings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
      setImages(product.images || []);
      // Migrate old format to new format if needed
      if (product.ipRatings && product.ipRatings.length > 0) {
        setIpRatings(product.ipRatings);
      } else if (product.ipRating && product.ipRating.length > 0) {
        // Convert old format to new format
        setIpRatings(product.ipRating.map(rating => ({ rating, price: product.price || 0 })));
      } else {
        setIpRatings([]);
      }
    } else {
      setEditingProduct(null);
      setFormData({});
      setImages([]);
      setIpRatings([]);
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({});
    setError("");
    setImages([]);
    setNewImageUrl("");
    setIpRatings([]);
    setNewIpRating("");
    setNewIpPrice("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingProduct
        ? `/api/products?id=${editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: images,
          ipRatings: ipRatings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Operation failed");
        return;
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      alert("An error occurred while deleting");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Redirecting to login...</div>
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-2">You don't have admin privileges.</p>
          <p className="text-sm text-gray-500 mb-4">
            Current role: {session?.user?.role || "none"}
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Products
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage products</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Watt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Ratings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (INR)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{product.category}</span>
                        <span className="text-xs text-blue-600 mt-0.5">
                          🔍 Filter: {product.categoryFilter || 'Not Set'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.watt}W
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {product.ipRatings && product.ipRatings.length > 0 ? (
                          product.ipRatings.map((ip, idx) => (
                            <div key={idx} className="flex flex-col bg-blue-50 border border-blue-200 rounded px-2 py-1">
                              <span className="text-xs font-semibold text-blue-800">{ip.rating}</span>
                              <span className="text-xs text-blue-600">₹{ip.price.toFixed(2)}</span>
                            </div>
                          ))
                        ) : product.ipRating && product.ipRating.length > 0 ? (
                          product.ipRating.map((rating, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded"
                              title="Old format - please edit to add prices"
                            >
                              {rating}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.ipRatings && product.ipRatings.length > 0 ? (
                        <span className="text-gray-400" title="Price varies by IP rating">Varies</span>
                      ) : (
                        <span>₹{product.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU / Model Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku || ""}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      placeholder="e.g., Surface Mounted Projector Light"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      📝 Full product category name (shown in product details)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Filter *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.categoryFilter || ""}
                      onChange={(e) => setFormData({ ...formData, categoryFilter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      placeholder="e.g., Projector Light"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      🔍 Main category shown in filter dropdown (e.g., "Projector Light", "LED Strip")
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application
                    </label>
                    <input
                      type="text"
                      value={formData.application || ""}
                      onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Input Voltage
                    </label>
                    <input
                      type="text"
                      value={formData.inputVoltage || ""}
                      onChange={(e) => setFormData({ ...formData, inputVoltage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Watt
                    </label>
                    <input
                      type="number"
                      value={formData.watt || ""}
                      onChange={(e) => setFormData({ ...formData, watt: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lumen
                    </label>
                    <input
                      type="text"
                      value={formData.lumen || ""}
                      onChange={(e) => setFormData({ ...formData, lumen: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beam Angle
                    </label>
                    <input
                      type="text"
                      value={formData.beamAngle || ""}
                      onChange={(e) => setFormData({ ...formData, beamAngle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Images (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg or Google Drive link"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports direct image URLs, ImgBB (i.ibb.co), and Google Drive links (must be publicly shared). 
                      <br />
                      <span className="text-blue-600">Tip: For best results, use ImgBB.com - upload your image and copy the "Direct link".</span>
                    </p>

                    {images.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {images.map((img, idx) => (
                          <li
                            key={`${img}-${idx}`}
                            className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded p-2"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-14 h-14 bg-white border rounded overflow-hidden flex items-center justify-center">
                                {/* Thumbnail preview; if it fails to load, it will show as broken */}
                                <img
                                  src={img}
                                  alt={`Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // fallback to a simple placeholder if load fails
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {!isLikelyImageUrl(img) && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 whitespace-nowrap">Not a direct image URL</span>
                                  )}
                                  <a
                                    href={img}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-600 hover:underline truncate block max-w-[480px]"
                                    title={img}
                                  >
                                    {img}
                                  </a>
                                </div>
                                {!isLikelyImageUrl(img) && (
                                  <p className="text-xs text-gray-500 mt-1">Tip: Use a direct image link ending with .jpg, .png, etc. For ImgBB use i.ibb.co/... links.</p>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-red-600 hover:text-red-700 text-sm shrink-0"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP Ratings with Prices {editingProduct ? '(INR)' : '(USD)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g., IP20, IP65"
                        value={newIpRating}
                        onChange={(e) => setNewIpRating(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddIpRating();
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder={editingProduct ? "Price (INR)" : "Price (USD)"}
                        value={newIpPrice}
                        onChange={(e) => setNewIpPrice(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddIpRating();
                          }
                        }}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddIpRating}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingProduct 
                        ? 'Add multiple IP ratings with their specific prices in INR (e.g., IP20 at ₹100, IP30 at ₹120)'
                        : 'Add multiple IP ratings with their specific prices in USD (will be converted to INR automatically)'}
                    </p>

                    {ipRatings.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ipRatings.map((ip, idx) => (
                          <div
                            key={`${ip.rating}-${idx}`}
                            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-blue-900">{ip.rating}</span>
                              <span className="text-xs text-blue-700">₹{ip.price.toFixed(2)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveIpRating(idx)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price {editingProduct ? '(INR)' : '(USD)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      disabled={ipRatings.length > 0}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {ipRatings.length > 0 
                        ? "Price is set per IP rating above" 
                        : editingProduct 
                          ? "Base price in INR (optional if using IP ratings)" 
                          : "Base price in USD - will be converted to INR (optional if using IP ratings)"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingProduct ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}