// Tax Calculator Utility - Core calculation logic for Indian income tax

const {
  TAX_REGIME,
  EMPLOYEE_CATEGORY,
  OLD_REGIME_SLABS,
  NEW_REGIME_SLABS,
  SURCHARGE_RATES,
  STANDARD_DEDUCTION,
  SECTION_80C_LIMIT,
  DEDUCTION_LIMITS,
  HRA_EXEMPTION
} = require('../models/taxModels');

class TaxCalculator {
  constructor(employeeData) {
    this.data = employeeData;
    this.grossIncome = this.calculateGrossIncome();
    this.employeeCategory = this.determineEmployeeCategory();
  }

  // Calculate total gross income from all sources
  calculateGrossIncome() {
    const {
      basicSalary = 0,
      hra = 0,
      specialAllowance = 0,
      otherAllowances = 0,
      bonus = 0,
      commission = 0,
      otherIncome = 0
    } = this.data.income || {};

    return basicSalary + hra + specialAllowance + otherAllowances + 
           bonus + commission + otherIncome;
  }

  // Determine employee category based on age
  determineEmployeeCategory() {
    const age = this.data.age || 0;
    if (age >= 80) return EMPLOYEE_CATEGORY.SUPER_SENIOR_CITIZEN;
    if (age >= 60) return EMPLOYEE_CATEGORY.SENIOR_CITIZEN;
    return EMPLOYEE_CATEGORY.GENERAL;
  }

  // Calculate HRA exemption (Old Regime only)
  calculateHRAExemption() {
    const { basicSalary = 0, hra = 0 } = this.data.income || {};
    const { rentPaid = 0, metroCity = false } = this.data.deductions || {};

    if (!hra || !rentPaid) return 0;

    // HRA exemption is minimum of:
    const factor = metroCity ? HRA_EXEMPTION.METRO_CITIES : HRA_EXEMPTION.NON_METRO_CITIES;
    
    const exemptions = [
      hra, // Actual HRA received
      factor * basicSalary, // 50%/40% of basic salary
      rentPaid - (0.1 * basicSalary) // Rent paid - 10% of basic
    ];

    return Math.max(0, Math.min(...exemptions));
  }

  // Calculate deductions under Old Regime
  calculateOldRegimeDeductions() {
    const deductions = {
      standardDeduction: STANDARD_DEDUCTION,
      section80C: 0,
      section80D: 0,
      section80CCD1B: 0,
      section80E: 0,
      section80G: 0,
      section80TTA: 0,
      section24: 0,
      hraExemption: this.calculateHRAExemption()
    };

    const { investments = {}, loans = {} } = this.data;

    // Section 80C deductions (max 1.5 lakh)
    const section80CItems = [
      investments.ppf || 0,
      investments.epf || 0,
      investments.elss || 0,
      investments.lifeInsurance || 0,
      investments.nsc || 0,
      investments.tuitionFees || 0,
      investments.homeLoanPrincipal || 0,
      investments.sukanya || 0,
      investments.taxSavingFD || 0
    ];
    deductions.section80C = Math.min(section80CItems.reduce((a, b) => a + b, 0), SECTION_80C_LIMIT);

    // Section 80D - Health Insurance
    const { healthInsurance = {} } = investments;
    let section80D = 0;
    
    if (this.employeeCategory === EMPLOYEE_CATEGORY.SENIOR_CITIZEN) {
      section80D += Math.min(healthInsurance.self || 0, DEDUCTION_LIMITS['80D'].selfSenior);
    } else {
      section80D += Math.min(healthInsurance.self || 0, DEDUCTION_LIMITS['80D'].self);
    }
    
    if (healthInsurance.parentAge >= 60) {
      section80D += Math.min(healthInsurance.parents || 0, DEDUCTION_LIMITS['80D'].parentsSenior);
    } else {
      section80D += Math.min(healthInsurance.parents || 0, DEDUCTION_LIMITS['80D'].parents);
    }
    
    deductions.section80D = section80D;

    // Section 80CCD(1B) - Additional NPS
    deductions.section80CCD1B = Math.min(investments.nps || 0, DEDUCTION_LIMITS['80CCD1B']);

    // Section 80E - Education loan interest
    deductions.section80E = loans.educationLoanInterest || 0;

    // Section 80G - Donations
    deductions.section80G = investments.donations || 0;

    // Section 80TTA/TTB - Savings account interest
    if (this.employeeCategory === EMPLOYEE_CATEGORY.SENIOR_CITIZEN || 
        this.employeeCategory === EMPLOYEE_CATEGORY.SUPER_SENIOR_CITIZEN) {
      deductions.section80TTA = Math.min(investments.savingsInterest || 0, DEDUCTION_LIMITS['80TTB']);
    } else {
      deductions.section80TTA = Math.min(investments.savingsInterest || 0, DEDUCTION_LIMITS['80TTA']);
    }

    // Section 24 - Home loan interest
    deductions.section24 = Math.min(loans.homeLoanInterest || 0, 200000);

    return deductions;
  }

