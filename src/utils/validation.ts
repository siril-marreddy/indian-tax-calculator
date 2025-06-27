// Validation rules for Indian Tax Calculator

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTaxForm = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Personal Information Validation
  if (!formData.name || formData.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Name must be at least 3 characters long' });
  }

  if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
    errors.push({ field: 'pan', message: 'Invalid PAN format (e.g., ABCDE1234F)' });
  }

  if (!formData.age || formData.age < 18 || formData.age > 100) {
    errors.push({ field: 'age', message: 'Age must be between 18 and 100' });
  }

  // Income Validation
  if (!formData.income.basicSalary || formData.income.basicSalary <= 0) {
    errors.push({ field: 'basicSalary', message: 'Basic salary is required and must be greater than 0' });
  }

  if (formData.income.basicSalary > 100000000) { // 10 crore limit
    errors.push({ field: 'basicSalary', message: 'Basic salary cannot exceed ₹10 crore' });
  }

  // HRA Validation
  if (formData.income.hra > formData.income.basicSalary * 0.5) {
    errors.push({ field: 'hra', message: 'HRA cannot exceed 50% of basic salary' });
  }

  // Section 80C Validation (max 1.5 lakh)
  const section80CTotal = (formData.investments.ppf || 0) +
    (formData.investments.epf || 0) +
    (formData.investments.elss || 0) +
    (formData.investments.lifeInsurance || 0) +
    (formData.investments.nsc || 0) +
    (formData.investments.tuitionFees || 0) +
    (formData.investments.homeLoanPrincipal || 0) +
    (formData.investments.sukanya || 0) +
    (formData.investments.taxSavingFD || 0);

  if (section80CTotal > 150000) {
    errors.push({ 
      field: 'section80C', 
      message: 'Total Section 80C investments cannot exceed ₹1,50,000' 
    });
  }

  // Health Insurance Validation (Section 80D)
  if (formData.age < 60 && formData.investments.healthInsurance?.self > 25000) {
    errors.push({ 
      field: 'healthInsuranceSelf', 
      message: 'Health insurance premium for self cannot exceed ₹25,000 (below 60 years)' 
    });
  }

  if (formData.age >= 60 && formData.investments.healthInsurance?.self > 50000) {
    errors.push({ 
      field: 'healthInsuranceSelf', 
      message: 'Health insurance premium for self cannot exceed ₹50,000 (senior citizen)' 
    });
  }

  // NPS Validation (Section 80CCD(1B))
  if (formData.investments.nps > 50000) {
    errors.push({ 
      field: 'nps', 
      message: 'Additional NPS contribution under 80CCD(1B) cannot exceed ₹50,000' 
    });
  }

  // Home Loan Interest Validation (Section 24)
  if (formData.loans.homeLoanInterest > 200000) {
    errors.push({ 
      field: 'homeLoanInterest', 
      message: 'Home loan interest deduction cannot exceed ₹2,00,000' 
    });
  }

  // Savings Interest Validation
  if (formData.age < 60 && formData.investments.savingsInterest > 10000) {
    errors.push({ 
      field: 'savingsInterest', 
      message: 'Savings interest deduction under 80TTA cannot exceed ₹10,000' 
    });
  }

  if (formData.age >= 60 && formData.investments.savingsInterest > 50000) {
    errors.push({ 
      field: 'savingsInterest', 
      message: 'Savings interest deduction under 80TTB cannot exceed ₹50,000 (senior citizen)' 
    });
  }

  // Rent Validation
  if (formData.deductions.rentPaid && formData.income.hra) {
    const annualBasic = formData.income.basicSalary;
    const minRentForHRA = annualBasic * 0.1; // 10% of basic
    
    if (formData.deductions.rentPaid < minRentForHRA) {
      errors.push({ 
        field: 'rentPaid', 
        message: `Rent paid should be at least ₹${minRentForHRA.toLocaleString('en-IN')} (10% of basic) to claim HRA exemption` 
      });
    }
  }

  return errors;
};

// Field-specific validation functions
export const validatePAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
};

export const validateAmount = (amount: number, max?: number): boolean => {
  if (amount < 0) return false;
  if (max && amount > max) return false;
  return true;
};

export const formatAmount = (value: string): number => {
  // Remove commas and parse
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};