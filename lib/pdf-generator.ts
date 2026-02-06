/**
 * PDF Generator for Research Progress Reports
 * Uses pdfkit for PDF generation
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

export async function generateProgressPDF(
  input: PDFGeneratorInput
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: "LETTER",
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Colors
    const maroon = "#500000";
    const gray = "#666666";
    const lightGray = "#f5f5f5";

    // Header
    doc
      .fontSize(24)
      .fillColor(maroon)
      .text("Research Progress Report", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor(gray)
      .text(
        `${format(input.startDate, "MMM d, yyyy")} - ${format(input.endDate, "MMM d, yyyy")}`,
        { align: "center" }
      );

    doc.moveDown(1.5);

    // Position Info Box
    const boxY = doc.y;
    doc
      .rect(50, boxY, doc.page.width - 100, 80)
      .fill(lightGray);

    const textY = boxY + 15;
    doc
      .fillColor("#000000")
      .fontSize(14)
      .text(input.position.title, 60, textY, {
        width: doc.page.width - 120,
      });

    doc
      .fontSize(11)
      .fillColor(gray)
      .text(`PI: ${input.position.piName}`, 60, textY + 25);

    doc.text(
      `Student: ${input.student?.name || "N/A"}`,
      60,
      textY + 40
    );
    doc.text(
      `Started: ${format(input.position.startDate, "MMM yyyy")}`,
      60,
      textY + 55
    );

    doc.y = boxY + 85;
    doc.moveDown(1);

    // Summary Stats
    const totalHours = input.logs.reduce(
      (sum, log) => sum + (log.hoursWorked || 0),
      0
    );
    const totalAccomplishments = input.logs.reduce(
      (sum, log) => sum + log.accomplishments.length,
      0
    );
    const weeksLogged = input.logs.length;

    doc.fontSize(16).fillColor(maroon).text("Summary");

    doc.moveDown(0.5);

    doc.fontSize(11).fillColor("#000000");

    const statsY = doc.y;
    const colWidth = (doc.page.width - 100) / 3;

    // Hours
    doc
      .fontSize(24)
      .fillColor(maroon)
      .text(totalHours.toString(), 50, statsY, {
        width: colWidth,
        align: "center",
      });
    doc
      .fontSize(10)
      .fillColor(gray)
      .text("Hours Logged", 50, statsY + 28, {
        width: colWidth,
        align: "center",
      });

    // Weeks
    doc
      .fontSize(24)
      .fillColor(maroon)
      .text(weeksLogged.toString(), 50 + colWidth, statsY, {
        width: colWidth,
        align: "center",
      });
    doc
      .fontSize(10)
      .fillColor(gray)
      .text("Weeks Tracked", 50 + colWidth, statsY + 28, {
        width: colWidth,
        align: "center",
      });

    // Accomplishments
    doc
      .fontSize(24)
      .fillColor(maroon)
      .text(totalAccomplishments.toString(), 50 + colWidth * 2, statsY, {
        width: colWidth,
        align: "center",
      });
    doc
      .fontSize(10)
      .fillColor(gray)
      .text("Accomplishments", 50 + colWidth * 2, statsY + 28, {
        width: colWidth,
        align: "center",
      });

    doc.y = statsY + 60;
    doc.moveDown(1.5);

    // Aggregate sections
    const allAccomplishments = input.logs.flatMap((log) => log.accomplishments);
    const allLearnings = input.logs.flatMap((log) => log.learnings);
    const currentBlockers =
      input.logs[input.logs.length - 1]?.blockers || [];
    const nextSteps =
      input.logs[input.logs.length - 1]?.nextWeekPlan || [];

    // Key Accomplishments
    if (allAccomplishments.length > 0) {
      doc.fontSize(14).fillColor(maroon).text("Key Accomplishments");
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#000000");

      allAccomplishments.forEach((item) => {
        doc.text(`• ${item}`, { indent: 10 });
        doc.moveDown(0.2);
      });

      doc.moveDown(0.8);
    }

    // Skills & Learnings
    if (allLearnings.length > 0) {
      doc.fontSize(14).fillColor(maroon).text("Skills & Learnings");
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#000000");

      allLearnings.forEach((item) => {
        doc.text(`• ${item}`, { indent: 10 });
        doc.moveDown(0.2);
      });

      doc.moveDown(0.8);
    }

    // Current Blockers
    if (currentBlockers.length > 0) {
      doc.fontSize(14).fillColor(maroon).text("Current Blockers");
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#000000");

      currentBlockers.forEach((item) => {
        doc.text(`• ${item}`, { indent: 10 });
        doc.moveDown(0.2);
      });

      doc.moveDown(0.8);
    }

    // Next Steps
    if (nextSteps.length > 0) {
      doc.fontSize(14).fillColor(maroon).text("Next Steps");
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor("#000000");

      nextSteps.forEach((item) => {
        doc.text(`• ${item}`, { indent: 10 });
        doc.moveDown(0.2);
      });

      doc.moveDown(0.8);
    }

    // Detailed Weekly Breakdown
    if (input.includeDetails && input.logs.length > 0) {
      doc.addPage();

      doc.fontSize(16).fillColor(maroon).text("Weekly Breakdown");
      doc.moveDown(1);

      input.logs.forEach((log) => {
        // Check if we need a new page
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }

        const weekLabel = `Week of ${format(log.weekStart, "MMM d, yyyy")}`;

        doc.fontSize(12).fillColor(maroon).text(weekLabel);

        doc
          .fontSize(10)
          .fillColor(gray)
          .text(`${log.hoursWorked || 0} hours`);

        doc.moveDown(0.3);
        doc.fillColor("#000000");

        if (log.accomplishments.length > 0) {
          doc.fontSize(10).text("Accomplished:", { continued: false });
          log.accomplishments.forEach((item) => {
            doc.text(`  • ${item}`);
          });
        }

        if (log.learnings.length > 0) {
          doc.text("Learned:", { continued: false });
          log.learnings.forEach((item) => {
            doc.text(`  • ${item}`);
          });
        }

        if (log.blockers.length > 0) {
          doc.text("Blockers:", { continued: false });
          log.blockers.forEach((item) => {
            doc.text(`  • ${item}`);
          });
        }

        if (log.nextWeekPlan.length > 0) {
          doc.text("Next week:", { continued: false });
          log.nextWeekPlan.forEach((item) => {
            doc.text(`  • ${item}`);
          });
        }

        doc.moveDown(1);
      });
    }

    // Footer
    const footerY = doc.page.height - 50;
    doc
      .fontSize(8)
      .fillColor(gray)
      .text(
        `Generated by TAMU Research Tracker · ${format(new Date(), "MMM d, yyyy")}`,
        50,
        footerY,
        { align: "center", width: doc.page.width - 100 }
      );

    doc.end();
  });
}
