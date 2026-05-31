import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/** Higher scale = sharper PNG/PDF. */
const EXPORT_SCALE = 3;

const PDF_MARGIN = 10;
const SECTION_GAP = 4;

export async function captureExportElement(element) {
  if (!element) {
    throw new Error('Nothing to export.');
  }

  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));

  const width = element.scrollWidth;
  const height = element.scrollHeight;

  return html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: EXPORT_SCALE,
    useCORS: true,
    logging: false,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    imageTimeout: 0,
  });
}

function canvasToHeightMm(canvas, contentWidthMm) {
  return (canvas.height * contentWidthMm) / canvas.width;
}

export function downloadPng(canvas, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

/** Paginated PDF — each header / job / footer block stays intact (never split mid-card). */
export async function downloadPdfFromContainer(container, filename) {
  if (!container) {
    throw new Error('Nothing to export.');
  }

  const sections = [
    container.querySelector('[data-export-section="header"]'),
    ...container.querySelectorAll('[data-export-section="job"]'),
    container.querySelector('[data-export-section="footer"]'),
  ].filter(Boolean);

  if (!sections.length) {
    throw new Error('No export sections found.');
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PDF_MARGIN * 2;
  const maxY = pageHeight - PDF_MARGIN;

  let y = PDF_MARGIN;

  const startNewPage = () => {
    pdf.addPage();
    y = PDF_MARGIN;
  };

  for (const section of sections) {
    const canvas = await captureExportElement(section);
    const sectionHeight = canvasToHeightMm(canvas, contentWidth);
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Job taller than one page: scale down to fit (keeps block on single page)
    let drawWidth = contentWidth;
    let drawHeight = sectionHeight;

    if (drawHeight > pageHeight - PDF_MARGIN * 2) {
      drawHeight = pageHeight - PDF_MARGIN * 2;
      drawWidth = (canvas.width * drawHeight) / canvas.height;
    }

    if (y + drawHeight > maxY) {
      startNewPage();
    }

    const x = PDF_MARGIN + (contentWidth - drawWidth) / 2;
    pdf.addImage(imgData, 'PNG', x, y, drawWidth, drawHeight);
    y += drawHeight + SECTION_GAP;
  }

  pdf.save(filename);
}

export const EXPORT_FORMATS = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Print-ready — each job stays on one page block, never cut in half',
  },
  {
    id: 'png',
    label: 'PNG Image',
    description: 'Single high-resolution image (3× scale)',
  },
];
