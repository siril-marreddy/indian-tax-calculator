import React, { useState } from 'react';
import './App.css';
import { EmployeeTaxForm } from './components/EmployeeTaxForm';
import { TaxResults } from './components/TaxResults';
import { EmployeeData, TaxComparison } from './types/indianTax';

function App() {
  const [taxResult, setTaxResult] = useState<TaxComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const handleCalculate = async (employeeData: EmployeeData) => {
    setLoading(true);
    setError(null);
    setShowResults(false);
    
    try {
      const response = await fetch(`${API_URL}/api/tax/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate tax');
      }

      const result = await response.json();
      setTaxResult(result.data);
      setShowResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Tax calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Indian Income Tax Calculator</h1>
          <p className="subtitle">FY 2024-25 (AY 2025-26)</p>
          <div className="header-flags">
            <span className="flag">🇮🇳</span>
          </div>
        </div>
      </header>
      
      <main className="App-main">
        <EmployeeTaxForm onCalculate={handleCalculate} />
        
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Calculating your tax...</p>
          </div>
        )}
        
        {error && (
          <div className="error-state">
            <p>❌ {error}</p>
          </div>
        )}
        
        {!loading && !error && showResults && <TaxResults result={taxResult} />}
      </main>
      
      <footer className="App-footer">
        <p>
          <strong>Note:</strong> This calculator is based on Indian Income Tax laws for FY 2024-25. 
          Results are for reference only. Please consult a tax professional for accurate advice.
        </p>
        <p className="footer-links">
          <a href="https://www.incometax.gov.in" target="_blank" rel="noopener noreferrer">
            Income Tax Department
          </a>
          <span className="separator">|</span>
          <a href="https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1" target="_blank" rel="noopener noreferrer">
            Tax Help
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
