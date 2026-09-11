/**
 * Invoice Generator Utility for Recomm
 * Handles automatic invoice generation, printing, and downloading.
 */

import html2pdf from "html2pdf.js";

export const generateInvoiceHtml = (order, storeProfile = {}) => {
  if (!order) return "";

  const isUrgent = order.deliveryType === "urgent";
  const urgentCharge = isUrgent ? 50 : 0;
  const deliveryCharge = parseFloat(order.deliveryCharge) || 0;
  const baseDeliveryCharge = isUrgent && deliveryCharge >= 50 ? deliveryCharge - 50 : deliveryCharge;

  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
  const grandTotal = parseFloat(order.totalAmount) || (subtotal + deliveryCharge);

  const orderNumber = order.orderNumber || `ORD-${order.id}`;
  const orderDateStr = order.orderDate ? new Date(order.orderDate).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : new Date().toLocaleString("en-IN");

  const vendorName = storeProfile.store_name || storeProfile.name || "Recomm Vendor Store";
  const vendorOwner = storeProfile.owner_name || storeProfile.name || "";
  const vendorPhone = storeProfile.mobile || storeProfile.contact_number || "";
  const vendorAddress = storeProfile.address || "Store Address";
  const vendorPincode = storeProfile.pincode || "";

  const customerName = order.customerName || "Valued Customer";
  const customerPhone = order.mobile || "";
  const customerAddress = order.address || "Customer Delivery Address";

  const paymentMethod = (order.paymentMethod || "COD").toUpperCase();
  const paymentStatus = (order.paymentStatus || "PENDING").toUpperCase();
  const deliveryMode = order.deliveryOption === "self" ? "By Self" : (order.deliveryOption ? "Delivery Partner" : "Standard");
  const distanceKm = order.distance ? `${order.distance} KM` : "";

  const itemsRows = items.map((item, idx) => {
    const itemTotal = (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2);
    return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #00204E;">${item.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #334155;">${item.quantity}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #334155;">₹${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #34A129;">₹${itemTotal}</td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${orderNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Poppins', sans-serif; background: #f8fafc; color: #1e293b; padding: 24px 16px; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,32,78,0.08); overflow: hidden; border: 1px solid #e2e8f0; }
    .no-print-bar { max-width: 800px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .btn-action { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; font-family: 'Poppins', sans-serif; transition: all 0.2s; }
    .btn-print { background: linear-gradient(135deg, #34A129, #189031); color: #fff; box-shadow: 0 4px 12px rgba(52,161,41,0.25); }
    .btn-print:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(52,161,41,0.35); }
    .btn-download { background: #00204E; color: #fff; }
    .btn-download:hover { background: #001635; }
    .top-banner { height: 6px; background: linear-gradient(90deg, #00204E 0%, #34A129 100%); }
    .header { padding: 28px 32px 20px; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid #f1f5f9; }
    .brand-title { font-size: 26px; font-weight: 800; color: #00204E; letter-spacing: -0.5px; line-height: 1; }
    .brand-sub { font-size: 11px; color: #34A129; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .invoice-tag { text-align: right; }
    .invoice-title { font-size: 20px; font-weight: 700; color: #00204E; }
    .invoice-num { font-size: 14px; font-weight: 700; color: #34A129; margin-top: 2px; }
    .parties-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px 32px; background: #fbfcfe; border-bottom: 1px solid #f1f5f9; }
    .party-box h4 { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .party-box .name { font-size: 15px; font-weight: 700; color: #00204E; margin-bottom: 4px; }
    .party-box .info { font-size: 13px; color: #475569; line-height: 1.5; }
    .meta-strip { display: flex; flex-wrap: wrap; gap: 16px; padding: 16px 32px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
    .meta-item { display: flex; align-items: center; gap: 6px; }
    .meta-item strong { color: #00204E; }
    .items-section { padding: 24px 32px; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .items-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
    .totals-wrap { display: flex; justify-content: flex-end; padding: 16px 32px 28px; }
    .totals-box { width: 320px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 13px; }
    .totals-table { width: 100%; }
    .grand-total-row { border-top: 2px solid #00204E; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: 800; color: #00204E; }
    .grand-total-val { font-size: 20px; color: #34A129; text-align: right; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
    @media print {
      body { background: #fff; padding: 0; }
      .no-print, .no-print-bar { display: none !important; }
      .invoice-card { box-shadow: none !important; border: none !important; max-width: 100% !important; border-radius: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button onclick="window.close()" class="btn-action" style="background:#e2e8f0; color:#334155;">← Close</button>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn-action btn-print">🖨️ Print Invoice</button>
      <button onclick="downloadAsHtml()" class="btn-action btn-download">⬇️ Download Bill</button>
    </div>
  </div>

  <div class="invoice-card" id="invoiceArea">
    <div class="top-banner"></div>
    <div class="header">
      <div>
        <div class="brand-title">RECOMM</div>
        <div class="brand-sub">Smart Store & Quick Delivery</div>
      </div>
      <div class="invoice-tag">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-num">${orderNumber}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Date: ${orderDateStr}</div>
      </div>
    </div>

    <div class="parties-grid">
      <div class="party-box">
        <h4>Sold By (Vendor)</h4>
        <div class="name">${vendorName}</div>
        ${vendorOwner ? `<div class="info">Owner: ${vendorOwner}</div>` : ""}
        ${vendorPhone ? `<div class="info">Mobile: ${vendorPhone}</div>` : ""}
        <div class="info">${vendorAddress}${vendorPincode ? ` - ${vendorPincode}` : ""}</div>
      </div>
      <div class="party-box">
        <h4>Billed & Delivered To</h4>
        <div class="name">${customerName}</div>
        ${customerPhone ? `<div class="info">Mobile: ${customerPhone}</div>` : ""}
        <div class="info">${customerAddress}</div>
      </div>
    </div>

    <div class="meta-strip">
      <div class="meta-item"><strong>Payment:</strong> ${paymentMethod} (${paymentStatus})</div>
      <div class="meta-item"><strong>Delivery:</strong> ${isUrgent
        ? '<span style="background:#fee2e2; color:#dc2626; border:1px solid #fecaca; padding:3px 8px; border-radius:6px; font-weight:700; font-size:11px;">⚡ URGENT DELIVERY</span>'
        : '<span style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; padding:3px 8px; border-radius:6px; font-weight:700; font-size:11px;">NORMAL DELIVERY</span>'}</div>
      <div class="meta-item"><strong>Mode:</strong> ${deliveryMode}${distanceKm ? ` (${distanceKm})` : ""}</div>
    </div>

    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Product Description</th>
            <th style="width: 70px; text-align: center;">Qty</th>
            <th style="width: 110px; text-align: right;">Unit Price</th>
            <th style="width: 110px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <div class="totals-wrap">
      <div class="totals-box">
        <table class="totals-table">
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Subtotal:</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #00204E;">₹${subtotal.toFixed(2)}</td>
          </tr>
          ${baseDeliveryCharge > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Charge${distanceKm ? ` (${distanceKm})` : ""}:</td>
            <td style="padding: 6px 0; text-align: right; color: #334155; font-weight: 600;">+ ₹${baseDeliveryCharge.toFixed(2)}</td>
          </tr>` : ""}
          ${isUrgent ? `
          <tr>
            <td style="padding: 6px 0; color: #dc2626; font-weight: 700;">⚡ Urgent Delivery Surcharge:</td>
            <td style="padding: 6px 0; text-align: right; color: #dc2626; font-weight: 700;">+ ₹${urgentCharge.toFixed(2)}</td>
          </tr>` : ""}
          <tr class="grand-total-row">
            <td style="padding: 8px 0; font-weight: 800; color: #00204E;">Total Amount:</td>
            <td class="grand-total-val" style="padding: 8px 0; font-weight: 800;">₹${grandTotal.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="footer">
      <p style="font-weight: 600; color: #00204E; margin-bottom: 4px;">Thank you for shopping with Recomm!</p>
      <p>This is a computer-generated invoice and does not require a physical signature.</p>
    </div>
  </div>

  <script>
    function downloadAsHtml() {
      var html = document.documentElement.outerHTML;
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Invoice_${orderNumber}.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;
};

/**
 * Open print window / PDF viewer for the invoice
 */
export const printOrderInvoice = async (order, storeProfile = {}) => {
  // 1. If backend PDF invoice exists, open in a new tab for native PDF viewer & print
  if (order?.invoiceUrl) {
    const win = window.open(order.invoiceUrl, "_blank");
    if (win) {
      win.focus();
      return;
    }
  }

  // 2. Client-side PDF generation fallback via html2pdf blob
  const htmlContent = generateInvoiceHtml(order, storeProfile);
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "800px";
  document.body.appendChild(container);

  const orderNumber = order?.orderNumber || `ORD-${order?.id || Date.now()}`;
  const opt = {
    margin: [6, 6, 6, 6],
    filename: `Invoice_${orderNumber}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    const pdfBlob = await html2pdf().set(opt).from(container).outputPdf("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    const win = window.open(blobUrl, "_blank");
    if (win) {
      win.focus();
    } else {
      alert("Please allow popups to view and print the invoice PDF.");
    }
  } catch (err) {
    console.warn("Client PDF print preview error, falling back to window print:", err);
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 350);
    }
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * Trigger download of the invoice as a genuine PDF file
 */
export const downloadOrderInvoice = async (order, storeProfile = {}) => {
  const orderNumber = order?.orderNumber || `ORD-${order?.id || Date.now()}`;

  // 1. If backend invoiceUrl exists, download the backend-generated PDF directly
  if (order?.invoiceUrl) {
    try {
      const downloadUrl = order.invoiceUrl.includes("?")
        ? `${order.invoiceUrl}&download=1`
        : `${order.invoiceUrl}?download=1`;

      const response = await fetch(downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `Invoice_${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (err) {
      console.warn("Direct PDF fetch failed, falling back to client PDF generation:", err);
    }
  }

  // 2. Client-side PDF generation via html2pdf
  const htmlContent = generateInvoiceHtml(order, storeProfile);
  const container = document.createElement("div");
  container.innerHTML = htmlContent;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.width = "800px";
  document.body.appendChild(container);

  const opt = {
    margin: [6, 6, 6, 6],
    filename: `Invoice_${orderNumber}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } catch (err) {
    console.error("PDF download generation failed:", err);
    alert("Failed to generate PDF invoice. Please try again.");
  } finally {
    document.body.removeChild(container);
  }
};
