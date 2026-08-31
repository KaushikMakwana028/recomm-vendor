const BASE_URL = 'http://localhost/kaushik_php/ci_project/recomm/api/'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const handleResponse = async (response) => {
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Invalid JSON response from server')
  }

  if (!response.ok) {
    throw new Error(data?.message || `HTTP error ${response.status}`)
  }

  if (!data.status) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

const offerService = {
  // GET /get_offers
  getAllOffers: async () => {
    const response = await fetch(`${BASE_URL}/get_offers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /add_offer
  createOffer: async (offerData) => {
    const response = await fetch(`${BASE_URL}/add_offer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(offerData),
    })
    return handleResponse(response)
  },

  // POST /edit_offer/:id
  updateOffer: async (offerId, offerData) => {
    const response = await fetch(`${BASE_URL}/edit_offer/${offerId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(offerData),
    })
    return handleResponse(response)
  },

  // DELETE /delete_offer/:id
  deleteOffer: async (offerId) => {
    const response = await fetch(`${BASE_URL}/delete_offer/${offerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

export default offerService