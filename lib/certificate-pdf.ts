import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date;
  certificateId: string;
}

const PAGE_WIDTH = 842; // A4 landscape in points
const PAGE_HEIGHT = 595;
const INDIGO = rgb(0.31, 0.27, 0.9);
const INK = rgb(0.08, 0.09, 0.17);
const MUTED = rgb(0.35, 0.38, 0.5);

/** The standard PDF fonts only cover Latin-1, so anything outside it is replaced rather than crashing. */
function latin1(text: string): string {
  return text.replace(/[^ -~ -ÿ]/g, "?");
}

function drawCentered(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color = INK): void {
  const safe = latin1(text);
  const width = font.widthOfTextAtSize(safe, size);
  page.drawText(safe, { x: (PAGE_WIDTH - width) / 2, y, size, font, color });
}

/** Shrinks a line until it fits inside the certificate border. */
function fitSize(text: string, font: PDFFont, start: number, maxWidth: number): number {
  const safe = latin1(text);
  let size = start;
  while (size > 12 && font.widthOfTextAtSize(safe, size) > maxWidth) size -= 1;
  return size;
}

export async function buildCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`EduFlux certificate: ${latin1(data.courseTitle)}`);
  pdf.setAuthor("EduFlux");
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 24, y: 24, width: PAGE_WIDTH - 48, height: PAGE_HEIGHT - 48, borderColor: INDIGO, borderWidth: 4 });
  page.drawRectangle({ x: 36, y: 36, width: PAGE_WIDTH - 72, height: PAGE_HEIGHT - 72, borderColor: INDIGO, borderWidth: 1 });

  drawCentered(page, "EDUFLUX", PAGE_HEIGHT - 95, sans, 16, INDIGO);
  drawCentered(page, "Certificate of Completion", PAGE_HEIGHT - 150, serifBold, 40);
  drawCentered(page, "This certifies that", PAGE_HEIGHT - 205, serif, 18, MUTED);

  const maxWidth = PAGE_WIDTH - 160;
  drawCentered(page, data.studentName, PAGE_HEIGHT - 265, serifBold, fitSize(data.studentName, serifBold, 44, maxWidth), INDIGO);
  drawCentered(page, "has successfully completed the course", PAGE_HEIGHT - 310, serif, 18, MUTED);
  drawCentered(page, data.courseTitle, PAGE_HEIGHT - 355, serifBold, fitSize(data.courseTitle, serifBold, 28, maxWidth));

  const date = data.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  drawCentered(page, `Issued on ${date}`, PAGE_HEIGHT - 410, serif, 16, MUTED);

  page.drawLine({ start: { x: 130, y: 120 }, end: { x: 330, y: 120 }, thickness: 1, color: MUTED });
  page.drawText(latin1(data.instructorName), { x: 130, y: 130, size: 16, font: serifBold, color: INK });
  page.drawText("Instructor", { x: 130, y: 102, size: 11, font: sans, color: MUTED });

  page.drawText(`Certificate ID: ${data.certificateId}`, { x: 130, y: 62, size: 9, font: sans, color: MUTED });

  return pdf.save();
}
