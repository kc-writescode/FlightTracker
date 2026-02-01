// lib/html-pdf-generator.ts

export async function generatePDFFromHTML(
  elementId: string,
  filename: string
): Promise<Blob> {
  // Dynamic import for client-side only
  const html2pdf = (await import('html2pdf.js')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Resume preview element not found');
  }

  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove any edit-mode styling and buttons
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });
  clone.querySelectorAll('button').forEach(el => {
    el.remove();
  });

  // Add print-specific styles - no page breaks for single page
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  `;
  clone.prepend(style);

  // Create a container with proper print dimensions
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '8.5in';
  container.style.backgroundColor = '#ffffff';
  container.appendChild(clone);
  document.body.appendChild(container);

  // Get actual content height - use exact height for single page
  const contentHeight = clone.scrollHeight;
  // Calculate page height in inches, minimum 11 inches (letter size)
  const pageHeightInches = Math.max(11, (contentHeight / 96) + 0.1);

  const options = {
    margin: 0,
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 816, // 8.5 inches at 96 DPI
      height: contentHeight, // Capture exact content height
    },
    jsPDF: {
      unit: 'in' as const,
      format: [8.5, pageHeightInches] as [number, number], // Custom size to fit content
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: [] as const, // No page breaks for single page
    },
  };

  try {
    const blob = await html2pdf()
      .set(options)
      .from(clone)
      .outputPdf('blob');

    return blob;
  } finally {
    document.body.removeChild(container);
  }
}
