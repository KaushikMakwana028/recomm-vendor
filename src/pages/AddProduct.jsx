import { useState, useEffect, useMemo } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import {
    FaSave,
    FaTimes,
    FaSearch,
    FaBox,
    FaCamera,
    FaCheck,
    FaPlus,
    FaArrowLeft,
    FaClock,
    FaTag,
    FaBoxes,
} from 'react-icons/fa'
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

    // Flow modes: 'catalogue' (default) vs 'custom' (fallback for products not in catalogue)
    const [mode, setMode] = useState('catalogue')

    // Catalogue search & filter state
    const [selectedCategory, setSelectedCategory] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedBrand, setSelectedBrand] = useState('')
    const [activeSection, setActiveSection] = useState('all') // 'all' or 'recent'

    // Selected product & variant from catalogue
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState(null)

    // Form data for vendor entry (Catalogue flow & Custom fallback flow)
    const [formData, setFormData] = useState({
        selling_price: '',
        stock: '',
        mrp: '',
        // For custom product fallback:
        product_name: '',
        brand: '',
        category_id: '',
        unit: 'kg',
        description: '',
        image: null,
    })

    const [previewUrl, setPreviewUrl] = useState(null) // for custom product image upload
    const [errors, setErrors] = useState({})

    const units = ['kg', 'g', 'litre', 'ml', 'packet', 'piece', 'dozen', 'box', 'can', 'bottle']

    // ── 1. Fetch categories & initial catalogue on mount ────────
    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchCategories())
        }
        // Load initial catalogue
        dispatch(searchProducts({
            category_id: selectedCategory || undefined,
            search: searchTerm.trim() || undefined,
            brand: selectedBrand || undefined,
            section: activeSection === 'recent' ? 'recent' : undefined,
        }))
    }, [dispatch])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(clearSearchResults())
            dispatch(clearProductError())
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [dispatch, previewUrl])

    // ── 2. Refresh catalogue when filters change ────────────────
    const refreshCatalogue = (catId, term, brand, sec) => {
        dispatch(searchProducts({
            category_id: catId || undefined,
            search: term?.trim() ? term.trim() : undefined,
            brand: brand || undefined,
            section: sec === 'recent' ? 'recent' : undefined,
        }))
    }

    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId)
        refreshCatalogue(catId, searchTerm, selectedBrand, activeSection)
    }

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault()
        refreshCatalogue(selectedCategory, searchTerm, selectedBrand, activeSection)
    }

    const handleSectionChange = (sec) => {
        setActiveSection(sec)
        refreshCatalogue(selectedCategory, searchTerm, selectedBrand, sec)
    }

    const handleBrandChange = (brand) => {
        setSelectedBrand(brand)
        refreshCatalogue(selectedCategory, searchTerm, brand, activeSection)
    }

    // Extract available brands from search results for brand filter dropdown
    const availableBrands = useMemo(() => {
        const brands = new Set()
        if (Array.isArray(searchResults)) {
            searchResults.forEach((p) => {
                if (p.brand && p.brand.trim()) brands.add(p.brand.trim())
            })
        }
        return Array.from(brands).sort()
    }, [searchResults])

    // ── 3. Handle Product Selection from Catalogue ─────────────
    const handleSelectProduct = (product) => {
        setSelectedProduct(product)

        // If product has variants, pre-select the first one
        if (product.variants && product.variants.length > 0) {
            const firstVar = product.variants[0]
            setSelectedVariant(firstVar)
            setFormData((prev) => ({
                ...prev,
                mrp: firstVar.mrp || product.price || '',
                selling_price: firstVar.price || product.sale_price || '',
                stock: '',
            }))
        } else {
            setSelectedVariant(null)
            setFormData((prev) => ({
                ...prev,
                mrp: product.price || '',
                selling_price: product.sale_price || '',
                stock: '',
            }))
        }
        setErrors({})
    }

    // ── 4. Handle Variant Selection ────────────────────────────
    const handleSelectVariant = (variant) => {
        setSelectedVariant(variant)
        setFormData((prev) => ({
            ...prev,
            mrp: variant.mrp || selectedProduct?.price || prev.mrp,
            selling_price: variant.price || selectedProduct?.sale_price || prev.selling_price,
        }))
        if (errors.selling_price) setErrors((e) => ({ ...e, selling_price: '' }))
    }

    const handleBackToCatalogueList = () => {
        setSelectedProduct(null)
        setSelectedVariant(null)
        setErrors({})
    }

    // ── 5. Form Input Change ───────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    // ── 6. Custom Image Upload (Fallback only) ─────────────────
    const handleImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setFormData((prev) => ({ ...prev, image: file }))
        if (errors.image) setErrors((prev) => ({ ...prev, image: '' }))
    }

    // ── 7. Validation ──────────────────────────────────────────
    const validate = () => {
        const e = {}

        if (!formData.selling_price || Number(formData.selling_price) <= 0) {
            e.selling_price = 'Valid selling price is required'
        }

        if (formData.mrp && Number(formData.mrp) > 0 && Number(formData.selling_price) > Number(formData.mrp)) {
            e.selling_price = 'Selling price cannot exceed MRP'
        }

        if (formData.stock === '' || Number(formData.stock) < 0) {
            e.stock = 'Valid stock quantity is required (0 or more)'
        }

        // Additional validation if in Custom Product Mode
        if (mode === 'custom') {
            if (!formData.product_name.trim()) e.product_name = 'Product name is required'
            if (!formData.brand.trim()) e.brand = 'Brand is required'
            if (!formData.category_id) e.category_id = 'Category is required'
            if (!formData.mrp || Number(formData.mrp) <= 0) e.mrp = 'MRP is required'
            if (!formData.image) e.image = 'Product image is required for custom products'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ── 8. Form Submit ─────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        let payload = {}

        if (mode === 'catalogue') {
            if (selectedVariant) {
                // Catalogue variant addition: vendor never typed the name!
                payload = {
                    variant_id: selectedVariant.id,
                    product_id: selectedProduct.id,
                    selling_price: formData.selling_price,
                    stock: formData.stock,
                    mrp: formData.mrp || selectedVariant.mrp || selectedProduct.price,
                }
            } else {
                // Catalogue master product without variant
                payload = {
                    product_id: selectedProduct.id,
                    product_name: selectedProduct.name,
                    brand: selectedProduct.brand || '',
                    category_id: selectedProduct.category_id,
                    selling_price: formData.selling_price,
                    stock: formData.stock,
                    mrp: formData.mrp || selectedProduct.price,
                }
            }
        } else {
            // Custom fallback product
            payload = { ...formData }
        }

        const result = await dispatch(addVendorProduct(payload))
        if (addVendorProduct.fulfilled.match(result)) {
            onClose(true)
        }
    }

    return (
        <>
            <style>{`
                .ap-container {
                    font-family: 'Poppins', sans-serif;
                    color: #1f2937;
                }
                .ap-header-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.875rem;
                    border-bottom: 1px solid #f3f4f6;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
                .ap-toggle-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.5rem 0.875rem;
                    border-radius: 8px;
                    border: 1.5px solid #00204E;
                    background: transparent;
                    color: #00204E;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ap-toggle-btn:hover {
                    background: #00204E;
                    color: white;
                }
                .ap-cat-pills {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1rem;
                    scrollbar-width: thin;
                }
                .ap-cat-pill {
                    padding: 0.4rem 0.85rem;
                    border-radius: 20px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: #4b5563;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s;
                }
                .ap-cat-pill:hover {
                    border-color: #00204E;
                    color: #00204E;
                }
                .ap-cat-pill.active {
                    background: #00204E;
                    border-color: #00204E;
                    color: white;
                    font-weight: 600;
                }
                .ap-filter-row {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                .ap-search-box {
                    flex: 1;
                    min-width: 160px;
                    position: relative;
                }
                .ap-search-input {
                    width: 100%;
                    padding: 0.55rem 0.875rem 0.55rem 2.25rem;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.84rem;
                    outline: none;
                }
                .ap-search-input:focus {
                    border-color: #34A129;
                }
                .ap-search-icon {
                    position: absolute;
                    left: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }
                .ap-select-filter {
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 0.55rem 0.75rem;
                    font-size: 0.84rem;
                    outline: none;
                    background: white;
                    color: #374151;
                }
                .ap-section-tabs {
                    display: flex;
                    gap: 0.35rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 2px;
                    background: #f9fafb;
                }
                .ap-sec-btn {
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #6b7280;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .ap-sec-btn.active {
                    background: white;
                    color: #00204E;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }
                /* Catalogue product cards */
                .ap-catalogue-grid {
                    max-height: 380px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.625rem;
                    border: 1px solid #f3f4f6;
                    border-radius: 10px;
                    padding: 0.5rem;
                    background: #fafafa;
                }
                .ap-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ap-card:hover {
                    border-color: #34A129;
                    box-shadow: 0 3px 10px rgba(52,161,41,0.12);
                    transform: translateY(-1px);
                }
                .ap-card-img {
                    width: 52px;
                    height: 52px;
                    border-radius: 8px;
                    object-fit: cover;
                    border: 1px solid #e5e7eb;
                    margin-right: 0.875rem;
                    flex-shrink: 0;
                }
                .ap-card-ph {
                    width: 52px;
                    height: 52px;
                    border-radius: 8px;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    margin-right: 0.875rem;
                    flex-shrink: 0;
                }
                .ap-card-title {
                    font-weight: 600;
                    font-size: 0.9375rem;
                    color: #00204E;
                    margin-bottom: 2px;
                }
                .ap-card-meta {
                    font-size: 0.75rem;
                    color: #6b7280;
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .ap-tag-badge {
                    background: #eef2ff;
                    color: #3730a3;
                    padding: 2px 7px;
                    border-radius: 4px;
                    font-size: 0.72rem;
                    font-weight: 600;
                }
                .ap-variants-badge {
                    background: #ecfdf5;
                    color: #065f46;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    border: 1px solid #a7f3d0;
                }
                /* Selected product & variant screen */
                .ap-selected-banner {
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.25rem;
                }
                .ap-variant-chips {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin-top: 0.5rem;
                }
                .ap-var-chip {
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    cursor: pointer;
                    font-size: 0.84rem;
                    font-weight: 600;
                    color: #374151;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .ap-var-chip:hover {
                    border-color: #34A129;
                }
                .ap-var-chip.active {
                    border-color: #34A129;
                    background: #f0fdf4;
                    color: #166534;
                    box-shadow: 0 2px 6px rgba(52,161,41,0.2);
                }
                .ap-label {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 6px;
                    display: block;
                }
                .ap-label span { color: #ef4444; margin-left: 2px; }
                .ap-input, .ap-select, .ap-textarea {
                    width: 100%;
                    border: 1.5px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 0.625rem 0.875rem;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .ap-input:focus, .ap-select:focus, .ap-textarea:focus {
                    border-color: #34A129;
                    box-shadow: 0 0 0 3px rgba(52,161,41,0.1);
                }
                .ap-input.error, .ap-select.error { border-color: #ef4444; }
                .ap-input:disabled {
                    background: #f9fafb;
                    color: #6b7280;
                    cursor: not-allowed;
                }
                .ap-error {
                    color: #ef4444;
                    font-size: 0.78rem;
                    margin-top: 4px;
                    font-weight: 500;
                }
                .ap-upload-zone {
                    border: 2px dashed #e5e7eb;
                    border-radius: 10px;
                    padding: 1.5rem;
                    text-align: center;
                    cursor: pointer;
                    position: relative;
                }
                .ap-upload-zone:hover {
                    border-color: #34A129;
                    background: #f0fdf4;
                }
                .ap-upload-zone input {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                }
                .ap-preview-wrap {
                    position: relative;
                    width: 100%;
                }
                .ap-preview {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }
                .ap-preview-remove {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 0.72rem;
                    cursor: pointer;
                }
                .ap-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.625rem;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f3f4f6;
                }
                .ap-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0.625rem 1.25rem;
                    border-radius: 8px;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ap-btn-cancel {
                    background: #f3f4f6;
                    color: #374151;
                }
                .ap-btn-save {
                    background: linear-gradient(135deg, #00204E, #34A129);
                    color: white;
                    box-shadow: 0 3px 12px rgba(0,32,78,0.25);
                }
                .ap-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ap-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: ap-spin 0.75s linear infinite;
                }
                @keyframes ap-spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="ap-container">
                {/* ── Header / Mode switch ─────────────────────────── */}
                <div className="ap-header-bar">
                    <div>
                        <h6 style={{ margin: 0, fontWeight: 700, color: '#00204E' }}>
                            {mode === 'catalogue'
                                ? (selectedProduct ? 'Set Your Price & Stock' : 'Select from Master Catalogue')
                                : 'Add Custom Product'}
                        </h6>
                        <small style={{ color: '#6b7280' }}>
                            {mode === 'catalogue'
                                ? 'Pick an existing product from catalogue — no typing needed!'
                                : 'Genuinely new product not present in our master catalogue'}
                        </small>
                    </div>

                    {mode === 'catalogue' ? (
                        <button
                            type="button"
                            className="ap-toggle-btn"
                            onClick={() => {
                                setMode('custom')
                                setSelectedProduct(null)
                                setSelectedVariant(null)
                                setErrors({})
                            }}
                        >
                            <FaPlus size={11} />
                            Add product not in catalogue
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="ap-toggle-btn"
                            onClick={() => {
                                setMode('catalogue')
                                setErrors({})
                            }}
                        >
                            <FaArrowLeft size={11} />
                            Back to Master Catalogue
                        </button>
                    )}
                </div>

                {/* ── Action Error Display ─────────────────────────── */}
                {actionError && (
                    <div style={{
                        background: '#fef2f2',
                        color: '#991b1b',
                        padding: '0.625rem 0.875rem',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        marginBottom: '1rem',
                        border: '1px solid #fecaca',
                    }}>
                        ⚠️ {actionError}
                    </div>
                )}

                {/* =================================================== */}
                {/* FLOW 1: MASTER CATALOGUE (Default & Recommended)    */}
                {/* =================================================== */}
                {mode === 'catalogue' && !selectedProduct && (
                    <>
                        {/* 1. Category Pills */}
                        <div className="ap-cat-pills">
                            <button
                                type="button"
                                className={`ap-cat-pill ${selectedCategory === '' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('')}
                            >
                                All Categories
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`ap-cat-pill ${selectedCategory === String(c.id) ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(String(c.id))}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>

                        {/* 2. Search, Brand Filter & Section Tabs */}
                        <div className="ap-filter-row">
                            <form onSubmit={handleSearchSubmit} className="ap-search-box">
                                <FaSearch className="ap-search-icon" size={13} />
                                <input
                                    type="text"
                                    className="ap-search-input"
                                    placeholder="Search catalogue by name or SKU…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </form>

                            {/* Brand dropdown filter */}
                            {availableBrands.length > 0 && (
                                <select
                                    className="ap-select-filter"
                                    value={selectedBrand}
                                    onChange={(e) => handleBrandChange(e.target.value)}
                                >
                                    <option value="">All Brands</option>
                                    {availableBrands.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            )}

                            {/* Section tabs: All vs Recently Added */}
                            <div className="ap-section-tabs">
                                <button
                                    type="button"
                                    className={`ap-sec-btn ${activeSection === 'all' ? 'active' : ''}`}
                                    onClick={() => handleSectionChange('all')}
                                >
                                    All Products
                                </button>
                                <button
                                    type="button"
                                    className={`ap-sec-btn ${activeSection === 'recent' ? 'active' : ''}`}
                                    onClick={() => handleSectionChange('recent')}
                                >
                                    <FaClock size={11} /> Recently Added
                                </button>
                            </div>
                        </div>

                        {/* 3. Master Catalogue Results List */}
                        {searchLoading ? (
                            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>
                                <span className="ap-spinner" style={{ borderColor: '#00204E', borderTopColor: 'transparent', width: 22, height: 22, display: 'inline-block', marginBottom: 8 }} />
                                <div style={{ fontSize: '0.875rem' }}>Loading master catalogue products…</div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="ap-catalogue-grid">
                                {searchResults.map((product) => {
                                    const variantCount = product.variants?.length || 0
                                    return (
                                        <div
                                            key={product.id}
                                            className="ap-card"
                                            onClick={() => handleSelectProduct(product)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="ap-card-img"
                                                    />
                                                ) : (
                                                    <div className="ap-card-ph">
                                                        <FaBox size={18} />
                                                    </div>
                                                )}
                                                <div style={{ minWidth: 0 }}>
                                                    <div className="ap-card-title text-truncate">
                                                        {product.name}
                                                    </div>
                                                    <div className="ap-card-meta">
                                                        {product.brand && (
                                                            <span className="ap-tag-badge">
                                                                <FaTag size={9} style={{ marginRight: 3 }} />
                                                                {product.brand}
                                                            </span>
                                                        )}
                                                        <span>{product.category_name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                                                {variantCount > 0 ? (
                                                    <span className="ap-variants-badge">
                                                        <FaBoxes size={10} style={{ marginRight: 4 }} />
                                                        {variantCount} Pack Size{variantCount > 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '0.8125rem', color: '#00204E', fontWeight: 600 }}>
                                                        Select
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '2.5rem 1rem',
                                background: '#f9fafb',
                                borderRadius: 10,
                                border: '1px dashed #e5e7eb',
                            }}>
                                <FaBox size={28} style={{ color: '#9ca3af', marginBottom: 10 }} />
                                <div style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                                    No products found in catalogue
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: 12 }}>
                                    Try different filters or add it as a new product not in our catalogue.
                                </p>
                                <button
                                    type="button"
                                    className="ap-toggle-btn"
                                    onClick={() => setMode('custom')}
                                >
                                    <FaPlus size={11} /> Add product not in catalogue
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* =================================================== */}
                {/* FLOW 1B: SELECTED CATALOGUE PRODUCT -> VARIANT & PRICING */}
                {/* =================================================== */}
                {mode === 'catalogue' && selectedProduct && (
                    <form onSubmit={handleSubmit}>
                        {/* Selected Product Summary Banner */}
                        <div className="ap-selected-banner">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {selectedProduct.image ? (
                                        <img
                                            src={selectedProduct.image}
                                            alt={selectedProduct.name}
                                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                                            <FaBox size={16} />
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#00204E' }}>
                                            {selectedProduct.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {selectedProduct.brand ? `${selectedProduct.brand} • ` : ''}
                                            {selectedProduct.category_name}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleBackToCatalogueList}
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 6,
                                        padding: '4px 10px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Change Product
                                </button>
                            </div>

                            {/* Variant / Pack Size Selector */}
                            {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e293b', marginBottom: 6, display: 'block' }}>
                                        Select Pack Size / Variant:
                                    </label>
                                    <div className="ap-variant-chips">
                                        {selectedProduct.variants.map((v) => {
                                            const isSelected = selectedVariant?.id === v.id
                                            return (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    className={`ap-var-chip ${isSelected ? 'active' : ''}`}
                                                    onClick={() => handleSelectVariant(v)}
                                                >
                                                    {isSelected && <FaCheck size={11} />}
                                                    <span>{v.variant_name}</span>
                                                    {v.mrp && <small style={{ color: '#6b7280' }}>(MRP ₹{v.mrp})</small>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Vendor Pricing & Stock Inputs (The only inputs needed!) */}
                        <Row className="g-3">
                            <Col md={6}>
                                <label className="ap-label">
                                    Your Selling Price (₹) <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="selling_price"
                                    className={`ap-input ${errors.selling_price ? 'error' : ''}`}
                                    placeholder="Enter your selling price"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0.01"
                                    autoFocus
                                />
                                {errors.selling_price && <p className="ap-error">⚠ {errors.selling_price}</p>}
                            </Col>

                            <Col md={6}>
                                <label className="ap-label">
                                    Available Stock Quantity <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    className={`ap-input ${errors.stock ? 'error' : ''}`}
                                    placeholder="e.g. 25"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                />
                                {errors.stock && <p className="ap-error">⚠ {errors.stock}</p>}
                            </Col>

                            {/* Informational / Read-only Fields inherited automatically */}
                            <Col md={6}>
                                <label className="ap-label">MRP (₹)</label>
                                <input
                                    type="number"
                                    name="mrp"
                                    className="ap-input"
                                    value={formData.mrp}
                                    onChange={handleChange}
                                    step="0.01"
                                    placeholder="Optional / Inherited from pack size"
                                />
                            </Col>

                            <Col md={6}>
                                <label className="ap-label">Product Name in Inventory</label>
                                <input
                                    type="text"
                                    className="ap-input"
                                    disabled
                                    value={
                                        selectedVariant
                                            ? `${selectedProduct.name} ${selectedVariant.variant_name}`
                                            : selectedProduct.name
                                    }
                                />
                            </Col>
                        </Row>

                        <div className="ap-footer">
                            <button
                                type="button"
                                className="ap-btn ap-btn-cancel"
                                onClick={handleBackToCatalogueList}
                                disabled={actionLoading}
                            >
                                <FaArrowLeft size={12} /> Back
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
                                        Add to My Store
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* =================================================== */}
                {/* FLOW 2: CUSTOM PRODUCT FALLBACK (Not in Catalogue)   */}
                {/* =================================================== */}
                {mode === 'custom' && (
                    <form onSubmit={handleSubmit}>
                        <div style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 8,
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.8125rem',
                            color: '#92400e',
                            marginBottom: '1rem',
                        }}>
                            ℹ️ Use this form only if this product does not exist anywhere in the Master Catalogue.
                        </div>

                        <Row className="g-3">
                            <Col md={6}>
                                <label className="ap-label">
                                    Product Name <span>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="product_name"
                                    className={`ap-input ${errors.product_name ? 'error' : ''}`}
                                    placeholder="e.g. Organic Brown Rice"
                                    value={formData.product_name}
                                    onChange={handleChange}
                                />
                                {errors.product_name && <p className="ap-error">⚠ {errors.product_name}</p>}
                            </Col>

                            <Col md={6}>
                                <label className="ap-label">
                                    Brand <span>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    className={`ap-input ${errors.brand ? 'error' : ''}`}
                                    placeholder="e.g. Nature Best"
                                    value={formData.brand}
                                    onChange={handleChange}
                                />
                                {errors.brand && <p className="ap-error">⚠ {errors.brand}</p>}
                            </Col>

                            <Col md={6}>
                                <label className="ap-label">
                                    Category <span>*</span>
                                </label>
                                <select
                                    name="category_id"
                                    className={`ap-select ${errors.category_id ? 'error' : ''}`}
                                    value={formData.category_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="ap-error">⚠ {errors.category_id}</p>}
                            </Col>

                            <Col md={6}>
                                <label className="ap-label">
                                    Unit / Pack Size <span>*</span>
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

                            <Col md={4}>
                                <label className="ap-label">
                                    MRP (₹) <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="mrp"
                                    className={`ap-input ${errors.mrp ? 'error' : ''}`}
                                    placeholder="0.00"
                                    value={formData.mrp}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                />
                                {errors.mrp && <p className="ap-error">⚠ {errors.mrp}</p>}
                            </Col>

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
                                    step="0.01"
                                    min="0"
                                />
                                {errors.selling_price && <p className="ap-error">⚠ {errors.selling_price}</p>}
                            </Col>

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

                            <Col md={12}>
                                <label className="ap-label">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    className="ap-textarea"
                                    placeholder="Describe your product..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2}
                                />
                            </Col>

                            <Col md={12}>
                                <label className="ap-label">
                                    Product Image <span>*</span>
                                </label>
                                {previewUrl ? (
                                    <div className="ap-preview-wrap">
                                        <img src={previewUrl} alt="Preview" className="ap-preview" />
                                        <button
                                            type="button"
                                            className="ap-preview-remove"
                                            onClick={() => {
                                                URL.revokeObjectURL(previewUrl)
                                                setPreviewUrl(null)
                                                setFormData((prev) => ({ ...prev, image: null }))
                                            }}
                                        >
                                            <FaTimes size={10} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="ap-upload-zone">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        <FaCamera size={22} style={{ color: '#9ca3af', marginBottom: 6 }} />
                                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151' }}>
                                            Click or drop image to upload
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>JPG, PNG up to 2MB</div>
                                    </div>
                                )}
                                {errors.image && <p className="ap-error">⚠ {errors.image}</p>}
                            </Col>
                        </Row>

                        <div className="ap-footer">
                            <button
                                type="button"
                                className="ap-btn ap-btn-cancel"
                                onClick={() => onClose(false)}
                                disabled={actionLoading}
                            >
                                <FaTimes size={12} /> Cancel
                            </button>
                            <button
                                type="submit"
                                className="ap-btn ap-btn-save"
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="ap-spinner" />
                                        Creating…
                                    </>
                                ) : (
                                    <>
                                        <FaSave size={13} />
                                        Create Custom Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    )
}

export default AddProduct