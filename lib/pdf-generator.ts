/**
 * PDF Generator for Research Progress Reports
 * Uses jsPDF (pure JS — works on Vercel serverless)
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface PDFGeneratorInput {
  position: {
    title: string;
    piName: string;
    startDate: Date;
  };
  logs: {
    weekStart: Date;
    hoursWorked: number | null;
    accomplishments: string[];
    learnings: string[];
    blockers: string[];
    nextWeekPlan: string[];
    meetingNotes?: string | null;
  }[];
  student: {
    name: string | null;
    email: string | null;
  } | null;
  startDate: Date;
  endDate: Date;
  includeDetails: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function ensureArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.trim());
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function safeNum(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------------ */
/*  PDF Generation                                                     */
/* ------------------------------------------------------------------ */

export async function generateProgressPDF(
  input: PDFGeneratorInput,
): Promise<Buffer> {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Sanitise log arrays
  const logs = (input.logs ?? []).map((log) => ({
    ...log,
    hoursWorked: safeNum(log.hoursWorked),
    accomplishments: ensureArray(log.accomplishments),
    learnings: ensureArray(log.learnings),
    blockers: ensureArray(log.blockers),
    nextWeekPlan: ensureArray(log.nextWeekPlan),
  }));

  const sortedLogs = [...logs].sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
  );
  const chronologicalLogs = [...logs].sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
  );

  const totalHours = logs.reduce((s, l) => s + l.hoursWorked, 0);
  const weeksLogged = logs.length;
  const avgHours = weeksLogged > 0 ? (totalHours / weeksLogged).toFixed(1) : "0";

  // Colors (RGB arrays)
  const maroon: [number, number, number] = [80, 0, 0];
  const darkGray: [number, number, number] = [51, 51, 51];
  const gray: [number, number, number] = [102, 102, 102];
  const ruleGray: [number, number, number] = [221, 221, 221];

  const generatedDate = format(new Date(), "MMMM d, yyyy");

  // Helper: check if we need a new page
  function checkPage(needed: number) {
    if (y + needed > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }
  }

  // Helper: draw wrapped text and return new y position
  function drawWrapped(
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    fontSize: number,
    color: [number, number, number],
    style: "normal" | "bold" = "normal",
  ): number {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      checkPage(fontSize + 4);
      doc.text(line, x, y);
      y += fontSize + 2;
    }
    return y;
  }

  /* ---------- HEADER ---------- */

  // Maroon banner
  doc.setFillColor(maroon[0], maroon[1], maroon[2]);
  doc.rect(0, 0, pageWidth, 60, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TAMU Research Tracker", margin, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Research Progress Report", margin, 45);

  doc.text(generatedDate, pageWidth - margin, 45, { align: "right" });

  y = 80;

  /* ---------- STUDENT INFO ---------- */

  const studentName = input.student?.name || "Student";
  const studentEmail = input.student?.email || "";

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(studentName + (studentEmail ? `  ·  ${studentEmail}` : ""), margin, y);
  y += 20;

  /* ---------- POSITION OVERVIEW ---------- */

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(maroon[0], maroon[1], maroon[2]);
  doc.text("Position Overview", margin, y);
  y += 8;

  // Maroon rule
  doc.setDrawColor(maroon[0], maroon[1], maroon[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 14;

  const overviewItems: [string, string][] = [
    ["Title", input.position.title],
    ["PI", input.position.piName],
    ["Started", format(input.position.startDate, "MMMM yyyy")],
    [
      "Total Hours",
      `${totalHours} hours across ${weeksLogged} week${weeksLogged !== 1 ? "s" : ""}`,
    ],
    ["Avg Hours/Week", `${avgHours} hours`],
  ];

  for (const [label, value] of overviewItems) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`${label}:`, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(String(value), margin + 90, y);
    y += 15;
  }

  y += 10;

  /* ---------- WEEKLY LOGS (most recent first) ---------- */

  if (input.includeDetails && sortedLogs.length > 0) {
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(maroon[0], maroon[1], maroon[2]);
    doc.text("Weekly Logs", margin, y);
    y += 8;
    doc.setDrawColor(maroon[0], maroon[1], maroon[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 16;

    sortedLogs.forEach((log, idx) => {
      checkPage(80);

      // Compute week number (chronological: week 1 = earliest)
      const chronIdx = chronologicalLogs.findIndex(
        (cl) => cl.weekStart.getTime() === log.weekStart.getTime(),
      );
      const weekNum = chronIdx >= 0 ? chronIdx + 1 : sortedLogs.length - idx;

      const weekEnd = new Date(log.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekLabel = `Week of ${format(log.weekStart, "MMM d")}–${format(weekEnd, "d, yyyy")}  (Week ${weekNum})`;

      // Week header bar
      doc.setFillColor(maroon[0], maroon[1], maroon[2]);
      doc.rect(margin, y - 10, contentWidth, 18, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(weekLabel, margin + 6, y + 2);

      doc.text(
        `${log.hoursWorked} hr${log.hoursWorked !== 1 ? "s" : ""}`,
        pageWidth - margin - 6,
        y + 2,
        { align: "right" },
      );

      y += 16;

      // Render bullet sections
      const renderBulletSection = (heading: string, items: string[]) => {
        if (items.length === 0) return;
        checkPage(30);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text(heading, margin + 6, y);
        y += 13;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(68, 68, 68);
        doc.setFontSize(9.5);
        for (const item of items) {
          checkPage(14);
          const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 20);
          for (const line of lines) {
            doc.text(line, margin + 14, y);
            y += 12;
          }
        }
        y += 4;
      };

      renderBulletSection("Accomplishments:", log.accomplishments);
      renderBulletSection("Learnings:", log.learnings);
      renderBulletSection("Blockers:", log.blockers);
      renderBulletSection("Next Steps:", log.nextWeekPlan);

      if (log.meetingNotes?.trim()) {
        checkPage(30);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text("Meeting Notes:", margin + 6, y);
        y += 13;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(68, 68, 68);
        doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(log.meetingNotes.trim(), contentWidth - 20);
        for (const line of lines) {
          checkPage(14);
          doc.text(line, margin + 14, y);
          y += 12;
        }
        y += 4;
      }

      // Separator between weeks
      if (idx < sortedLogs.length - 1) {
        y += 4;
        doc.setDrawColor(ruleGray[0], ruleGray[1], ruleGray[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + contentWidth, y);
        y += 12;
      }
    });

    y += 10;
  } else if (!input.includeDetails && logs.length > 0) {
    // Summary table only
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(maroon[0], maroon[1], maroon[2]);
    doc.text("Weekly Hours Summary", margin, y);
    y += 12;

    const tableData = sortedLogs.map((log) => [
      format(log.weekStart, "MMM d, yyyy"),
      String(log.hoursWorked),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Week Starting", "Hours Worked"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: maroon,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable?.finalY ?? y + 40;
    y += 20;
  }

  /* ---------- SUMMARY STATISTICS ---------- */

  checkPage(80);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(maroon[0], maroon[1], maroon[2]);
  doc.text("Summary Statistics", margin, y);
  y += 8;
  doc.setDrawColor(maroon[0], maroon[1], maroon[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  const summaryItems = [
    `Total weeks logged: ${weeksLogged}`,
    `Total hours: ${totalHours}`,
    `Average hours/week: ${avgHours}`,
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  for (const line of summaryItems) {
    doc.text(line, margin, y);
    y += 15;
  }

  /* ---------- FOOTER on every page ---------- */

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(
      `Generated by TAMU Research Tracker  ·  ${generatedDate}  ·  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 25,
      { align: "center" },
    );
  }

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
