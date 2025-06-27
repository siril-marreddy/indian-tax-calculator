import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TaxComparison } from '../types/indianTax';

export const generateTaxPDF = (taxData: TaxComparison) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(19, 136, 8); // Green color
  doc.text('Income Tax Calculation Report', pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Financial Year 2024-25 (Assessment Year 2025-26)', pageWidth / 2, 28, { align: 'center' });

  // Employee Details
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Employee Details', 14, 45);
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  const employeeDetails = [
    ['Name', taxData.employeeDetails.name],
    ['PAN', taxData.employeeDetails.pan],
    ['Age', taxData.employeeDetails.age.toString()],
    ['Category', taxData.employeeDetails.category.replace(/_/g, ' ').toUpperCase()]
  ];
  
  autoTable(doc, {
    startY: 50,
    head: [],
    body: employeeDetails,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14 }
  });

  // Recommendation
  let yPos = 85;
  doc.setFontSize(14);
  doc.setTextColor(255, 153, 51); // Orange
  doc.text('Recommendation', 14, yPos);
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(
    `Based on your income and deductions, the ${taxData.recommendation.toUpperCase()} TAX REGIME will save you ${formatCurrency(taxData.savings)}`,
    14,
    yPos + 7
  );

  // Old Regime Details
  yPos = 110;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 128); // Navy blue
  doc.text('Old Tax Regime', 14, yPos);
  
  const oldRegimeData = [
    ['Gross Income', formatCurrency(taxData.oldRegime.grossIncome)],
    ['Total Deductions', formatCurrency(taxData.oldRegime.totalDeductions)],
    ['Taxable Income', formatCurrency(taxData.oldRegime.taxableIncome)],
    ['Basic Tax', formatCurrency(taxData.oldRegime.tax)],
    ['Surcharge', formatCurrency(taxData.oldRegime.surcharge)],
    ['Health & Education Cess', formatCurrency(taxData.oldRegime.cess)],
    ['', ''],
    ['Total Tax Payable', formatCurrency(taxData.oldRegime.totalTax)],
    ['Monthly TDS', formatCurrency(taxData.oldRegime.monthlyTDS)]
  ];

  autoTable(doc, {
    startY: yPos + 5,
    head: [],
    body: oldRegimeData,
    theme: 'striped',
    columnStyles: {
      0: { fontStyle: 'normal', cellWidth: 60 },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    headStyles: { fillColor: [0, 0, 128] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 14 },
    didParseCell: function(data: any) {
      if (data.row.index === 7) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // New Regime Details
  yPos = 210;
  doc.setFontSize(14);
  doc.setTextColor(19, 136, 8); // Green
  doc.text('New Tax Regime', 14, yPos);
  
  const newRegimeData = [
    ['Gross Income', formatCurrency(taxData.newRegime.grossIncome)],
    ['Standard Deduction', formatCurrency(taxData.newRegime.totalDeductions)],
    ['Taxable Income', formatCurrency(taxData.newRegime.taxableIncome)],
    ['Basic Tax', formatCurrency(taxData.newRegime.tax)],
    ['Surcharge', formatCurrency(taxData.newRegime.surcharge)],
    ['Health & Education Cess', formatCurrency(taxData.newRegime.cess)],
    ['', ''],
    ['Total Tax Payable', formatCurrency(taxData.newRegime.totalTax)],
    ['Monthly TDS', formatCurrency(taxData.newRegime.monthlyTDS)]
  ];

  autoTable(doc, {
    startY: yPos + 5,
    head: [],
    body: newRegimeData,
    theme: 'striped',
    columnStyles: {
      0: { fontStyle: 'normal', cellWidth: 60 },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    headStyles: { fillColor: [19, 136, 8] },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    margin: { left: 14 },
    didParseCell: function(data: any) {
      if (data.row.index === 7) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Add new page for deductions breakdown
  if (Object.keys(taxData.oldRegime.deductions).length > 1) {
    doc.addPage();
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Deductions Breakdown (Old Regime)', 14, 20);
    
    const deductionsData = Object.entries(taxData.oldRegime.deductions)
      .filter(([key, value]) => value > 0)
      .map(([key, value]) => [
        formatDeductionLabel(key),
        formatCurrency(value)
      ]);

    autoTable(doc, {
      startY: 30,
      head: [['Deduction Type', 'Amount']],
      body: deductionsData,
      theme: 'grid',
      headStyles: { fillColor: [255, 153, 51] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 'auto', halign: 'right' }
      },
      margin: { left: 14 }
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages ? (doc as any).internal.getNumberOfPages() : 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(
      'Generated on ' + new Date().toLocaleDateString('en-IN'),
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Generate filename with employee name and date
  const fileName = `Tax_Report_${taxData.employeeDetails.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Save the PDF
  doc.save(fileName);
};

// Helper function to format deduction labels
const formatDeductionLabel = (key: string): string => {
  const labels: { [key: string]: string } = {
    'standardDeduction': 'Standard Deduction',
    'section80C': 'Section 80C',
    'section80D': 'Section 80D (Health Insurance)',
    'section80CCD1B': 'Section 80CCD(1B) - NPS',
    'section80E': 'Section 80E (Education Loan)',
    'section80G': 'Section 80G (Donations)',
    'section80TTA': 'Section 80TTA/TTB (Savings Interest)',
    'section24': 'Section 24 (Home Loan Interest)',
    'hraExemption': 'HRA Exemption'
  };
  return labels[key] || key;
};