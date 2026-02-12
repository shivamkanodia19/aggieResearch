/**
 * PDF Generator for Research Progress Reports
 * Server-side only — uses pdfkit
 */

import PDFDocument from "pdfkit";
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
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: "LETTER",
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Sanitise log arrays (DB may return null or stringified data)
    const logs = (input.logs ?? []).map((log) => ({
      ...log,
      hoursWorked: safeNum(log.hoursWorked),
      accomplishments: ensureArray(log.accomplishments),
      learnings: ensureArray(log.learnings),
      blockers: ensureArray(log.blockers),
      nextWeekPlan: ensureArray(log.nextWeekPlan),
    }));

    // Sort most-recent first for the weekly breakdown
    const sortedLogs = [...logs].sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
    );
    // Chronological for aggregate stats
    const chronologicalLogs = [...logs].sort(
      (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
    );

    const totalHours = logs.reduce((s, l) => s + l.hoursWorked, 0);
    const weeksLogged = logs.length;
    const avgHours = weeksLogged > 0 ? (totalHours / weeksLogged).toFixed(1) : "0";

    // Colors
    const maroon = "#500000";
    const darkGray = "#333333";
    const gray = "#666666";
    const ruleGray = "#dddddd";

    const generatedDate = format(new Date(), "MMMM d, yyyy");

    /* ---------- HEADER ---------- */

    doc
      .fontSize(20)
      .fillColor(maroon)
      .text("TAMU Research Tracker", { align: "left" });

    doc
      .fontSize(10)
      .fillColor(gray)
      .text("Research Progress Report", { align: "left" });

    // Thin maroon rule
    doc.moveDown(0.4);
    doc
      .strokeColor(maroon)
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(0.8);

    // Student + date info
    const studentName = input.student?.name || "Student";
    const studentEmail = input.student?.email || "";

    doc
      .fontSize(10)
      .fillColor(darkGray)
      .text(studentName + (studentEmail ? `  ·  ${studentEmail}` : ""));

    doc
      .fontSize(10)
      .fillColor(gray)
      .text(`Generated ${generatedDate}`);

    doc.moveDown(1.2);

    /* ---------- POSITION OVERVIEW ---------- */

    doc.fontSize(14).fillColor(maroon).text("Position Overview");
    doc.moveDown(0.4);

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

    doc.fontSize(10);
    for (const [label, value] of overviewItems) {
      doc
        .fillColor(gray)
        .text(`${label}: `, { continued: true })
        .fillColor(darkGray)
        .text(String(value));
      doc.moveDown(0.15);
    }

    doc.moveDown(1);

    /* ---------- WEEKLY LOGS (most recent first) ---------- */

    if (input.includeDetails && sortedLogs.length > 0) {
      doc.fontSize(14).fillColor(maroon).text("Weekly Logs");
      doc.moveDown(0.5);

      sortedLogs.forEach((log, idx) => {
        // Page-break check
        if (doc.y > doc.page.height - 160) {
          doc.addPage();
        }

        // Compute the week number (chronological order: week 1 is earliest)
        const chronIdx = chronologicalLogs.findIndex(
          (cl) => cl.weekStart.getTime() === log.weekStart.getTime(),
        );
        const weekNum = chronIdx >= 0 ? chronIdx + 1 : sortedLogs.length - idx;

        const weekEnd = new Date(log.weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekLabel = `Week of ${format(log.weekStart, "MMM d")}-${format(weekEnd, "d, yyyy")}`;

        doc
          .fontSize(11)
          .fillColor(maroon)
          .text(`${weekLabel}  (Week ${weekNum})`);

        doc
          .fontSize(10)
          .fillColor(gray)
          .text(`${log.hoursWorked} hour${log.hoursWorked !== 1 ? "s" : ""}`);

        doc.moveDown(0.3);

        const renderBulletSection = (heading: string, items: string[]) => {
          if (items.length === 0) return;
          doc.fontSize(10).fillColor(darkGray).text(heading);
          doc.fontSize(9.5).fillColor("#444444");
          for (const item of items) {
            if (doc.y > doc.page.height - 80) doc.addPage();
            doc.text(`  •  ${item}`, { indent: 8 });
            doc.moveDown(0.1);
          }
          doc.moveDown(0.25);
        };

        renderBulletSection("Accomplishments:", log.accomplishments);
        renderBulletSection("Learnings:", log.learnings);
        renderBulletSection("Blockers:", log.blockers);
        renderBulletSection("Next Steps:", log.nextWeekPlan);

        if (log.meetingNotes?.trim()) {
          doc.fontSize(10).fillColor(darkGray).text("Meeting Notes:");
          doc
            .fontSize(9.5)
            .fillColor("#444444")
            .text(`  ${log.meetingNotes.trim()}`, { indent: 8 });
          doc.moveDown(0.25);
        }

        // Separator between weeks
        if (idx < sortedLogs.length - 1) {
          doc.moveDown(0.3);
          doc
            .strokeColor(ruleGray)
            .lineWidth(0.5)
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
          doc.moveDown(0.6);
        }
      });

      doc.moveDown(1);
    }

    /* ---------- SUMMARY STATISTICS ---------- */

    if (doc.y > doc.page.height - 120) doc.addPage();

    doc.fontSize(14).fillColor(maroon).text("Summary Statistics");
    doc.moveDown(0.4);

    const summaryItems = [
      `Total weeks logged: ${weeksLogged}`,
      `Total hours: ${totalHours}`,
      `Average hours/week: ${avgHours}`,
    ];

    doc.fontSize(10).fillColor(darkGray);
    for (const line of summaryItems) {
      doc.text(line);
      doc.moveDown(0.15);
    }

    /* ---------- FOOTER on every page ---------- */

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - 40;
      doc
        .fontSize(8)
        .fillColor(gray)
        .text(
          `Generated by TAMU Research Tracker  ·  ${generatedDate}  ·  Page ${i + 1} of ${pageCount}`,
          50,
          footerY,
          { align: "center", width: doc.page.width - 100 },
        );
    }

    doc.end();
  });
}
