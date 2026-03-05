import { jsPDF } from "jspdf";
import LogoPng from "@/assets/Logo_Bharat_Darshan.png";

// ── Color constants (matching the Mango/Orange website theme) ──
const PRIMARY = [249, 115, 22];       // hsl(24, 95%, 53%) → rgb
const PRIMARY_DARK = [194, 82, 11];   // darker shade for text
const DARK = [56, 32, 12];            // foreground
const MUTED = [120, 90, 65];          // muted text
const LIGHT_BG = [255, 248, 240];     // warm background
const ACCENT_BG = [255, 237, 219];    // peach section bg
const WHITE = [255, 255, 255];
const BORDER = [230, 210, 190];

// ── Helpers ──
// Note: jsPDF built-in fonts do not support ₹ (Unicode U+20B9), so we use "Rs."
const fmt = (num) =>
  num != null ? `Rs. ${Number(num).toLocaleString("en-IN")}` : "-";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

const getBookingId = (booking) => {
  if (booking.bookingId) return booking.bookingId;
  if (booking.bookingNumber) return `TUR${String(booking.bookingNumber).padStart(3, "0")}`;
  return booking._id?.slice(-8).toUpperCase() || "N/A";
};

/**
 * Load an image URL and return a base64 data-URL suitable for jsPDF.
 */
