"use client";

// import { useState, useEffect } from "react";

// type Post = {
//   id: number;
//   title: string;
//   content: string | null;
//   imageUrl: string | null;
// };

// export default function PostsPage() {
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [imageUrl, setImageUrl] = useState("");

//   useEffect(() => {
//     fetch("/api/posts")
//       .then(res => res.json())
//       .then(data => setPosts(data));
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await fetch("/api/posts", {
//       method: "POST",
//       body: JSON.stringify({ title, content, imageUrl }),
//       headers: { "Content-Type": "application/json" },
//     });
//     setTitle("");
//     setContent("");
//     setImageUrl("");
//     const data = await fetch("/api/posts").then(res => res.json());
//     setPosts(data);
//   };

//   const deletePost = async (id: number) => {
//     await fetch(`/api/posts/${id}`, { method: "DELETE" });
//     setPosts(posts.filter(p => p.id !== id));
//   };

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Manage Posts</h1>

//       <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-lg">
//         <input
//           type="text"
//           placeholder="Title"
//           className="w-full border p-2 rounded"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//         <textarea
//           placeholder="Content"
//           className="w-full border p-2 rounded"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Image URL"
//           className="w-full border p-2 rounded"
//           value={imageUrl}
//           onChange={(e) => setImageUrl(e.target.value)}
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Post</button>
//       </form>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {posts.map((post) => (
//           <div key={post.id} className="p-4 border rounded shadow-sm bg-white">
//             {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="rounded mb-2" />}
//             <h2 className="font-semibold">{post.title}</h2>
//             <p className="text-sm text-gray-600">{post.content}</p>
//             <button
//               onClick={() => deletePost(post.id)}
//               className="text-red-500 mt-2"
//             >
//               Delete
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }





















import React, { useState, useEffect } from 'react';
import { Upload, Package, CheckCircle, AlertCircle, Loader2, Trash2, Edit } from 'lucide-react';

// Simulated Firebase functions (replace with actual Firebase SDK)
const simulateUpload = (file:any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://example.com/uploads/${file.name}`);
    }, 1500);
  });
};

// const simulateFirestoreAdd = (data) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ id: Date.now().toString(), ...data });
//     }, 1000);
//   });
// };

const simulateFirestoreFetch = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stored = localStorage.getItem('products');
      resolve(stored ? JSON.parse(stored) : []);
    }, 500);
  });
};

// const simulateFirestoreDelete = (id) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const stored = localStorage.getItem('products');
//       const products = stored ? JSON.parse(stored) : [];
//       const filtered = products.filter(p => p.id !== id);
//       localStorage.setItem('products', JSON.stringify(filtered));
//       resolve();
//     }, 500);
//   });
// };

export default function SkincareDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    skinType: '',
    concerns: [],
    price: '',
    description: '',
    ingredients: '',
    howToUse: '',
    image: null
  });

  const categories = ['Cleanser', 'Moisturizer', 'Serum', 'Toner', 'Sunscreen', 'Mask', 'Treatment'];
  const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
  const concernOptions = ['Acne', 'Anti-aging', 'Hydration', 'Redness', 'Pigmentation', 'Sensitivity', 'Large Pores'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await simulateFirestoreFetch();
    //   setProducts(data);
    } catch (error) {
      showNotification('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message:any, type = 'success') => {
    // setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImageChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        // setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConcernToggle = (concern:any) => {
    // const concerns = formData.concerns.includes(concern)
    //   ? formData.concerns.filter(c => c !== concern)
    //   : [...formData.concerns, concern];
    // setFormData({ ...formData, concerns });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.category || !formData.image) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setUploading(true);
    try {
      // Upload image
      const imageUrl = await simulateUpload(formData.image);
      
      // Prepare product data
      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        skinType: formData.skinType,
        concerns: formData.concerns,
        price: formData.price,
        description: formData.description,
        ingredients: formData.ingredients,
        howToUse: formData.howToUse,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString()
      };

      // Add to Firestore
    //   const newProduct = await simulateFirestoreAdd(productData);
      
      // Update local storage
      const stored = localStorage.getItem('products');
      const products = stored ? JSON.parse(stored) : [];
    //   products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      
      setProducts(products);
      showNotification('Product added successfully!', 'success');
      
      // Reset form
      setFormData({
        name: '',
        brand: '',
        category: '',
        skinType: '',
        concerns: [],
        price: '',
        description: '',
        ingredients: '',
        howToUse: '',
        image: null
      });
      setImagePreview(null);
    } catch (error) {
      showNotification('Error uploading product', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
    //   await simulateFirestoreDelete(id);
    //   setProducts(products.filter(p => p.id !== id));
      showNotification('Product deleted successfully', 'success');
    } catch (error) {
      showNotification('Error deleting product', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      
      {/* {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )} */}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Package className="text-teal-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Skincare Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Manage your skincare products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    ) : (
                      <div className="py-8">
                        <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                        <p className="text-gray-600">Click to upload image</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Hydrating Facial Cleanser"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., CeraVe"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Skin Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Type
                </label>
                <select
                  value={formData.skinType}
                  onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select skin type</option>
                  {skinTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Concerns
                </label>
                <div className="flex flex-wrap gap-2">
                  {concernOptions.map(concern => (
                    <button
                      key={concern}
                      type="button"
                      onClick={() => handleConcernToggle(concern)}
                    //   className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    //     formData.concerns.includes(concern)
                    //       ? 'bg-teal-500 text-white'
                    //       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    //   }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="29.99"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Product description..."
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Ingredients
                </label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Hyaluronic Acid, Niacinamide..."
                />
              </div>

              {/* How to Use */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How to Use
                </label>
                <textarea
                  value={formData.howToUse}
                  onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Apply twice daily..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Add Product
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Products List */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Products ({products.length})</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-teal-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No products yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first product to get started</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 transition-colors">
                    <div className="flex gap-4">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                            {product.category}
                          </span>
                          {product.skinType && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {product.skinType}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
}