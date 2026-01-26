import React from 'react';


// Chưa dùng đến file này chưa cần chỉnh

const ProductDetailPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">Image</div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Product Title</h1>
          <p className="text-gray-700 mb-4">Short description of the product.</p>
          <div className="mb-4">Price</div>
          <div className="space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Add to Cart</button>
            <button className="px-4 py-2 bg-gray-100 rounded">Wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
