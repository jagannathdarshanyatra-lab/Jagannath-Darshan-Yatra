const { jsPDF } = require("jspdf");
const fs = require('fs');
const path = require('path');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');

// ── Color constants (matching the Mango/Orange website theme) ──
const PRIMARY = [249, 115, 22];       // hsl(24, 95%, 53%) → rgb
const PRIMARY_DARK = [194, 82, 11];   // darker shade for text
const DARK = [56, 32, 12];            // foreground
const MUTED = [120, 90, 65];          // muted text
const LIGHT_BG = [255, 248, 240];     // warm background
const ACCENT_BG = [255, 237, 219];    // peach section bg
const WHITE = [255, 255, 255];
const BORDER = [230, 210, 190];

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
  return booking._id?.toString().slice(-8).toUpperCase() || "N/A";
};

const generateInvoicePdf = async (booking) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Pre-load logo from local assets
  let logoData = null;
  try {
    const logoPath = path.join(__dirname, '../assets/Logo_Bharat_Darshan.png');
    if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (err) {
    console.error('Logo loading error:', err);
  }

  // ── SHARED HELPERS ──
  const drawPageFooterBar = (pageNum) => {
    doc.setFillColor(...PRIMARY);
    doc.rect(0, pageH - 8, pageW, 8, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...WHITE);
    doc.text(
      `© 2026 Bharat Darshan. All rights reserved. | www.bharat-darshan.com`,
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
  //  PAGE 1
  // ══════════════════════════════════════════

  // ── HEADER BAND ──
  doc.setFillColor(...ACCENT_BG);
  doc.roundedRect(margin, y, contentW, 42, 3, 3, "F");

  // Logo handling
  if (logoData) {
    doc.addImage(logoData, "PNG", margin + 4, y + 4, 34, 34);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...PRIMARY);
    doc.text("Bharat Darshan", margin + 6, y + 20);
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
  const tierMatch = (booking.packageName || "").match(/\b(Standard|Pro|Premium|Elite)\b/i);
  infoRow("Tier:", tierMatch ? tierMatch[1] : "Standard");
  infoRow("Destination:", booking.destination || "N/A");
  infoRow("Trip Date:", fmtDate(booking.tripDate));
  infoRow("Travelers:", `${booking.travelers || 1} Person(s)`);
  infoRow("Booking Status:", (booking.status || "pending").toUpperCase());
  y += 6;

  // ── HOTEL DETAILS ──
  const hotels = booking.selectedHotels || [];
  if (hotels.length > 0) {
    sectionHeader("Hotel Details");

    for (let i = 0; i < hotels.length; i++) {
        const hotel = hotels[i];
        let hDetails = { name: hotel.hotelName, destination: hotel.city, location: "-", amenities: [] };
        
        try {
            const fullHotel = await Hotel.findById(hotel.hotelId);
            if (fullHotel) {
                hDetails.location = fullHotel.location || "-";
                hDetails.amenities = fullHotel.amenities || [];
            }
        } catch (e) {}

        doc.setFillColor(...ACCENT_BG);
        doc.roundedRect(margin, y - 3, contentW, 8, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...PRIMARY_DARK);
        doc.text(`Hotel ${i + 1}`, margin + 4, y + 2);
        y += 10;

        infoRow("Hotel Name:", hDetails.name);
        infoRow("Destination:", hDetails.destination);
        infoRow("Location:", hDetails.location);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text("Amenities:", margin + 4, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK);
        const amenitiesText = hDetails.amenities.length > 0 ? hDetails.amenities.join(" • ") : "-";
        const maxAmenityW = contentW - 54;
        const amenityLines = doc.splitTextToSize(amenitiesText, maxAmenityW);
        doc.text(amenityLines, margin + 50, y);
        y += amenityLines.length * 5 + 3;

        if (i < hotels.length - 1) {
            doc.setDrawColor(...BORDER);
            doc.setLineWidth(0.2);
            doc.line(margin + 4, y, pageW - margin - 4, y);
            y += 6;
        }

        // Handle page break if needed
        if (y > pageH - 30) {
            drawPageFooterBar();
            doc.addPage();
            y = margin + 10;
        }
    }
  }

  drawPageFooterBar();

  // ══════════════════════════════════════════
  //  PAGE 2
  // ══════════════════════════════════════════
  doc.addPage();
  y = margin;

  // ── Mini header on page 2 ──
  doc.setFillColor(...ACCENT_BG);
  doc.roundedRect(margin, y, contentW, 16, 3, 3, "F");
  if (logoData) doc.addImage(logoData, "PNG", margin + 3, y + 1.5, 13, 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PRIMARY);
  doc.text("Bharat Darshan", margin + 18, y + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(`Invoice #${getBookingId(booking)}`, pageW - margin - 4, y + 10, { align: "right" });

  y += 24;

  // ── PRICING SUMMARY ──
  sectionHeader("Pricing Summary");

  // Fetch package for original price
  let packageOriginalPrice = null;
  if (booking.packageId) {
    try {
        const pkg = await Package.findById(booking.packageId);
        if (pkg && pkg.originalPrice) packageOriginalPrice = Number(pkg.originalPrice);
    } catch (e) {}
  }

  const tableLeft = margin;
  const tableRight = pageW - margin;
  const labelX = margin + 6;
  const valueX = tableRight - 6;
  const rowH = 9;
  let rowIndex = 0;

  const GREEN = [22, 163, 74];
  const GRAY_STRIKE = [160, 140, 120];

  const pricingRow = (label, value, opts = {}) => {
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

  const hasOriginalPrice = packageOriginalPrice && packageOriginalPrice > perPerson;
  const originalTotalForPax = hasOriginalPrice ? packageOriginalPrice * travelers : null;
  const discountPercent = hasOriginalPrice ? Math.round(((packageOriginalPrice - perPerson) / packageOriginalPrice) * 100) : 0;
  const savingsAmount = hasOriginalPrice ? originalTotalForPax - basePrice : 0;

  if (hasOriginalPrice) {
    pricingRow(`Original Price (for ${travelers} pax)`, fmt(originalTotalForPax), { valueColor: GRAY_STRIKE, strikethrough: true });
  }

  pricingRow(hasOriginalPrice ? `Discounted Price (for ${travelers} pax)` : `Package Price (for ${travelers} pax)`, fmt(basePrice), { bold: true });

  if (booking.gstAmount) pricingRow("GST / Taxes", `+ ${fmt(booking.gstAmount)}`);
  if (booking.couponDiscount) pricingRow(`Coupon Discount${booking.couponCode ? ` (${booking.couponCode})` : ""}`, `- ${fmt(booking.couponDiscount)}`, { valueColor: GREEN, labelColor: GREEN });

  y += 4;

  // ── TOTAL AMOUNT BOX ──
  const totalBoxH = hasOriginalPrice ? 28 : 14;
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(tableLeft, y - 4, contentW, totalBoxH, 2, 2, "F");

  if (hasOriginalPrice) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...WHITE);
    doc.text("TOTAL AMOUNT", labelX, y + 3);
    doc.setFontSize(15); doc.text(fmt(totalPrice), valueX, y + 3.5, { align: "right" });

    const origText = fmt(originalTotalForPax);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(255, 230, 200);
    doc.text(origText, valueX, y + 11, { align: "right" });
    const origTextW = doc.getTextWidth(origText);
    doc.setDrawColor(255, 230, 200); doc.setLineWidth(0.35); doc.line(valueX - origTextW, y + 9.8, valueX, y + 9.8);

    const discountBadge = `${discountPercent}% OFF`;
    const badgeW = doc.getTextWidth(discountBadge) + 6;
    const badgeX = valueX - badgeW;
    doc.setFillColor(255, 255, 255); doc.roundedRect(badgeX, y + 15.5, badgeW, 5, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(...GREEN); doc.text(discountBadge, badgeX + 3, y + 19);

    const saveText = "You save " + fmt(savingsAmount);
    doc.setFontSize(8.5); doc.setTextColor(...WHITE); doc.text(saveText, badgeX - 3, y + 19, { align: "right" });
  } else {
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...WHITE);
    doc.text("TOTAL AMOUNT", labelX, y + 4.5);
    doc.setFontSize(15); doc.text(fmt(totalPrice), valueX, y + 5, { align: "right" });
  }

  y += totalBoxH + 8;

  // ── PAYMENT DETAILS ──
  const paymentRows = [];
  paymentRows.push({ label: "Payment Status", value: (booking.paymentStatus || "pending").toUpperCase(), color: booking.paymentStatus === "paid" ? [22, 163, 74] : [234, 179, 8] });
  if (booking.paymentMethod) paymentRows.push({ label: "Payment Method", value: booking.paymentMethod.toUpperCase() });
  if (booking.paymentId) paymentRows.push({ label: "Transaction ID", value: booking.paymentId });

  doc.setFillColor(252, 249, 245); doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
  doc.roundedRect(tableLeft, y - 4, contentW, paymentRows.length * 8 + 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...PRIMARY_DARK);
  doc.text("PAYMENT DETAILS", labelX, y + 2); y += 10;

  paymentRows.forEach((row) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...MUTED);
    doc.text(row.label, labelX, y);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...(row.color || DARK));
    doc.text(row.value, valueX, y, { align: "right" });
    y += 8;
  });

  // ── FOOTER ──
  const footerY = pageH - 48;
  doc.setDrawColor(...PRIMARY); doc.setLineWidth(0.8); doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...PRIMARY);
  doc.text("Bharat Darshan", margin + 4, footerY + 9);
  doc.setFontSize(8); doc.setTextColor(...MUTED); doc.text("Your Trusted Travel Partner", margin + 4, footerY + 14);
  doc.setFontSize(10); doc.setTextColor(...DARK); doc.text("Booking Via Jungle Resort Pvt. Ltd.", margin + 4, footerY + 22);
  doc.setDrawColor(...DARK); doc.setLineWidth(0.3); doc.line(pageW - margin - 60, footerY + 25, pageW - margin - 4, footerY + 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
  doc.text("Authorized Signature", pageW - margin - 4, footerY + 30, { align: "right" });

  drawPageFooterBar();

  return Buffer.from(doc.output("arraybuffer"));
};

module.exports = { generateInvoicePdf, getBookingId };
