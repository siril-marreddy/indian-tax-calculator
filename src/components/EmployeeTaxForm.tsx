import React, { useState, useEffect } from 'react';
import { EmployeeData } from '../types/indianTax';
import { validateTaxForm, ValidationError } from '../utils/validation';
import './EmployeeTaxForm.css';

interface EmployeeTaxFormProps {
  onCalculate: (data: EmployeeData) => void;
}

export const EmployeeTaxForm: React.FC<EmployeeTaxFormProps> = ({ onCalculate }) => {
  // Load saved form data from localStorage
  const loadSavedData = (): EmployeeData => {
    const savedData = localStorage.getItem('taxFormData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        // If parse fails, return default values
      }
    }
    
    // Default values
    return {
      name: '',
      pan: '',
      age: 30,
      gender: 'male',
      income: {
        basicSalary: 0,
        hra: 0,
        specialAllowance: 0,
        otherAllowances: 0,
        bonus: 0,
        commission: 0,
        otherIncome: 0
      },
      investments: {
        ppf: 0,
        epf: 0,
        elss: 0,
        lifeInsurance: 0,
        nsc: 0,
        tuitionFees: 0,
        homeLoanPrincipal: 0,
        sukanya: 0,
        taxSavingFD: 0,
        nps: 0,
        healthInsurance: {
          self: 0,
          parents: 0,
          parentAge: 55
        },
        savingsInterest: 0,
        donations: 0
      },
      loans: {
        homeLoanInterest: 0,
        educationLoanInterest: 0
      },
      deductions: {
        rentPaid: 0,
        metroCity: false
      }
    };
  };

  // Initialize form state with saved data or default values
  const [formData, setFormData] = useState<EmployeeData>(loadSavedData());

  // Current section for multi-step form
  const [currentSection, setCurrentSection] = useState(0);
  
  // Validation errors state
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taxFormData', JSON.stringify(formData));
  }, [formData]);

  // Handle input changes for nested objects
  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof EmployeeData];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return prev;
    });
  };

  // Handle direct field changes
  const handleDirectChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to display number values (handle 0 display)
  const getNumberValue = (value: number | undefined): string => {
    if (value === undefined) return '';
    return value.toString();
  };

  // Get error for specific field
  const getFieldError = (fieldName: string): string | undefined => {
    const error = errors.find(e => e.field === fieldName);
    return error?.message;
  };

  // Validate current section before moving to next
  const validateSection = (section: number): boolean => {
    const sectionErrors: ValidationError[] = [];
    
    switch(section) {
      case 0: // Personal Information
        if (!formData.name || formData.name.trim().length < 3) {
          sectionErrors.push({ field: 'name', message: 'Name must be at least 3 characters long' });
        }
        if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
          sectionErrors.push({ field: 'pan', message: 'Valid PAN is required (e.g., ABCDE1234F)' });
        }
        if (!formData.age || formData.age < 18 || formData.age > 100) {
          sectionErrors.push({ field: 'age', message: 'Age must be between 18 and 100' });
        }
        break;
        
      case 1: // Income Details
        if (!formData.income.basicSalary || formData.income.basicSalary < 1) {
          sectionErrors.push({ field: 'basicSalary', message: 'Basic salary is required and must be greater than 0' });
        }
        break;
        
      case 2: // Investments & Deductions
        // Optional section - no required fields
        // But validate limits if values are entered
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
          sectionErrors.push({ 
            field: 'section80C', 
            message: 'Total Section 80C investments cannot exceed ₹1,50,000' 
          });
        }
        break;
        
      case 3: // Loans & Rent
        // Optional section - no required fields
        break;
    }
    
    if (sectionErrors.length > 0) {
      setErrors(sectionErrors);
      // Scroll to top to show error banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    
    setErrors([]);
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateTaxForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Go to first section with error
      const firstErrorField = validationErrors[0].field;
      if (['name', 'pan', 'age'].includes(firstErrorField)) {
        setCurrentSection(0);
      } else if (['basicSalary', 'hra'].includes(firstErrorField)) {
        setCurrentSection(1);
      }
      return;
    }
    
    setErrors([]);
    onCalculate(formData);
  };

  // Form sections
  const sections = [
    { title: 'Personal Information', icon: '👤' },
    { title: 'Income Details', icon: '💰' },
    { title: 'Investments & Deductions', icon: '📊' },
    { title: 'Loans & Rent', icon: '🏠' }
  ];

  return (
    <form className="employee-tax-form" onSubmit={handleSubmit}>
      <h2>Indian Income Tax Calculator</h2>
      
      {/* Global error message */}
      {errors.length > 0 && currentSection < sections.length - 1 && (
        <div className="error-banner">
          <strong>Please correct the following errors:</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Progress indicator */}
      <div className="form-progress">
        {sections.map((section, index) => (
          <div 
            key={index}
            className={`progress-step ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
            onClick={() => {
              // Allow navigation to previous sections or validate before going forward
              if (index < currentSection) {
                setCurrentSection(index);
              } else if (index > currentSection) {
                // Validate all sections up to the target
                let canNavigate = true;
                for (let i = currentSection; i < index; i++) {
                  if (!validateSection(i)) {
                    canNavigate = false;
                    break;
                  }
                }
                if (canNavigate) {
                  setCurrentSection(index);
                }
              }
            }}
          >
            <span className="step-icon">{section.icon}</span>
            <span className="step-title">{section.title}</span>
          </div>
        ))}
      </div>

      {/* Personal Information Section */}
      {currentSection === 0 && (
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">
              <span className="label-text">Full Name</span>
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleDirectChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
              className={getFieldError('name') ? 'error' : ''}
            />
            {getFieldError('name') && <span className="error-text">{getFieldError('name')}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pan">
              <span className="label-text">PAN Number</span>
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="pan"
              value={formData.pan}
              onChange={(e) => handleDirectChange('pan', e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              maxLength={10}
              required
              className={getFieldError('pan') ? 'error' : ''}
            />
            <small className="help-text">Format: 5 letters, 4 numbers, 1 letter</small>
            {getFieldError('pan') && <span className="error-text">{getFieldError('pan')}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">
                <span className="label-text">Age</span>
                <span className="required">*</span>
              </label>
              <input
                type="number"
                id="age"
                value={formData.age}
                onChange={(e) => handleDirectChange('age', parseInt(e.target.value))}
                min="18"
                max="100"
                required
                className={getFieldError('age') ? 'error' : ''}
              />
              {getFieldError('age') && <span className="error-text">{getFieldError('age')}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">
                <span className="label-text">Gender</span>
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleDirectChange('gender', e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Income Details Section */}
      {currentSection === 1 && (
        <div className="form-section">
          <h3>Income Details</h3>
          
          <div className="form-group">
            <label htmlFor="basicSalary">
              <span className="label-text">Basic Salary (Annual)</span>
              <span className="required">*</span>
            </label>
            <div className={`input-wrapper ${getFieldError('basicSalary') ? 'error' : ''}`}>
              <span className="input-prefix">₹</span>
              <input
                type="number"
                id="basicSalary"
                value={getNumberValue(formData.income.basicSalary)}
                onChange={(e) => handleInputChange('income', 'basicSalary', parseFloat(e.target.value) || 0)}
                placeholder="600000"
                min="1"
                step="1000"
                required
              />
            </div>
            {getFieldError('basicSalary') && <span className="error-text">{getFieldError('basicSalary')}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hra">HRA</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="hra"
                  value={getNumberValue(formData.income.hra)}
                  onChange={(e) => handleInputChange('income', 'hra', parseFloat(e.target.value) || 0)}
                  placeholder="240000"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialAllowance">Special Allowance</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="specialAllowance"
                  value={getNumberValue(formData.income.specialAllowance)}
                  onChange={(e) => handleInputChange('income', 'specialAllowance', parseFloat(e.target.value) || 0)}
                  placeholder="120000"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bonus">Bonus</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="bonus"
                  value={getNumberValue(formData.income.bonus)}
                  onChange={(e) => handleInputChange('income', 'bonus', parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="otherIncome">Other Income</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="otherIncome"
                  value={getNumberValue(formData.income.otherIncome)}
                  onChange={(e) => handleInputChange('income', 'otherIncome', parseFloat(e.target.value) || 0)}
                  placeholder="10000"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investments Section */}
      {currentSection === 2 && (
        <div className="form-section">
          <h3>Investments & Deductions (Section 80C)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ppf">PPF</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="ppf"
                  value={getNumberValue(formData.investments.ppf)}
                  onChange={(e) => handleInputChange('investments', 'ppf', parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="epf">EPF</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="epf"
                  value={getNumberValue(formData.investments.epf)}
                  onChange={(e) => handleInputChange('investments', 'epf', parseFloat(e.target.value) || 0)}
                  placeholder="30000"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="elss">ELSS Mutual Funds</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="elss"
                  value={getNumberValue(formData.investments.elss)}
                  onChange={(e) => handleInputChange('investments', 'elss', parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lifeInsurance">Life Insurance Premium</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="lifeInsurance"
                  value={getNumberValue(formData.investments.lifeInsurance)}
                  onChange={(e) => handleInputChange('investments', 'lifeInsurance', parseFloat(e.target.value) || 0)}
                  placeholder="20000"
                  min="0"
                />
              </div>
            </div>
          </div>

          <h4>Health Insurance (Section 80D)</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="healthSelf">Self & Family</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="healthSelf"
                  value={getNumberValue(formData.investments.healthInsurance?.self)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    investments: {
                      ...prev.investments,
                      healthInsurance: {
                        ...prev.investments.healthInsurance!,
                        self: parseFloat(e.target.value) || 0
                      }
                    }
                  }))}
                  placeholder="25000"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="healthParents">Parents</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  id="healthParents"
                  value={getNumberValue(formData.investments.healthInsurance?.parents)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    investments: {
                      ...prev.investments,
                      healthInsurance: {
                        ...prev.investments.healthInsurance!,
                        parents: parseFloat(e.target.value) || 0
                      }
                    }
                  }))}
                  placeholder="30000"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nps">NPS (Section 80CCD(1B))</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                id="nps"
                value={getNumberValue(formData.investments.nps)}
                onChange={(e) => handleInputChange('investments', 'nps', parseFloat(e.target.value) || 0)}
                placeholder="50000"
                min="0"
              />
            </div>
            <small className="help-text">Additional ₹50,000 deduction</small>
          </div>
        </div>
      )}

      {/* Loans & Rent Section */}
      {currentSection === 3 && (
        <div className="form-section">
          <h3>Loans & Rent</h3>
          
          <div className="form-group">
            <label htmlFor="homeLoanInterest">Home Loan Interest (Section 24)</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                id="homeLoanInterest"
                value={getNumberValue(formData.loans.homeLoanInterest)}
                onChange={(e) => handleInputChange('loans', 'homeLoanInterest', parseFloat(e.target.value) || 0)}
                placeholder="200000"
                min="0"
              />
            </div>
            <small className="help-text">Max deduction: ₹2,00,000</small>
          </div>

          <div className="form-group">
            <label htmlFor="educationLoanInterest">Education Loan Interest (Section 80E)</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                id="educationLoanInterest"
                value={getNumberValue(formData.loans.educationLoanInterest)}
                onChange={(e) => handleInputChange('loans', 'educationLoanInterest', parseFloat(e.target.value) || 0)}
                placeholder="50000"
                min="0"
              />
            </div>
            <small className="help-text">No upper limit</small>
          </div>

          <h4>HRA Exemption</h4>
          <div className="form-group">
            <label htmlFor="rentPaid">Annual Rent Paid</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                id="rentPaid"
                value={getNumberValue(formData.deductions.rentPaid)}
                onChange={(e) => handleInputChange('deductions', 'rentPaid', parseFloat(e.target.value) || 0)}
                placeholder="240000"
                min="0"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.deductions.metroCity || false}
                onChange={(e) => handleInputChange('deductions', 'metroCity', e.target.checked)}
              />
              <span>Living in Metro City</span>
            </label>
            <small className="help-text">Delhi, Mumbai, Chennai, Kolkata</small>
          </div>
        </div>
      )}


      {/* Clear form button */}
      {currentSection === 0 && (
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all form data?')) {
                localStorage.removeItem('taxFormData');
                window.location.reload();
              }
            }}
            style={{ fontSize: '14px', padding: '8px 16px' }}
          >
            Clear Form
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="form-navigation">
        {currentSection > 0 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCurrentSection(currentSection - 1)}
          >
            Previous
          </button>
        )}
        
        {currentSection < sections.length - 1 ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (validateSection(currentSection)) {
                setCurrentSection(currentSection + 1);
              }
            }}
          >
            Next
          </button>
        ) : (
          <button type="submit" className="btn-submit">
            Calculate Tax
          </button>
        )}
      </div>
    </form>
  );
};