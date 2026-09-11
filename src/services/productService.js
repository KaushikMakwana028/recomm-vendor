const BASE_URL = 'http://localhost/kaushik/recomm/api/'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const getAuthHeadersJson = () => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
})

const handleResponse = async (response) => {
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Invalid response from server')
  }

  if (!response.ok) {
    throw new Error(data?.message || `HTTP error ${response.status}`)
  }

  if (!data.status) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

const productService = {
  /**
   * GET /categories
   * Fetches all product categories
   */
  getCategories: async () => {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'GET',
      headers: getAuthHeadersJson(),
    })
    return handleResponse(response)
  },

  /**
   * GET /get_products?type=vendor
   * Fetches vendor's own products
   */
  getVendorProducts: async () => {
    const response = await fetch(`${BASE_URL}/get_products?type=vendor`, {
      method: 'GET',
      headers: getAuthHeadersJson(),
    })
    return handleResponse(response)
  },

  /**
   * GET /get_products?search=query
   * Search existing products (for adding to vendor inventory)
   */
  searchProducts: async ({ search, category_id } = {}) => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category_id) params.append('category_id', category_id)

    const response = await fetch(`${BASE_URL}/get_products?${params}`, {
      method: 'GET',
      headers: getAuthHeadersJson(),
    })
    return handleResponse(response)
  },

  /**
   * GET /get_products?category_id=1
   * Filter products by category
   */
  getProductsByCategory: async (categoryId) => {
    const response = await fetch(`${BASE_URL}/get_products?category_id=${categoryId}`, {
      method: 'GET',
      headers: getAuthHeadersJson(),
    })
    return handleResponse(response)
  },

  /**
   * POST /add_vendor_product
   * Add new product (FormData with image)
   */
  addVendorProduct: async (productData) => {
    const formData = new FormData()

    const fields = {
      product_name: productData.product_name,
      brand: productData.brand,
      category_id: productData.category_id,
      unit: productData.unit,
      mrp: productData.mrp,
      selling_price: productData.selling_price,
      stock: productData.stock,
      description: productData.description,
    }

    // Append text fields
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value))
      }
    })

    // If linking to existing product
    if (productData.product_id) {
      formData.append('product_id', productData.product_id)
    }

    // Append image file
    if (productData.image instanceof File) {
      formData.append('image', productData.image)
    }

    const response = await fetch(`${BASE_URL}/add_vendor_product`, {
      method: 'POST',
      headers: getAuthHeaders(), // NO Content-Type for FormData
      body: formData,
    })

    return handleResponse(response)
  },

  /**
   * DELETE /delete_vendor_product/:id
   * Delete vendor product
   */
  deleteVendorProduct: async (productId) => {
    const response = await fetch(`${BASE_URL}/delete_vendor_product/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeadersJson(),
    })
    return handleResponse(response)
  },
  /**
 * POST /edit_vendor_product/:id
 * Update vendor product (FormData with image)
 */
  updateVendorProduct: async (productData) => {
    const formData = new FormData()

    const fields = {
      product_name: productData.product_name,
      brand: productData.brand,
      category_id: productData.category_id,
      unit: productData.unit,
      mrp: productData.mrp,
      selling_price: productData.selling_price,
      stock: productData.stock,
      description: productData.description,
    }

    // Append text fields
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value))
      }
    })

    // Append image if it's a new File; otherwise don't send (keep existing)
    if (productData.image instanceof File) {
      formData.append('image', productData.image)
    }

    const response = await fetch(`${BASE_URL}/edit_vendor_product/${productData.id}`, {
      method: 'POST',
      headers: getAuthHeaders(), // NO Content-Type for FormData
      body: formData,
    })

    return handleResponse(response)
  },
}

export default productService