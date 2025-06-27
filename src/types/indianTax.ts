// Type definitions for Indian Tax Calculator

export interface EmployeeData {
  // Personal Information
  name: string;
  pan: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  
  // Income Details
  income: {
    basicSalary: number;
    hra: number;
    specialAllowance: number;
    otherAllowances: number;
    bonus: number;
    commission: number;
    otherIncome: number;
  };
  
  // Investments for deductions
  investments: {
    ppf?: number;
    epf?: number;
    elss?: number;
    lifeInsurance?: number;
    nsc?: number;
    tuitionFees?: number;
    homeLoanPrincipal?: number;
    sukanya?: number;
    taxSavingFD?: number;
    nps?: number;
    healthInsurance?: {
      self: number;
      parents: number;
      parentAge?: number;
    };
    savingsInterest?: number;
    donations?: number;
  };
  
  // Loans
  loans: {
    homeLoanInterest?: number;
    educationLoanInterest?: number;
  };
  
  // Deductions
  deductions: {
    rentPaid?: number;
    metroCity?: boolean;
  };
}

export interface TaxCalculationResult {
  regime: 'old' | 'new';
  grossIncome: number;
  deductions: {
    [key: string]: number;
  };
  totalDeductions: number;
  taxableIncome: number;
  tax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  monthlyTDS: number;
}

export interface TaxComparison {
  oldRegime: TaxCalculationResult;
  newRegime: TaxCalculationResult;
  recommendation: 'old' | 'new';
  savings: number;
  employeeDetails: {
    name: string;
    pan: string;
    age: number;
    category: string;
  };
}

export interface TaxSlabInfo {
  oldRegimeSlabs: any;
  newRegimeSlabs: any;
  deductionLimits: any;
  section80CLimit: number;
  standardDeduction: number;
}