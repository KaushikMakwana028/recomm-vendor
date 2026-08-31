import { useState, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { FaSave, FaTimes, FaCamera } from 'react-icons/fa'
import {
    updateVendorProduct,
    clearProductError,
} from '../redux/productSlice'
import { useLanguage } from '../contexts/LanguageContext'

const EditProduct = ({ product, onClose }) => {
    const dispatch = useDispatch()
    const { t } = useLanguage()

    const { categories, actionLoading, actionError } = useSelector((s) => s.product)

    const [isOwnProduct, setIsOwnProduct] = useState(false) // ✅ Track ownership

    const [formData, setFormData] = useState({
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

    const [existingImageUrl, setExistingImageUrl] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [errors, setErrors] = useState({})

    const units = ['kg', 'litre', 'packet', 'piece', 'dozen', 'gram', 'ml']

    // ── Populate form from product prop ─────────────────────
    useEffect(() => {
        if (product) {
            setFormData({
                product_name: product.name || '',
                brand: product.brand || '',
                category_id: product.category_id || '',
                unit: product.unit || 'kg',
                mrp: product.mrp || '',
                selling_price: product.sellingPrice || '',
                stock: product.stock || '',
                description: product.description || '',
                image: null,
            })
            // Store existing image and ownership flag
            setExistingImageUrl(product.image || null)
            setIsOwnProduct(product.is_own_product === true) // ✅ Set ownership
        }
    }, [product])

    // ── Cleanup preview on unmount ──────────────────────────
    useEffect(() => {
        return () => {
            dispatch(clearProductError())
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [dispatch, previewUrl])

    // ── Handle text input ───────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    // ── Handle image upload (only if is_own_product) ────────
    const handleImageChange = (e) => {
        if (!isOwnProduct) return // ✅ Block if not own product

        const file = e.target.files?.[0]
        if (!file) return

        if (previewUrl) URL.revokeObjectURL(previewUrl)

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setFormData((prev) => ({ ...prev, image: file }))
        if (errors.image) setErrors((prev) => ({ ...prev, image: '' }))
    }

    // ── Validation ──────────────────────────────────────────
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

        setErrors(e)
        return Object.keys(e).length === 0
    }

    // ── Submit ──────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        const payload = {
            id: product.id,
            ...formData,
        }

        // If user uploaded a new image, use File; otherwise keep existing URL
        if (!formData.image && existingImageUrl) {
            payload.image = existingImageUrl
        }

        const result = await dispatch(updateVendorProduct(payload))

        if (updateVendorProduct.fulfilled.match(result)) {
            onClose(true)
        }
    }

    // ── Which image to display ──────────────────────────────
    const displayImage = previewUrl || existingImageUrl

    return (
        <>
            <style>{`
                .ep-label {
                    font-size: 0.8125rem; font-weight: 600;
                    color: #374151; margin-bottom: 6px; display: block;
                }
                .ep-label span { color: #ef4444; margin-left: 2px; }

                .ep-input, .ep-select, .ep-textarea {
                    width: 100%; border: 1.5px solid #e5e7eb;
                    border-radius: 10px; padding: 0.625rem 0.875rem;
                    font-size: 0.875rem; font-family: 'Poppins', sans-serif;
                    color: #111827; outline: none; transition: all 0.2s;
                }
                .ep-input:focus, .ep-select:focus, .ep-textarea:focus {
                    border-color: #34A129;
                    box-shadow: 0 0 0 3px rgba(52,161,41,0.1);
                }
                .ep-input.error, .ep-select.error { border-color: #ef4444; }
                .ep-input:disabled, .ep-select:disabled, .ep-textarea:disabled {
                    background: #f9fafb; color: #6b7280; cursor: not-allowed;
                }
                .ep-textarea { resize: vertical; min-height: 80px; }

                .ep-error {
                    display: flex; align-items: center; gap: 4px;
                    margin-top: 0.375rem; font-size: 0.78rem;
                    color: #ef4444; font-weight: 500;
                }

                /* ── Image zone ── */
                .ep-upload-zone {
                    border: 2px dashed #e5e7eb; border-radius: 12px;
                    padding: 2rem; text-align: center; cursor: pointer;
                    transition: all 0.2s; position: relative;
                }
                .ep-upload-zone:hover {
                    border-color: #34A129; background: #f0fdf4;
                }
                .ep-upload-zone.disabled {
                    cursor: not-allowed; opacity: 0.6;
                }
                .ep-upload-zone.disabled:hover {
                    border-color: #e5e7eb; background: transparent;
                }
                .ep-upload-zone input {
                    position: absolute; inset: 0; opacity: 0;
                    cursor: pointer; width: 100%; height: 100%;
                }
                .ep-upload-zone input:disabled {
                    cursor: not-allowed;
                }
                .ep-upload-icon {
                    width: 48px; height: 48px; border-radius: 12px;
                    background: #f3f4f6; margin: 0 auto 12px;
                    display: flex; align-items: center; justify-content: center;
                    color: #6b7280; font-size: 1.25rem;
                }
                .ep-upload-text {
                    font-size: 0.875rem; font-weight: 500;
                    color: #374151; margin: 0 0 4px;
                }
                .ep-upload-hint {
                    font-size: 0.75rem; color: #9ca3af; margin: 0;
                }

                .ep-preview-wrap {
                    position: relative; display: inline-block; width: 100%;
                }
                .ep-preview {
                    width: 100%; height: 160px; object-fit: cover;
                    border-radius: 10px; border: 1px solid #e5e7eb;
                    display: block;
                }

                /* ── Preview action buttons ── */
                .ep-preview-actions {
                    position: absolute; top: 8px; right: 8px;
                    display: flex; gap: 6px;
                }

                .ep-preview-change,
                .ep-preview-remove {
                    background: rgba(0,0,0,0.75); color: white;
                    border: none; border-radius: 6px;
                    padding: 5px 12px; cursor: pointer;
                    font-size: 0.75rem; font-weight: 600;
                    display: flex; align-items: center; gap: 4px;
                    transition: background 0.2s;
                    white-space: nowrap;
                }

                .ep-preview-change:hover {
                    background: rgba(0,32,78,0.9);
                }

                .ep-preview-remove:hover {
                    background: rgba(239,68,68,0.9);
                }

                .ep-preview-badge {
                    position: absolute; top: 8px; left: 8px;
                    background: rgba(0,32,78,0.85); color: white;
                    font-size: 0.7rem; font-weight: 600; padding: 4px 10px;
                    border-radius: 6px; pointer-events: none;
                    display: flex; align-items: center; gap: 4px;
                }

                /* ── Footer ── */
                .ep-footer {
                    display: flex; justify-content: flex-end; gap: 0.625rem;
                    margin-top: 1.75rem; padding-top: 1.25rem;
                    border-top: 1px solid #f3f4f6;
                }
                .ep-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 0.625rem 1.375rem; border-radius: 10px;
                    border: none; font-size: 0.875rem; font-weight: 600;
                    font-family: 'Poppins', sans-serif; cursor: pointer;
                    transition: all 0.2s;
                }
                .ep-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ep-btn-cancel {
                    background: #f3f4f6; color: #374151;
                    border: 1.5px solid #e5e7eb;
                }
                .ep-btn-cancel:hover:not(:disabled) { background: #e5e7eb; }
                .ep-btn-save {
                    background: linear-gradient(135deg, #00204E, #34A129);
                    color: white; box-shadow: 0 4px 14px rgba(0,32,78,0.28);
                }
                .ep-btn-save:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,32,78,0.38);
                }

                .ep-action-error {
                    background: #fef2f2; color: #991b1b;
                    border: 1px solid #fecaca; border-radius: 10px;
                    padding: 0.75rem 1rem; font-size: 0.8125rem;
                    font-weight: 500; margin-bottom: 1rem;
                }

                .ep-spinner {
                    width: 14px; height: 14px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white; border-radius: 50%;
                    animation: ep-spin 0.75s linear infinite;
                }
                @keyframes ep-spin { to { transform: rotate(360deg); } }
            `}</style>

            <form onSubmit={handleSubmit}>

                {/* ── Action error ───────────────────────────────────── */}
                {actionError && (
                    <div className="ep-action-error">⚠️ {actionError}</div>
                )}

                {/* ── Form fields ────────────────────────────────────── */}
                <Row className="g-3">

                    {/* Product name */}
                    <Col md={6}>
                        <label className="ep-label">
                            Product Name <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            className={`ep-input ${errors.product_name ? 'error' : ''}`}
                            placeholder="e.g. Amul Gold Milk"
                            value={formData.product_name}
                            onChange={handleChange}
                        />
                        {errors.product_name && (
                            <p className="ep-error">⚠ {errors.product_name}</p>
                        )}
                    </Col>

                    {/* Brand */}
                    <Col md={6}>
                        <label className="ep-label">
                            Brand <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="brand"
                            className={`ep-input ${errors.brand ? 'error' : ''}`}
                            placeholder="e.g. Amul"
                            value={formData.brand}
                            onChange={handleChange}
                        />
                        {errors.brand && (
                            <p className="ep-error">⚠ {errors.brand}</p>
                        )}
                    </Col>

                    {/* Category */}
                    <Col md={6}>
                        <label className="ep-label">
                            Category <span>*</span>
                        </label>
                        <select
                            name="category_id"
                            className={`ep-select ${errors.category_id ? 'error' : ''}`}
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="ep-error">⚠ {errors.category_id}</p>
                        )}
                    </Col>

                    {/* Unit */}
                    <Col md={6}>
                        <label className="ep-label">
                            Unit <span>*</span>
                        </label>
                        <select
                            name="unit"
                            className="ep-select"
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
                        <label className="ep-label">MRP (₹) <span>*</span></label>
                        <input
                            type="number"
                            name="mrp"
                            className={`ep-input ${errors.mrp ? 'error' : ''}`}
                            placeholder="0.00"
                            value={formData.mrp}
                            onChange={handleChange}
                            step="0.01" min="0"
                        />
                        {errors.mrp && <p className="ep-error">⚠ {errors.mrp}</p>}
                    </Col>

                    {/* Selling price */}
                    <Col md={4}>
                        <label className="ep-label">
                            Selling Price (₹) <span>*</span>
                        </label>
                        <input
                            type="number"
                            name="selling_price"
                            className={`ep-input ${errors.selling_price ? 'error' : ''}`}
                            placeholder="0.00"
                            value={formData.selling_price}
                            onChange={handleChange}
                            step="0.01" min="0"
                        />
                        {errors.selling_price && (
                            <p className="ep-error">⚠ {errors.selling_price}</p>
                        )}
                    </Col>

                    {/* Stock */}
                    <Col md={4}>
                        <label className="ep-label">
                            Stock Quantity <span>*</span>
                        </label>
                        <input
                            type="number"
                            name="stock"
                            className={`ep-input ${errors.stock ? 'error' : ''}`}
                            placeholder="0"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                        />
                        {errors.stock && <p className="ep-error">⚠ {errors.stock}</p>}
                    </Col>

                    {/* Description */}
                    <Col md={12}>
                        <label className="ep-label">Description</label>
                        <textarea
                            name="description"
                            className="ep-textarea"
                            placeholder="Product description (optional)"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </Col>

                    {/* ── Image section ──────────────────────────────── */}
                    <Col md={12}>
                        <label className="ep-label">Product Image</label>

                        {displayImage ? (
                            <div className="ep-preview-wrap">
                                <img
                                    src={displayImage}
                                    alt="Product preview"
                                    className="ep-preview"
                                />

                                {/* ✅ Show locked badge if NOT own product */}
                                {!isOwnProduct && (
                                    <span className="ep-preview-badge">
                                        🔒 Product Image
                                    </span>
                                )}

                                {/* ✅ Action buttons - only if own product */}
                                {isOwnProduct && (
                                    <div className="ep-preview-actions">
                                        {/* Change image button - triggers hidden file input */}
                                        <button
                                            type="button"
                                            className="ep-preview-change"
                                            onClick={() => document.getElementById('ep-file-input').click()}
                                        >
                                            <FaCamera size={10} /> Change
                                        </button>

                                        {/* Remove button - only if user uploaded new image */}
                                        {previewUrl && (
                                            <button
                                                type="button"
                                                className="ep-preview-remove"
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
                                )}

                                {/* ✅ Hidden file input - triggered by "Change" button */}
                                {isOwnProduct && (
                                    <input
                                        id="ep-file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                )}
                            </div>
                        ) : (
                            /* ✅ Upload zone - disabled if not own product */
                            <div className={`ep-upload-zone ${!isOwnProduct ? 'disabled' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={!isOwnProduct}
                                />
                                <div className="ep-upload-icon">
                                    <FaCamera />
                                </div>
                                <p className="ep-upload-text">
                                    {isOwnProduct
                                        ? 'Click to upload product image'
                                        : 'Image cannot be changed'}
                                </p>
                                <p className="ep-upload-hint">
                                    {isOwnProduct
                                        ? 'PNG, JPG up to 5 MB'
                                        : 'This product image is managed by the platform'}
                                </p>
                            </div>
                        )}

                        {errors.image && (
                            <p className="ep-error">⚠ {errors.image}</p>
                        )}
                    </Col>
                </Row>

                {/* ── Footer ────────────────────────────────────────── */}
                <div className="ep-footer">
                    <button
                        type="button"
                        className="ep-btn ep-btn-cancel"
                        onClick={() => onClose(false)}
                        disabled={actionLoading}
                    >
                        <FaTimes size={13} />
                        {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        className="ep-btn ep-btn-save"
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <span className="ep-spinner" />
                                Updating…
                            </>
                        ) : (
                            <>
                                <FaSave size={13} />
                                {t('common.save') || 'Update Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    )
}

export default EditProduct