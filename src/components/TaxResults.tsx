import React from 'react';
import { TaxComparison, TaxCalculationResult } from '../types/indianTax';
import { generateTaxPDF } from '../utils/pdfGenerator';
import './TaxResults.css';

interface TaxResultsProps {
  result: TaxComparison | null;
}

export const TaxResults: React.FC<TaxResultsProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="tax-results empty">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No Calculations Yet</h3>
          <p>Fill in your details and click "Calculate Tax" to see your tax breakdown</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    return `${percent.toFixed(2)}%`;
  };

  const renderTaxBreakdown = (regime: TaxCalculationResult, isRecommended: boolean) => {
    const effectiveRate = (regime.totalTax / regime.grossIncome) * 100;
    
    return (
      <div className={`regime-card ${isRecommended ? 'recommended' : ''}`}>
        {isRecommended && <div className="recommendation-badge">Recommended</div>}
        
        <h3>{regime.regime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}</h3>
        
        <div className="tax-summary">
          <div className="summary-item">
            <span className="label">Gross Income</span>
            <span className="value">{formatCurrency(regime.grossIncome)}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">Total Deductions</span>
            <span className="value negative">{formatCurrency(regime.totalDeductions)}</span>
          </div>
          
          <div className="summary-item highlight">
            <span className="label">Taxable Income</span>
            <span className="value">{formatCurrency(regime.taxableIncome)}</span>
          </div>
        </div>

        <div className="tax-components">
          <div className="component-item">
            <span className="label">Basic Tax</span>
            <span className="value">{formatCurrency(regime.tax)}</span>
          </div>
          
          {regime.surcharge > 0 && (
            <div className="component-item">
              <span className="label">Surcharge</span>
              <span className="value">{formatCurrency(regime.surcharge)}</span>
            </div>
          )}
          
          <div className="component-item">
            <span className="label">Health & Education Cess (4%)</span>
            <span className="value">{formatCurrency(regime.cess)}</span>
          </div>
          
          <div className="component-item total">
            <span className="label">Total Tax Payable</span>
            <span className="value">{formatCurrency(regime.totalTax)}</span>
          </div>
          
          <div className="component-item">
            <span className="label">Monthly TDS</span>
            <span className="value">{formatCurrency(regime.monthlyTDS)}</span>
          </div>
          
          <div className="component-item">
            <span className="label">Effective Tax Rate</span>
            <span className="value">{formatPercent(effectiveRate)}</span>
          </div>
        </div>

        {regime.regime === 'old' && (
          <details className="deductions-details">
            <summary>View Deductions Breakdown</summary>
            <div className="deductions-list">
              {Object.entries(regime.deductions).map(([key, value]) => (
                value > 0 && (
                  <div key={key} className="deduction-item">
                    <span className="label">{formatDeductionLabel(key)}</span>
                    <span className="value">{formatCurrency(value)}</span>
                  </div>
                )
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

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

  return (
    <div className="tax-results">
      <div className="results-header">
        <h2>Tax Calculation Results</h2>
        <div className="employee-info">
          <span>{result.employeeDetails.name}</span>
          <span className="separator">|</span>
          <span>PAN: {result.employeeDetails.pan}</span>
          <span className="separator">|</span>
          <span>{result.employeeDetails.category.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
      </div>

      <div className="comparison-container">
        <div className="savings-banner">
          <h3>💰 You can save {formatCurrency(result.savings)} by choosing the {result.recommendation === 'old' ? 'Old' : 'New'} Tax Regime</h3>
        </div>

        <div className="regime-comparison">
          {renderTaxBreakdown(result.oldRegime, result.recommendation === 'old')}
          {renderTaxBreakdown(result.newRegime, result.recommendation === 'new')}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-download" onClick={() => generateTaxPDF(result)}>
          📥 Download Tax Report (PDF)
        </button>
        <button className="btn-print" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
      </div>

      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> This calculation is based on FY 2024-25 tax rates and is for informational purposes only. 
          Please consult a tax professional for accurate advice tailored to your specific situation.
        </p>
      </div>
    </div>
  );
};