  // Calculate tax based on slabs
  calculateTaxOnSlabs(taxableIncome, slabs) {
    let tax = 0;
    let previousLimit = 0;

    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
        tax += taxableInSlab * slab.rate;
      }
    }

    return tax;
  }

  // Calculate surcharge
  calculateSurcharge(tax, totalIncome) {
    for (const surcharge of SURCHARGE_RATES) {
      if (totalIncome >= surcharge.min && totalIncome < surcharge.max) {
        return tax * surcharge.rate;
      }
    }
    return 0;
  }

  // Calculate health and education cess (4% on tax + surcharge)
  calculateCess(taxPlusSurcharge) {
    return taxPlusSurcharge * 0.04;
  }

  // Main calculation method for Old Regime
  calculateOldRegimeTax() {
    const deductions = this.calculateOldRegimeDeductions();
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    
    const taxableIncome = Math.max(0, this.grossIncome - totalDeductions);
    const slabs = OLD_REGIME_SLABS[this.employeeCategory];
    
    let tax = this.calculateTaxOnSlabs(taxableIncome, slabs);
    
    // Apply rebate under section 87A
    if (taxableIncome <= DEDUCTION_LIMITS['87A'].old.limit) {
      tax = Math.max(0, tax - DEDUCTION_LIMITS['87A'].old.rebate);
    }
    
    const surcharge = this.calculateSurcharge(tax, this.grossIncome);
    const cess = this.calculateCess(tax + surcharge);
    
    return {
      regime: TAX_REGIME.OLD,
      grossIncome: this.grossIncome,
      deductions,
      totalDeductions,
      taxableIncome,
      tax,
      surcharge,
      cess,
      totalTax: tax + surcharge + cess,
      monthlyTDS: Math.round((tax + surcharge + cess) / 12)
    };
  }

  // Main calculation method for New Regime
  calculateNewRegimeTax() {
    // New regime only allows standard deduction
    const standardDeduction = STANDARD_DEDUCTION;
    const taxableIncome = Math.max(0, this.grossIncome - standardDeduction);
    
    let tax = this.calculateTaxOnSlabs(taxableIncome, NEW_REGIME_SLABS);
    
    // Apply rebate under section 87A
    if (taxableIncome <= DEDUCTION_LIMITS['87A'].new.limit) {
      tax = Math.max(0, tax - DEDUCTION_LIMITS['87A'].new.rebate);
    }
    
    const surcharge = this.calculateSurcharge(tax, this.grossIncome);
    const cess = this.calculateCess(tax + surcharge);
    
    return {
      regime: TAX_REGIME.NEW,
      grossIncome: this.grossIncome,
      deductions: { standardDeduction },
      totalDeductions: standardDeduction,
      taxableIncome,
      tax,
      surcharge,
      cess,
      totalTax: tax + surcharge + cess,
      monthlyTDS: Math.round((tax + surcharge + cess) / 12)
    };
  }

  // Calculate tax for both regimes and return comparison
  calculate() {
    const oldRegime = this.calculateOldRegimeTax();
    const newRegime = this.calculateNewRegimeTax();
    
    const recommendation = oldRegime.totalTax <= newRegime.totalTax ? TAX_REGIME.OLD : TAX_REGIME.NEW;
    const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);
    
    return {
      oldRegime,
      newRegime,
      recommendation,
      savings,
      employeeDetails: {
        name: this.data.name,
        pan: this.data.pan,
        age: this.data.age,
        category: this.employeeCategory
      }
    };
  }
}

module.exports = TaxCalculator;