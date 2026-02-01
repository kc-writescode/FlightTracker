// lib/pdf-generator.ts
// Note: This file is kept for backwards compatibility but html-pdf-generator.ts is preferred

import jsPDF from 'jspdf';
import { BaseResume } from '@/types/resume';
import { getTemplate } from './templates';

// Default styles for PDF generation
const defaultStyles = {
  fonts: {
    name: { size: 24, bold: true, font: 'Helvetica' },
    sectionHeader: { size: 14, bold: true, font: 'Helvetica' },
    jobTitle: { size: 12, bold: true, font: 'Helvetica' },
    body: { size: 11, font: 'Helvetica' }
  },
  spacing: {
    beforeSection: 0.2,
    afterSection: 0.1,
  }
};

export function generatePDF(
  resume: BaseResume,
  templateId: string,
  _fileName: string
): Blob {
  const template = getTemplate(templateId);
  const styles = defaultStyles;
  
  // Create PDF with US Letter size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter'
  });
  
  const pageWidth = 8.5;
  const pageHeight = 11;
  const margins = template.margins;
  const contentWidth = pageWidth - margins.left - margins.right;
  
  let currentY = margins.top;
  
  // Helper to check if we need a new page
  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - margins.bottom) {
      doc.addPage();
      currentY = margins.top;
      return true;
    }
    return false;
  };
  
  // Header - Name
  doc.setFontSize(styles.fonts.name.size);
  doc.setFont('helvetica', 'bold');
  const nameWidth = doc.getTextWidth(resume.personal.name);
  doc.text(resume.personal.name, (pageWidth - nameWidth) / 2, currentY);
  currentY += 0.25;
  
  // Contact info
  doc.setFontSize(styles.fonts.body.size);
  doc.setFont('helvetica', 'normal');
  const contactParts = [
    resume.personal.location,
    resume.personal.phone,
    resume.personal.email
  ];
  if (resume.personal.linkedin) {
    contactParts.push(resume.personal.linkedin);
  }
  const contactText = contactParts.join(' | ');
  const contactWidth = doc.getTextWidth(contactText);
  doc.text(contactText, (pageWidth - contactWidth) / 2, currentY);
  currentY += 0.4;
  
  // Professional Summary
  if (resume.summary) {
    checkPageBreak(0.6);
    doc.setFontSize(styles.fonts.sectionHeader.size);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', margins.left, currentY);
    currentY += 0.2;
    
    doc.setFontSize(styles.fonts.body.size);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resume.summary, contentWidth);
    doc.text(summaryLines, margins.left, currentY);
    currentY += (summaryLines.length * 0.18) + 0.2;
  }
  
  // Professional Experience
  checkPageBreak(0.6);
  doc.setFontSize(styles.fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFESSIONAL EXPERIENCE', margins.left, currentY);
  currentY += 0.25;
  
  resume.experience.forEach((exp, index) => {
    if (index > 0) checkPageBreak(0.8);
    
    // Job title and company
    doc.setFontSize(styles.fonts.jobTitle.size);
    doc.setFont('helvetica', 'bold');
    doc.text(`${exp.title} | ${exp.company}`, margins.left, currentY);
    currentY += 0.18;
    
    // Location and dates
    const dateRange = exp.current 
      ? `${exp.startDate} - Present`
      : `${exp.startDate} - ${exp.endDate}`;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(styles.fonts.body.size);
    doc.text(`${exp.location} | ${dateRange}`, margins.left, currentY);
    currentY += 0.2;
    
    // Bullet points
    doc.setFont('helvetica', 'normal');
    exp.bullets.forEach(bullet => {
      checkPageBreak(0.3);
      
      // Add bullet point
      doc.text('•', margins.left + 0.1, currentY);
      
      // Wrap text for bullet
      const bulletLines = doc.splitTextToSize(bullet, contentWidth - 0.3);
      doc.text(bulletLines, margins.left + 0.3, currentY);
      currentY += bulletLines.length * 0.18 + 0.05;
    });
    
    currentY += 0.1;
  });
  
  // Education
  checkPageBreak(0.6);
  doc.setFontSize(styles.fonts.sectionHeader.size);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION', margins.left, currentY);
  currentY += 0.25;
  
  resume.education.forEach((edu, index) => {
    if (index > 0) checkPageBreak(0.4);
    
    doc.setFontSize(styles.fonts.jobTitle.size);
    doc.setFont('helvetica', 'bold');
    doc.text(edu.degree, margins.left, currentY);
    currentY += 0.18;
    
    const eduDetails = [edu.institution];
    if (edu.location) eduDetails.push(edu.location);
    eduDetails.push(edu.graduationDate);
    if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(styles.fonts.body.size);
    doc.text(eduDetails.join(' | '), margins.left, currentY);
    currentY += 0.25;
  });
  
  // Skills
  if (resume.skills.length > 0) {
    checkPageBreak(0.5);
    doc.setFontSize(styles.fonts.sectionHeader.size);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILLS', margins.left, currentY);
    currentY += 0.2;
    
    doc.setFontSize(styles.fonts.body.size);
    doc.setFont('helvetica', 'normal');
    const skillsText = resume.skills.join(' • ');
    const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillsLines, margins.left, currentY);
    currentY += (skillsLines.length * 0.18) + 0.2;
  }
  
  // Certifications
  if (resume.certifications.length > 0) {
    checkPageBreak(0.5);
    doc.setFontSize(styles.fonts.sectionHeader.size);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATIONS', margins.left, currentY);
    currentY += 0.2;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(styles.fonts.body.size);
    resume.certifications.forEach(cert => {
      checkPageBreak(0.25);
      doc.text('•', margins.left + 0.1, currentY);
      const certLines = doc.splitTextToSize(cert, contentWidth - 0.3);
      doc.text(certLines, margins.left + 0.3, currentY);
      currentY += certLines.length * 0.18 + 0.05;
    });
  }
  
  return doc.output('blob');
}
