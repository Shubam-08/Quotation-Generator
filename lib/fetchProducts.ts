// lib/fetchProducts.ts
export async function fetchProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products', {
      cache: 'no-store', // ensures latest data
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await res.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return []; // return empty array if error
  }
}
