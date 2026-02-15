import jsPDF from "jspdf";

interface PdfInductionData {
  propertyAddress: string;
  gas: { reading: string; photoTaken: boolean };
  electric: { reading: string; photoTaken: boolean };
  water: { reading: string; photoTaken: boolean };
  smokeAlarmsTested: boolean;
  carbonMonoxideTested: boolean;
  stopcockShown: boolean;
  gasSafetyReceived: boolean;
  epcReceived: boolean;
  eicrReceived: boolean;
  govInfoSheetReceived: boolean;
  tenantSignature: string | null;
  completedAt: string;
}

export function generateHandoverPdf(data: PdfInductionData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const sage = [141, 170, 145] as const;
  const dark = [40, 45, 50] as const;

  // Header bar
  doc.setFillColor(...sage);
  doc.rect(0, 0, pw, 38, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Handover Certificate", 16, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated ${new Date(data.completedAt).toLocaleDateString("en-GB")}`, 16, 30);

  // Property
  let y = 50;
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Property", 16, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(data.propertyAddress, 16, y);
  y += 14;

  // Meter Readings
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Utility Meter Readings", 16, y);
  y += 9;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const meters = [
    { label: "Gas", reading: data.gas.reading, photo: data.gas.photoTaken },
    { label: "Electric", reading: data.electric.reading, photo: data.electric.photoTaken },
    { label: "Water", reading: data.water.reading, photo: data.water.photoTaken },
  ];

  for (const m of meters) {
    doc.setFont("helvetica", "bold");
    doc.text(`${m.label}:`, 16, y);
    doc.setFont("helvetica", "normal");
    const isNA = m.reading === "not_applicable";
    doc.text(`${isNA ? "N/A" : (m.reading || "—")}${!isNA && m.photo ? "  (photo attached)" : ""}`, 45, y);
    y += 7;
  }
  y += 6;

  // Safety Checks
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Safety Checks", 16, y);
  y += 9;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const checks = [
    { label: "Smoke Alarms Tested", done: data.smokeAlarmsTested },
    { label: "Carbon Monoxide Alarms Tested", done: data.carbonMonoxideTested },
    { label: "Stopcock Location Shown", done: data.stopcockShown },
  ];

  for (const c of checks) {
    doc.text(`${c.done ? "✓" : "✗"}  ${c.label}`, 16, y);
    y += 7;
  }
  y += 6;

  // Documents
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Documents Provided", 16, y);
  y += 9;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const docs = [
    { label: "EPC", done: data.epcReceived },
    { label: "Gas Safety Certificate", done: data.gasSafetyReceived, na: (data as any).gasSafetyNA },
    { label: "EICR", done: data.eicrReceived },
    { label: "2026 Government Information Sheet", done: data.govInfoSheetReceived },
  ];

  for (const d of docs) {
    const marker = (d as any).na ? "N/A" : (d.done ? "✓" : "✗");
    doc.text(`${marker}  ${d.label}`, 16, y);
    y += 7;
  }
  y += 10;

  // Signature
  if (data.tenantSignature) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Tenant Signature", 16, y);
    y += 5;
    doc.addImage(data.tenantSignature, "PNG", 16, y, 80, 30);
    y += 35;
    doc.setDrawColor(...sage);
    doc.line(16, y, 96, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Signed digitally via Landy Pro", 16, y);
  }

  // Footer
  const fh = doc.internal.pageSize.getHeight();
  doc.setFillColor(...sage);
  doc.rect(0, fh - 12, pw, 12, "F");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("Landy — Property compliance made peaceful", 16, fh - 4);

  doc.save(`handover-${data.propertyAddress.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
