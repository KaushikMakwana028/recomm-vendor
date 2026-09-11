import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Inject custom styles for Recomm-themed SweetAlerts
const swalStyles = `
  .recomm-swal-popup {
    font-family: 'Poppins', sans-serif !important;
    border-radius: 20px !important;
    padding: 1.75rem 1.5rem !important;
    box-shadow: 0 20px 50px rgba(0, 32, 78, 0.18) !important;
    border: 1px solid rgba(0, 32, 78, 0.08) !important;
  }
  .recomm-swal-title {
    font-family: 'Poppins', sans-serif !important;
    font-weight: 700 !important;
    font-size: 1.35rem !important;
    color: #00204E !important;
    margin-bottom: 0.5rem !important;
  }
  .recomm-swal-html {
    font-family: 'Poppins', sans-serif !important;
    font-size: 0.925rem !important;
    color: #4b5563 !important;
    margin: 0.5rem 0 1rem !important;
    line-height: 1.5 !important;
  }
  .recomm-swal-confirm-btn {
    font-family: 'Poppins', sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.875rem !important;
    border-radius: 12px !important;
    padding: 0.65rem 1.75rem !important;
    background: linear-gradient(135deg, #34A129, #189031) !important;
    color: #ffffff !important;
    border: none !important;
    box-shadow: 0 4px 14px rgba(52, 161, 41, 0.3) !important;
    transition: all 0.2s ease !important;
    outline: none !important;
  }
  .recomm-swal-confirm-btn:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(52, 161, 41, 0.4) !important;
  }
  .recomm-swal-cancel-btn {
    font-family: 'Poppins', sans-serif !important;
    font-weight: 600 !important;
    font-size: 0.875rem !important;
    border-radius: 12px !important;
    padding: 0.65rem 1.75rem !important;
    background: #f3f4f6 !important;
    color: #4b5563 !important;
    border: none !important;
    margin-right: 8px !important;
    transition: all 0.2s ease !important;
    outline: none !important;
  }
  .recomm-swal-cancel-btn:hover {
    background: #e5e7eb !important;
    color: #1f2937 !important;
  }
  .recomm-swal-progress {
    background: linear-gradient(90deg, #34A129, #189031) !important;
    height: 4px !important;
    border-radius: 2px !important;
  }
`;

if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("recomm-swal-theme-style");
  if (!existingStyle) {
    const styleEl = document.createElement("style");
    styleEl.id = "recomm-swal-theme-style";
    styleEl.innerHTML = swalStyles;
    document.head.appendChild(styleEl);
  }
}

/**
 * Show a success SweetAlert for order progression
 */
export const showOrderSuccessAlert = ({
  title,
  html,
  text,
  timer = 1800,
  confirmButtonText = "Got it",
}) => {
  return Swal.fire({
    icon: "success",
    iconColor: "#34A129",
    title,
    html: html || (text ? `<p style="margin: 0; color: #4b5563;">${text}</p>` : undefined),
    timer,
    timerProgressBar: true,
    showConfirmButton: true,
    confirmButtonText,
    customClass: {
      popup: "recomm-swal-popup",
      title: "recomm-swal-title",
      htmlContainer: "recomm-swal-html",
      confirmButton: "recomm-swal-confirm-btn",
      timerProgressBar: "recomm-swal-progress",
    },
    buttonsStyling: false,
  });
};

/**
 * Show confirmation dialog before rejecting an order
 */
export const confirmRejectOrder = async (orderNumber) => {
  const result = await Swal.fire({
    title: "Reject Order?",
    html: `<p style="margin: 0; color: #4b5563;">Are you sure you want to reject order <b>${orderNumber}</b>?</p>`,
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Reject",
    cancelButtonText: "Keep Order",
    customClass: {
      popup: "recomm-swal-popup",
      title: "recomm-swal-title",
      htmlContainer: "recomm-swal-html",
      confirmButton: "recomm-swal-confirm-btn",
      cancelButton: "recomm-swal-cancel-btn",
    },
    buttonsStyling: false,
    focusCancel: true,
  });

  return result.isConfirmed;
};

/**
 * Show an error SweetAlert
 */
export const showOrderErrorAlert = ({
  title = "Action Failed",
  text = "Something went wrong. Please try again.",
}) => {
  return Swal.fire({
    icon: "error",
    iconColor: "#ef4444",
    title,
    text,
    confirmButtonText: "Close",
    customClass: {
      popup: "recomm-swal-popup",
      title: "recomm-swal-title",
      htmlContainer: "recomm-swal-html",
      confirmButton: "recomm-swal-confirm-btn",
    },
    buttonsStyling: false,
  });
};