function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Main export ──
export async function generateInvoicePdf(booking) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const API_URL = API_BASE.includes('/api') ? API_BASE : `${API_BASE.replace(/\/$/, "")}/api`;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Pre-load logo once
  let logoData = null;
  try {
    logoData = await loadImageAsBase64(LogoPng);
  } catch {
    // logo loading failed, we'll use text fallback
  }

  // ────────────────────────────────────────
  //  SHARED HELPERS
  // ────────────────────────────────────────
  const drawPageFooterBar = () => {
    doc.setFillColor(...PRIMARY);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...WHITE);
    doc.text(
      "© 2026 Jagannath Darshan Yatra. All rights reserved. | www.jagannathdarshanyatra.com",
      pageW / 2,
      pageH - 3,
      { align: "center" }
    );
  };

  const sectionHeader = (label) => {
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(margin, y, contentW, 8, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(label, margin + 4, y + 5.6);
    y += 12;
  };
  const infoRow = (label, value) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label, margin + 4, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(String(value || "-"), margin + 50, y);
    y += 7;
  };
  // ══════════════════════════════════════════
  //  PAGE 1 - Header, Customer, Tour, Hotels
  // ══════════════════════════════════════════

  // ── HEADER BAND ──
  doc.setFillColor(...ACCENT_BG);
  doc.roundedRect(margin, y, contentW, 42, 3, 3, "F");

  // Logo (left)
  if (logoData) {
    doc.addImage(logoData, "PNG", margin + 4, y + 4, 34, 34);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...PRIMARY);
    doc.text("Jagannath Darshan Yatra", margin + 6, y + 22);
  }

  // Right side - INVOICE title + company location
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...PRIMARY);
  doc.text("INVOICE", pageW - margin - 4, y + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Office No: 307, 3rd Floor, Esplanade One Mall,",
    pageW - margin - 4, y + 19, { align: "right" }
  );
  doc.text(
    "Rasulgarh, Bhubaneswar, Odisha 751010",
    pageW - margin - 4, y + 23.5, { align: "right" }
  );
  doc.text(
    "Phone: +91 95560 06338 | bharatdarshan.hq@gmail.com",
    pageW - margin - 4, y + 28, { align: "right" }
  );

  // Invoice number + date
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(
    `Invoice #${getBookingId(booking)}`,
    pageW - margin - 4, y + 34, { align: "right" }
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `Date: ${fmtDate(booking.createdAt || booking.bookingDate)}`,
    pageW - margin - 4, y + 38.5, { align: "right" }
  );

  y += 50;

  // ── CUSTOMER INFORMATION ──
  sectionHeader("Customer Information");
  infoRow("Name:", booking.contactName || "N/A");
  infoRow("Email:", booking.contactEmail || "N/A");
  infoRow("Phone:", booking.contactPhone || "N/A");
  y += 6;

  // ── TOUR DETAILS ──
  sectionHeader("Tour Details");
  infoRow("Tour ID:", getBookingId(booking));
  infoRow("Package:", booking.packageName || "N/A");
  // Extract tier from package name (e.g., "Puri Pro Spiritual Explorer" → "Pro")
  const tierMatch = (booking.packageName || "").match(/\b(Standard|Pro|Premium|Elite)\b/i);
  infoRow("Tier:", tierMatch ? tierMatch[1] : "Standard");
  infoRow("Destination:", booking.destination || "N/A");
  infoRow("Trip Date:", fmtDate(booking.tripDate));
  infoRow("Travelers:", `${booking.travelers || 1} Person(s)`);
  infoRow("Booking Status:", (booking.status || "pending").toUpperCase());
  y += 6;

  // ── TRAVELLER DETAILS (Table) ──
  const travellerDetails = booking.travellerDetails || [];
  if (travellerDetails.length > 0) {
    // Check if we need a new page (need at least ~60mm for a small table)
    const estimatedHeight = 20 + travellerDetails.length * 8;
    if (y + estimatedHeight > pageH - 55) {
      drawPageFooterBar();
      doc.addPage();
      y = margin;
    }

    sectionHeader("Traveller Details");

    // Table header
    const colX = {
      num: margin + 4,
      name: margin + 16,
      gender: margin + 90,
      age: margin + 125,
      type: margin + 145,
    };

    // Header row background
    doc.setFillColor(...ACCENT_BG);
    doc.rect(margin, y - 5, contentW, 8, "F");
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.15);
    doc.line(margin, y + 3, pageW - margin, y + 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY_DARK);
    doc.text("#", colX.num, y);
    doc.text("Name", colX.name, y);
    doc.text("Gender", colX.gender, y);
    doc.text("Age", colX.age, y);
    doc.text("Type", colX.type, y);
    y += 8;

    // Data rows
    travellerDetails.forEach((t, i) => {
      // Check for page overflow
      if (y + 8 > pageH - 55) {
        drawPageFooterBar();
        doc.addPage();
        y = margin;
      }

      // Alternating row background
      doc.setFillColor(...(i % 2 === 0 ? LIGHT_BG : WHITE));
      doc.rect(margin, y - 5, contentW, 8, "F");
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.1);
      doc.line(margin, y + 3, pageW - margin, y + 3);

      const isChild = t.isChild || (t.age != null && t.age < 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      doc.text(String(i + 1), colX.num, y);
      doc.setFont("helvetica", "bold");
      doc.text(t.name || "-", colX.name, y);
      doc.setFont("helvetica", "normal");
      doc.text(t.gender || "-", colX.gender, y);
      doc.text(t.age != null ? String(t.age) : "-", colX.age, y);

      // Type badge
      if (isChild) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235); // blue
        doc.text("Child", colX.type, y);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74); // green
        doc.text("Adult", colX.type, y);
      }

      y += 8;
    });

    // Summary row
    const adultCount = travellerDetails.filter(t => !t.isChild && (t.age == null || t.age >= 10)).length;
    const childCount = travellerDetails.length - adultCount;
    doc.setFillColor(...ACCENT_BG);
    doc.rect(margin, y - 5, contentW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY_DARK);
    doc.text(
      `Total: ${travellerDetails.length} traveller(s) - ${adultCount} adult(s)${childCount > 0 ? `, ${childCount} child(ren) (under 10, free)` : ""}`,
      margin + 4,
      y
    );
    y += 10;
  }

  // ── HOTEL DETAILS (Table) ──
  const hotels = booking.selectedHotels || [];
  if (hotels.length > 0) {
    sectionHeader("Hotel Details");

    // Fetch full hotel details from API for each selected hotel
    const hotelDetails = await Promise.all(
      hotels.map(async (hotel) => {
        try {
          const res = await fetch(`${API_URL}/hotels/${hotel.hotelId}`);
          const data = await res.json();
          if (data && (data.hotel || data)) {
            const h = data.hotel || data;
            return {
              name: h.name || hotel.hotelName || "-",
              destination: h.destination || hotel.city || "-",
              location: h.location || "-",
              amenities: h.amenities || [],
            };
          }
        } catch {
          // fallback to booking data
        }
        return {
          name: hotel.hotelName || "-",
          destination: hotel.city || "-",
          location: "-",
          amenities: [],
        };
      })
    );

    hotelDetails.forEach((hotel, i) => {
      // Hotel number label with accent bg
      doc.setFillColor(...ACCENT_BG);
      doc.roundedRect(margin, y - 3, contentW, 8, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...PRIMARY_DARK);
      doc.text(`Hotel ${i + 1}`, margin + 4, y + 2);
      y += 10;

      // Hotel Name
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("Hotel Name:", margin + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(hotel.name, margin + 50, y);
      y += 7;

      // Destination
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Destination:", margin + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(hotel.destination, margin + 50, y);
      y += 7;

      // Location
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Location:", margin + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(hotel.location, margin + 50, y);
      y += 7;

      // Amenities
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text("Amenities:", margin + 4, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      const amenitiesText = hotel.amenities.length > 0
        ? hotel.amenities.join(" • ")
        : "-";
      // Wrap amenities text if it's too long
      const maxAmenityW = contentW - 54;
      const amenityLines = doc.splitTextToSize(amenitiesText, maxAmenityW);
      doc.text(amenityLines, margin + 50, y);
      y += amenityLines.length * 5 + 3;

      // Spacing between hotels
      if (i < hotelDetails.length - 1) {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.2);
        doc.line(margin + 4, y, pageW - margin - 4, y);
        y += 6;
      }
    });
  }

  // ── Page 1 - "Continued on next page" note ──
  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("- Continued on next page -", pageW / 2, y, { align: "center" });

  // Page 1 bottom bar
  drawPageFooterBar();

  // ══════════════════════════════════════════
  //  PAGE 2 - Pricing Summary + Footer
  // ══════════════════════════════════════════
  doc.addPage();
  y = margin;

  // ── Mini header on page 2 ──
  doc.setFillColor(...ACCENT_BG);
  doc.roundedRect(margin, y, contentW, 16, 3, 3, "F");

  if (logoData) {
    doc.addImage(logoData, "PNG", margin + 3, y + 1.5, 13, 13);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...PRIMARY);
  doc.text("Bharat Darshan", margin + 19, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Your Trusted Travel Partner", margin + 19, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(
    `Invoice #${getBookingId(booking)}`,
    pageW - margin - 4, y + 7, { align: "right" }
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `Page 2 of 2`,
    pageW - margin - 4, y + 12, { align: "right" }
  );

  y += 24;

  // ── Fetch package data for originalPrice ──
  let packageOriginalPrice = null;
  if (booking.packageId) {
    try {
      const pkgRes = await fetch(`${API_URL}/packages/${booking.packageId}`);
      const pkgData = await pkgRes.json();
      const pkg = pkgData?.package || pkgData;
      if (pkg && pkg.originalPrice && !isNaN(pkg.originalPrice)) {
        packageOriginalPrice = Number(pkg.originalPrice);
      }
    } catch {
      // fallback - no original price available
    }
  }

  // ── PRICING SUMMARY ──
  sectionHeader("Pricing Summary");

  const tableLeft = margin;
  const tableRight = pageW - margin;
  const labelX = margin + 6;
  const valueX = tableRight - 6;
  const rowH = 9;
  let rowIndex = 0;

  const GREEN = [22, 163, 74];
  const GRAY_STRIKE = [160, 140, 120];

  const pricingRow = (label, value, opts = {}) => {
    // Alternating row bg
    if (!opts.noBg) {
      doc.setFillColor(...(rowIndex % 2 === 0 ? LIGHT_BG : WHITE));
      doc.rect(tableLeft, y - 5, contentW, rowH, "F");
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.15);
      doc.line(tableLeft, y - 5 + rowH, tableRight, y - 5 + rowH);
    }
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.fontSize || 9.5);
    doc.setTextColor(...(opts.labelColor || MUTED));
    doc.text(label, labelX, y);
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setTextColor(...(opts.valueColor || DARK));
    doc.text(String(value), valueX, y, { align: "right" });

    // Strikethrough effect for original prices
    if (opts.strikethrough) {
      const textW = doc.getTextWidth(String(value));
      doc.setDrawColor(...(opts.valueColor || DARK));
      doc.setLineWidth(0.3);
      doc.line(valueX - textW, y - 1.2, valueX, y - 1.2);
    }

    y += rowH;
    rowIndex++;
  };

  const travelers = booking.travelers || 1;
  const totalPrice = booking.totalPrice || 0;
  const basePrice = booking.basePrice || totalPrice;
  const perPerson = travelers > 0 ? Math.round(basePrice / travelers) : basePrice;

  // Calculate original price totals and discount info
  const hasOriginalPrice = packageOriginalPrice && packageOriginalPrice > perPerson;
  const originalTotalForPax = hasOriginalPrice ? packageOriginalPrice * travelers : null;
  const discountPercent = hasOriginalPrice
    ? Math.round(((packageOriginalPrice - perPerson) / packageOriginalPrice) * 100)
    : 0;
  const savingsAmount = hasOriginalPrice ? originalTotalForPax - basePrice : 0;

  // Row 1: Original Price (strikethrough) - only if discount exists
  if (hasOriginalPrice) {
    pricingRow(
      `Original Price (for ${travelers} pax)`,
      fmt(originalTotalForPax),
      { valueColor: GRAY_STRIKE, strikethrough: true }
    );
  }

  // Row 2: Discounted / Actual Price
  pricingRow(
    hasOriginalPrice ? `Discounted Price (for ${travelers} pax)` : `Package Price (for ${travelers} pax)`,
    fmt(basePrice),
    { bold: true, valueColor: DARK }
  );

  if (booking.gstAmount) {
    pricingRow("GST / Taxes", `+ ${fmt(booking.gstAmount)}`);
  }

  if (booking.couponDiscount) {
    pricingRow(
      `Coupon Discount${booking.couponCode ? ` (${booking.couponCode})` : ""}`,
      `- ${fmt(booking.couponDiscount)}`,
      { valueColor: GREEN, labelColor: GREEN }
    );
  }

  y += 4;

  // ── TOTAL AMOUNT HIGHLIGHT BOX ──
  const totalBoxH = hasOriginalPrice ? 28 : 14;
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(tableLeft, y - 4, contentW, totalBoxH, 2, 2, "F");

  if (hasOriginalPrice) {
    // Line 1: "TOTAL AMOUNT" label + discounted total (large)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text("TOTAL AMOUNT", labelX, y + 3);

    // Discounted price - large, bold, right-aligned
    doc.setFontSize(15);
    doc.text(fmt(totalPrice), valueX, y + 3.5, { align: "right" });

    // Line 2: Original price with strikethrough (right) + "You save" (left)
    // Original price - smaller, faded, with strikethrough
    const origText = fmt(originalTotalForPax);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 230, 200);
    doc.text(origText, valueX, y + 11, { align: "right" });
    const origTextW = doc.getTextWidth(origText);
    doc.setDrawColor(255, 230, 200);
    doc.setLineWidth(0.35);
    doc.line(valueX - origTextW, y + 9.8, valueX, y + 9.8);

    // Line 3: "You save Rs. X,XXX" + discount badge - right-aligned below original price
    const discountBadge = `${discountPercent}% OFF`;
    doc.setFontSize(7);
    const badgeW = doc.getTextWidth(discountBadge) + 6;

    // Position badge at the far right
    const badgeX = valueX - badgeW;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(badgeX, y + 15.5, badgeW, 5, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    doc.text(discountBadge, badgeX + 3, y + 19);

    // "You save" text positioned just to the left of the badge
    const saveLabel = "You save ";
    const saveAmount = fmt(savingsAmount);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...WHITE);
    const saveText = saveLabel + saveAmount;
    const saveTextX = badgeX - 3;
    doc.text(saveText, saveTextX, y + 19, { align: "right" });
  } else {
    // No discount - simple layout
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text("TOTAL AMOUNT", labelX, y + 4);
    doc.setFontSize(15);
    doc.text(fmt(totalPrice), valueX, y + 4.5, { align: "right" });
  }

  y += totalBoxH + 8;

  // ── PAYMENT DETAILS Card ──
  const paymentRows = [];
  paymentRows.push({
    label: "Payment Status",
    value: (booking.paymentStatus || "pending").toUpperCase(),
    color: booking.paymentStatus === "paid" ? [22, 163, 74] : [234, 179, 8],
  });
  if (booking.paymentMethod) {
    paymentRows.push({
      label: "Payment Method",
      value: booking.paymentMethod.toUpperCase(),
    });
  }
  if (booking.paymentId) {
    paymentRows.push({
      label: "Transaction ID",
      value: booking.paymentId,
    });
  }

  const payBoxH = paymentRows.length * 8 + 14;
  doc.setFillColor(252, 249, 245);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableLeft, y - 4, contentW, payBoxH, 2, 2, "FD");

  // Mini-header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_DARK);
  doc.text("PAYMENT DETAILS", labelX, y + 2);
  y += 10;

  paymentRows.forEach((row) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(row.label, labelX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(row.color || DARK));
    doc.text(row.value, valueX, y, { align: "right" });
    y += 8;
  });

  // ────────────────────────────────────────
  //  FOOTER - Company + Signature (pinned to bottom of page 2)
  // ────────────────────────────────────────
  const footerY = pageH - 48;

  // Thin orange divider
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.8);
  doc.line(margin, footerY, pageW - margin, footerY);

  // Left: Company + Founder
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...PRIMARY);
  doc.text("Bharat Darshan", margin + 4, footerY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Your Trusted Travel Partner", margin + 4, footerY + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Booking Via Jungle Resort Pvt. Ltd.", margin + 4, footerY + 22);

  // Right: Authorized Signature
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.3);
  doc.line(pageW - margin - 60, footerY + 25, pageW - margin - 4, footerY + 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Authorized Signature", pageW - margin - 4, footerY + 30, {
    align: "right",
  });

  // Page 2 bottom bar
  drawPageFooterBar();

  // ── Save ─────────────────────────────────
  const fileName = `Bharat_Darshan_Invoice_${getBookingId(booking)}.pdf`;
  doc.save(fileName);
}
