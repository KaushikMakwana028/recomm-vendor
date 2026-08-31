import { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { FaSave, FaTimes, FaSearch, FaBox, FaCamera } from 'react-icons/fa'
import {
    fetchCategories,
    searchProducts,
    addVendorProduct,
    clearProductError,
    clearSearchResults,
} from '../redux/productSlice'
import { useLanguage } from '../contexts/LanguageContext'

const AddProduct = ({ onClose }) => {
    const dispatch = useDispatch()
    const { t } = useLanguage()

    const { categories, searchResults, searchLoading, actionLoading, actionError } =
        useSelector((s) => s.product)

    const [mode, setMode] = useState('new') // 'new' or 'existing'
    const [searchTerm, setSearchTerm] = useState('')
    const [searchCategory, setSearchCategory] = useState('') // category filter for existing search
    const [selectedExisting, setSelectedExisting] = useState(null)
    const [existingImageUrl, setExistingImageUrl] = useState(null) // locked image from existing product

    const [formData, setFormData] = useState({
        product_id: null,
        product_name: '',
        brand: '',
        category_id: '',
        unit: 'kg',
        mrp: '',
        selling_price: '',
        stock: '',
        description: '',
        image: null,
    })

    const [previewUrl, setPreviewUrl] = useState(null)   // user-uploaded image preview
    const [errors, setErrors] = useState({})

    const units = ['kg', 'litre', 'packet', 'piece', 'dozen', 'gram', 'ml']

    // ── Fetch categories on mount ──────────────────────────
    useEffect(() => {
        if (categories.length === 0) dispatch(fetchCategories())
    }, [dispatch, categories.length])

    // ── Cleanup on unmount ─────────────────────────────────
    useEffect(() => {
        return () => {
            dispatch(clearSearchResults())
            dispatch(clearProductError())
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [dispatch, previewUrl])

    // ── Search with both search term + category filter ─────
    // Builds params: search, category_id, or both — matches all 3 API variants
    const handleSearch = () => {
        const hasSearch = searchTerm.trim().length > 0
        const hasCategory = searchCategory !== ''

        // Need at least one filter
        if (!hasSearch && !hasCategory) return

        dispatch(searchProducts({
            search: hasSearch ? searchTerm.trim() : undefined,
            category_id: hasCategory ? searchCategory : undefined,
        }))
    }

    // ── Select existing product ────────────────────────────
    const handleSelectExisting = (product) => {
        setSelectedExisting(product)

        // Lock the product image from API — not changeable
        setExistingImageUrl(product.image || null)

        setFormData({
            product_id: product.id,
            product_name: product.name,
            brand: product.brand || '',
            category_id: product.category_id || '',
            unit: 'kg',
            mrp: '',
            selling_price: '',
            stock: '',
            description: product.description || '',
            image: null, // user cannot upload image for existing product
        })

        // Clear any user-uploaded preview
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }

        dispatch(clearSearchResults())
        setSearchTerm('')
    }

    // ── Clear existing selection ───────────────────────────
    const handleClearExisting = () => {
        setSelectedExisting(null)
        setExistingImageUrl(null)
        setFormData({
            product_id: null,
            product_name: '',
            brand: '',
            category_id: '',
            unit: 'kg',
            mrp: '',
            selling_price: '',
            stock: '',
            description: '',
            image: null,
        })
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        setErrors({})
    }

    // ── Text input change ──────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    // ── Image upload (only for new products) ───────────────
    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setFormData((prev) => ({ ...prev, image: file }))
        if (errors.image) setErrors((prev) => ({ ...prev, image: '' }))
    }

    // ── Validation ─────────────────────────────────────────
    const validate = () => {
        const e = {}

        if (!formData.product_name.trim())
            e.product_name = 'Product name is required'

        if (!formData.brand.trim())
            e.brand = 'Brand is required'

        if (!formData.category_id)
            e.category_id = 'Category is required'

        if (!formData.mrp || Number(formData.mrp) <= 0)
            e.mrp = 'Valid MRP is required'

        if (!formData.selling_price || Number(formData.selling_price) <= 0)
            e.selling_price = 'Valid selling price is required'
        else if (Number(formData.selling_price) > Number(formData.mrp))
            e.selling_price = 'Selling price cannot exceed MRP'

        if (!formData.stock || Number(formData.stock) < 0)
            e.stock = 'Valid stock quantity is required'

        // Image required only for new products
        // For existing products, the image comes from the API (existingImageUrl)
        if (!selectedExisting && !formData.image)
            e.image = 'Product image is required'

        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ── Submit ─────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        // For existing products, image is sent as URL string (not File)
        const payload = { ...formData }
        if (selectedExisting && existingImageUrl) {
            payload.image = existingImageUrl
        }

        const result = await dispatch(addVendorProduct(payload))
        if (addVendorProduct.fulfilled.match(result)) {
            onClose(true)
        }
    }

    // ── Which image to show ────────────────────────────────
    // existingImageUrl → locked from API (not removable)
    // previewUrl       → user-uploaded (removable)
    const displayImage = existingImageUrl || previewUrl
    const isImageLocked = !!existingImageUrl  // true = existing product image, cannot remove

    return (
        <>
            <style>{`
                .ap-tab-btn {
                    flex: 1; padding: 0.625rem 1rem;
                    border: 1.5px solid #e5e7eb; background: white;
                    border-radius: 10px; cursor: pointer;
                    font-size: 0.875rem; font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    color: #6b7280; transition: all 0.2s;
                }
                .ap-tab-btn.active {
                    border-color: #00204E; background: #f0f4ff; color: #00204E;
                }
                .ap-tab-btn:hover:not(.active) { background: #f9fafb; }

                /* ── Search area ── */
                .ap-search-filters {
                    display: flex; gap: 0.5rem;
                    margin-top: 0.75rem; flex-wrap: wrap;
                }
                .ap-search-input {
                    flex: 1; min-width: 140px;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    padding: 0.625rem 1rem; font-size: 0.875rem;
                    font-family: 'Poppins', sans-serif; outline: none;
                }
                .ap-search-input:focus {
                    border-color: #34A129;
                    box-shadow: 0 0 0 3px rgba(52,161,41,0.1);
                }
                .ap-search-cat {
                    min-width: 140px; max-width: 180px;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    padding: 0.625rem 0.875rem; font-size: 0.875rem;
                    font-family: 'Poppins', sans-serif; outline: none;
                    color: #374151; background: white;
                }
                .ap-search-cat:focus {
                    border-color: #34A129;
                    box-shadow: 0 0 0 3px rgba(52,161,41,0.1);
                }
                .ap-search-btn {
                    padding: 0.625rem 1.25rem; border: none;
                    border-radius: 10px; background: #00204E;
                    color: white; font-weight: 600; cursor: pointer;
                    font-family: 'Poppins', sans-serif; font-size: 0.875rem;
                    display: flex; align-items: center; gap: 6px;
                    white-space: nowrap;
                }
                .ap-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .ap-search-results {
                    max-height: 200px; overflow-y: auto;
                    border: 1px solid #e5e7eb; border-radius: 10px;
                    margin-top: 0.75rem;
                }
                .ap-search-item {
                    display: flex; align-items: center; gap: 0.75rem;
                    padding: 0.75rem; border-bottom: 1px solid #f3f4f6;
                    cursor: pointer; transition: background 0.15s;
                }
                .ap-search-item:last-child { border-bottom: none; }
                .ap-search-item:hover { background: #f9fafb; }
                .ap-search-img {
                    width: 40px; height: 40px; border-radius: 8px;
                    object-fit: cover; border: 1px solid #e5e7eb;
                    flex-shrink: 0;
                }
                .ap-search-ph {
                    width: 40px; height: 40px; border-radius: 8px;
                    background: #f3f4f6; display: flex; flex-shrink: 0;
                    align-items: center; justify-content: center;
                    color: #9ca3af;
                }

                /* ── Selected banner ── */
                .ap-selected-banner {
                    display: flex; align-items: center;
                    justify-content: space-between; gap: 8px;
                    background: #f0fdf4; border: 1px solid #bbf7d0;
                    border-radius: 10px; padding: 0.75rem 1rem;
                    margin-top: 0.75rem; font-size: 0.875rem;
                    color: #065f46;
                }
                .ap-selected-clear {
                    background: none; border: none; cursor: pointer;
                    color: #065f46; font-size: 0.75rem; font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    display: flex; align-items: center; gap: 4px;
                    padding: 2px 6px; border-radius: 6px;
                    transition: background 0.15s; white-space: nowrap;
                }
                .ap-selected-clear:hover { background: #dcfce7; }

                /* ── Form fields ── */
                .ap-label {
                    font-size: 0.8125rem; font-weight: 600;
                    color: #374151; margin-bottom: 6px; display: block;
                }
                .ap-label span { color: #ef4444; margin-left: 2px; }

                .ap-input, .ap-select, .ap-textarea {
                    width: 100%; border: 1.5px solid #e5e7eb;
                    border-radius: 10px; padding: 0.625rem 0.875rem;
                    font-size: 0.875rem; font-family: 'Poppins', sans-serif;
                    color: #111827; outline: none; transition: all 0.2s;
                }
                .ap-input:focus, .ap-select:focus, .ap-textarea:focus {
                    border-color: #34A129;
                    box-shadow: 0 0 0 3px rgba(52,161,41,0.1);
                }
                .ap-input.error, .ap-select.error { border-color: #ef4444; }
                .ap-input:disabled, .ap-select:disabled, .ap-textarea:disabled {
                    background: #f9fafb; color: #6b7280; cursor: not-allowed;
                }
                .ap-textarea { resize: vertical; min-height: 80px; }

                .ap-error {
                    display: flex; align-items: center; gap: 4px;
                    margin-top: 0.375rem; font-size: 0.78rem;
                    color: #ef4444; font-weight: 500;
                }

                /* ── Image zone ── */
                .ap-upload-zone {
                    border: 2px dashed #e5e7eb; border-radius: 12px;
                    padding: 2rem; text-align: center; cursor: pointer;
                    transition: all 0.2s; position: relative;
                }
                .ap-upload-zone:hover {
                    border-color: #34A129; background: #f0fdf4;
                }
                .ap-upload-zone input {
                    position: absolute; inset: 0; opacity: 0;
                    cursor: pointer; width: 100%; height: 100%;
                }
                .ap-upload-icon {
                    width: 48px; height: 48px; border-radius: 12px;
                    background: #f3f4f6; margin: 0 auto 12px;
                    display: flex; align-items: center; justify-content: center;
                    color: #6b7280; font-size: 1.25rem;
                }
                .ap-upload-text {
                    font-size: 0.875rem; font-weight: 500;
                    color: #374151; margin: 0 0 4px;
                }
                .ap-upload-hint { font-size: 0.75rem; color: #9ca3af; margin: 0; }

                /* ── Image preview ── */
                .ap-preview-wrap {
                    position: relative; display: inline-block; width: 100%;
                }
                .ap-preview {
                    width: 100%; height: 160px; object-fit: cover;
                    border-radius: 10px; border: 1px solid #e5e7eb;
                    display: block;
                }
                .ap-preview-badge {
                    position: absolute; top: 8px; left: 8px;
                    background: rgba(0,32,78,0.75); color: white;
                    font-size: 0.7rem; font-weight: 600; padding: 3px 8px;
                    border-radius: 6px; pointer-events: none;
                }
                .ap-preview-remove {
                    position: absolute; top: 8px; right: 8px;
                    background: rgba(0,0,0,0.7); color: white;
                    border: none; border-radius: 6px;
                    padding: 4px 10px; cursor: pointer;
                    font-size: 0.75rem; font-weight: 600;
                    display: flex; align-items: center; gap: 4px;
                }

                /* ── Footer ── */
                .ap-footer {
                    display: flex; justify-content: flex-end; gap: 0.625rem;
                    margin-top: 1.75rem; padding-top: 1.25rem;
                    border-top: 1px solid #f3f4f6;
                }
                .ap-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 0.625rem 1.375rem; border-radius: 10px;
                    border: none; font-size: 0.875rem; font-weight: 600;
                    font-family: 'Poppins', sans-serif; cursor: pointer;
                    transition: all 0.2s;
                }
                .ap-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ap-btn-cancel {
                    background: #f3f4f6; color: #374151;
                    border: 1.5px solid #e5e7eb;
                }
                .ap-btn-cancel:hover:not(:disabled) { background: #e5e7eb; }
                .ap-btn-save {
                    background: linear-gradient(135deg, #00204E, #34A129);
                    color: white; box-shadow: 0 4px 14px rgba(0,32,78,0.28);
                }
                .ap-btn-save:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,32,78,0.38);
                }
                .ap-action-error {
                    background: #fef2f2; color: #991b1b;
                    border: 1px solid #fecaca; border-radius: 10px;
                    padding: 0.75rem 1rem; font-size: 0.8125rem;
                    font-weight: 500; margin-bottom: 1rem;
                }
                .ap-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white; border-radius: 50%;
                    animation: ap-spin 0.75s linear infinite;
                }
                @keyframes ap-spin { to { transform: rotate(360deg); } }
            `}</style>

            <form onSubmit={handleSubmit}>

                {/* ── Mode tabs ─────────────────────────────────────── */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                        type="button"
                        className={`ap-tab-btn ${mode === 'new' ? 'active' : ''}`}
                        onClick={() => {
                            setMode('new')
                            handleClearExisting()
                            dispatch(clearSearchResults())
                        }}
                    >
                        Create New Product
                    </button>
                    <button
                        type="button"
                        className={`ap-tab-btn ${mode === 'existing' ? 'active' : ''}`}
                        onClick={() => setMode('existing')}
                    >
                        Add Existing Product
                    </button>
                </div>

                {/* ── Existing product search ────────────────────────── */}
                {mode === 'existing' && (
                    <>
                        {/* Search bar: text input + category dropdown + button */}
                        <div className="ap-search-filters">

                            {/* Text search */}
                            <input
                                type="text"
                                className="ap-search-input"
                                placeholder="Search by name…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleSearch()
                                    }
                                }}
                            />

                            {/* Category filter */}
                            <select
                                className="ap-search-cat"
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            {/* Search button */}
                            <button
                                type="button"
                                className="ap-search-btn"
                                onClick={handleSearch}
                                disabled={
                                    searchLoading ||
                                    (!searchTerm.trim() && searchCategory === '')
                                }
                            >
                                {searchLoading ? (
                                    <>
                                        <span className="ap-spinner"
                                            style={{ width: 16, height: 16 }} />
                                        Searching…
                                    </>
                                ) : (
                                    <>
                                        <FaSearch size={13} />
                                        Search
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results list */}
                        {searchResults.length > 0 && (
                            <div className="ap-search-results">
                                {searchResults.map((p) => (
                                    <div
                                        key={p.id}
                                        className="ap-search-item"
                                        onClick={() => handleSelectExisting(p)}
                                    >
                                        {p.image ? (
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="ap-search-img"
                                            />
                                        ) : (
                                            <div className="ap-search-ph">
                                                <FaBox size={16} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: 600, fontSize: '0.875rem',
                                                color: '#00204E', marginBottom: 2,
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {p.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                {p.category_name}
                                                {p.price ? ` • ₹${p.price}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected product banner */}
                        {selectedExisting && (
                            <div className="ap-selected-banner">
                                <span>
                                    ✓ Selected: <strong>{selectedExisting.name}</strong>
                                    {' '}— Fill in your pricing and stock below
                                </span>
                                <button
                                    type="button"
                                    className="ap-selected-clear"
                                    onClick={handleClearExisting}
                                >
                                    <FaTimes size={10} /> Change
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* ── Action error ───────────────────────────────────── */}
                {actionError && (
                    <div className="ap-action-error" style={{ marginTop: '1rem' }}>
                        ⚠️ {actionError}
                    </div>
                )}

                {/* ── Form fields ────────────────────────────────────── */}
                <Row className="g-3" style={{ marginTop: '0.5rem' }}>

                    {/* Product name */}
                    <Col md={6}>
                        <label className="ap-label">
                            Product Name <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            className={`ap-input ${errors.product_name ? 'error' : ''}`}
                            placeholder="e.g. Amul Gold Milk"
                            value={formData.product_name}
                            onChange={handleChange}
                            disabled={!!selectedExisting}
                        />
                        {errors.product_name && (
                            <p className="ap-error">⚠ {errors.product_name}</p>
                        )}
                    </Col>

                    {/* Brand */}
                    <Col md={6}>
                        <label className="ap-label">
                            Brand <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="brand"
                            className={`ap-input ${errors.brand ? 'error' : ''}`}
                            placeholder="e.g. Amul"
                            value={formData.brand}
                            onChange={handleChange}
                        />
                        {errors.brand && (
                            <p className="ap-error">⚠ {errors.brand}</p>
                        )}
                    </Col>

                    {/* Category */}
                    <Col md={6}>
                        <label className="ap-label">
                            Category <span>*</span>
                        </label>
                        <select
                            name="category_id"
                            className={`ap-select ${errors.category_id ? 'error' : ''}`}
                            value={formData.category_id}
                            onChange={handleChange}
                            disabled={!!selectedExisting}
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="ap-error">⚠ {errors.category_id}</p>
                        )}
                    </Col>

                    {/* Unit */}
                    <Col md={6}>
                        <label className="ap-label">
                            Unit <span>*</span>
                        </label>
                        <select
                            name="unit"
                            className="ap-select"
                            value={formData.unit}
                            onChange={handleChange}
                        >
                            {units.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </Col>

                    {/* MRP */}
                    <Col md={4}>
                        <label className="ap-label">MRP (₹) <span>*</span></label>
                        <input
                            type="number"
                            name="mrp"
                            className={`ap-input ${errors.mrp ? 'error' : ''}`}
                            placeholder="0.00"
                            value={formData.mrp}
                            onChange={handleChange}
                            step="0.01" min="0"
                        />
                        {errors.mrp && <p className="ap-error">⚠ {errors.mrp}</p>}
                    </Col>

                    {/* Selling price */}
                    <Col md={4}>
                        <label className="ap-label">
                            Selling Price (₹) <span>*</span>
                        </label>
                        <input
                            type="number"
                            name="selling_price"
                            className={`ap-input ${errors.selling_price ? 'error' : ''}`}
                            placeholder="0.00"
                            value={formData.selling_price}
                            onChange={handleChange}
                            step="0.01" min="0"
                        />
                        {errors.selling_price && (
                            <p className="ap-error">⚠ {errors.selling_price}</p>
                        )}
                    </Col>

                    {/* Stock */}
                    <Col md={4}>
                        <label className="ap-label">
                            Stock Quantity <span>*</span>
                        </label>
                        <input
                            type="number"
                            name="stock"
                            className={`ap-input ${errors.stock ? 'error' : ''}`}
                            placeholder="0"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                        />
                        {errors.stock && <p className="ap-error">⚠ {errors.stock}</p>}
                    </Col>

                    {/* Description */}
                    <Col md={12}>
                        <label className="ap-label">Description</label>
                        <textarea
                            name="description"
                            className="ap-textarea"
                            placeholder="Product description (optional)"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </Col>

                    {/* ── Image section ──────────────────────────────── */}
                    <Col md={12}>
                        <label className="ap-label">
                            Product Image <span>*</span>
                        </label>

                        {displayImage ? (
                            /* Preview — locked (existing) or removable (new) */
                            <div className="ap-preview-wrap">
                                <img
                                    src={displayImage}
                                    alt="Product preview"
                                    className="ap-preview"
                                />

                                {/* Badge: locked image from existing product */}
                                {isImageLocked && (
                                    <span className="ap-preview-badge">
                                        🔒 Product Image
                                    </span>
                                )}

                                {/* Remove button: only for user-uploaded images */}
                                {!isImageLocked && (
                                    <button
                                        type="button"
                                        className="ap-preview-remove"
                                        onClick={() => {
                                            URL.revokeObjectURL(previewUrl)
                                            setPreviewUrl(null)
                                            setFormData((p) => ({ ...p, image: null }))
                                        }}
                                    >
                                        <FaTimes size={10} /> Remove
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Upload zone: only shown when no image exists */
                            <div className="ap-upload-zone">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <div className="ap-upload-icon">
                                    <FaCamera />
                                </div>
                                <p className="ap-upload-text">
                                    Click to upload product image
                                </p>
                                <p className="ap-upload-hint">PNG, JPG up to 5 MB</p>
                            </div>
                        )}

                        {errors.image && (
                            <p className="ap-error">⚠ {errors.image}</p>
                        )}
                    </Col>
                </Row>

                {/* ── Footer ────────────────────────────────────────── */}
                <div className="ap-footer">
                    <button
                        type="button"
                        className="ap-btn ap-btn-cancel"
                        onClick={() => onClose(false)}
                        disabled={actionLoading}
                    >
                        <FaTimes size={13} />
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        className="ap-btn ap-btn-save"
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <span className="ap-spinner" />
                                Adding…
                            </>
                        ) : (
                            <>
                                <FaSave size={13} />
                                {t('common.save') || 'Add Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    )
}

export default AddProduct