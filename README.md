# Indian Income Tax Calculator

A comprehensive web application for calculating Indian Income Tax for FY 2024-25 (AY 2025-26). This calculator supports both Old and New tax regimes with detailed deduction calculations and PDF report generation.

## Features

- **Dual Tax Regime Support**: Calculate tax under both Old and New tax regimes
- **Comprehensive Deductions**: Supports all major deductions including:
  - Section 80C (up to ₹1.5 lakhs)
  - Section 80D (Health Insurance)
  - Section 80CCD(1B) (Additional NPS)
  - Section 80E (Education Loan)
  - Section 80G (Donations)
  - Section 80TTA/TTB (Savings Interest)
  - Section 24 (Home Loan Interest)
  - HRA Exemption
- **Smart Recommendation**: Automatically recommends the best tax regime
- **PDF Report Generation**: Download detailed tax calculation reports
- **Database Storage**: Save and retrieve past calculations
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Input validation based on Indian tax rules

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI for components
- jsPDF for PDF generation
- React Hook Form for form management

### Backend
- Node.js with Express
- SQLite database with Sequelize ORM
- RESTful API architecture

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tax-calculator.git
cd tax-calculator
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Create environment file (optional):
```bash
# Create .env file in backend directory
echo "PORT=5001" > backend/.env
```

5. Start both servers:
```bash
chmod +x start-servers.sh
./start-servers.sh
```

Or start servers manually:

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd tax-calculator
PORT=3001 npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3001`
2. Fill in the employee details:
   - Personal information (Name, PAN, Age)
   - Income details (Basic Salary, HRA, Other Allowances)
   - Deductions under various sections
3. Click "Calculate Tax" to see results
4. View tax comparison between Old and New regimes
5. Download PDF report for your records

## Tax Slabs (FY 2024-25)

### Old Tax Regime
- Up to ₹2.5 lakhs: Nil
- ₹2.5 lakhs - ₹5 lakhs: 5%
- ₹5 lakhs - ₹10 lakhs: 20%
- Above ₹10 lakhs: 30%

### New Tax Regime
- Up to ₹3 lakhs: Nil
- ₹3 lakhs - ₹7 lakhs: 5%
- ₹7 lakhs - ₹10 lakhs: 10%
- ₹10 lakhs - ₹12 lakhs: 15%
- ₹12 lakhs - ₹15 lakhs: 20%
- Above ₹15 lakhs: 30%

## API Endpoints

- `POST /api/tax/calculate` - Calculate tax for given income and deductions
- `GET /api/tax/calculations` - Get all saved calculations
- `GET /api/tax/calculations/:id` - Get specific calculation by ID
- `GET /api/health` - Health check endpoint

## Project Structure

```
tax-calculator/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Utility functions
├── backend/               # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── utils/             # Tax calculation logic
├── public/                # Static files
└── build/                 # Production build
```

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting service

### Backend Deployment (Railway/Render)

1. Update the backend URL in `src/App.tsx`
2. Deploy the `backend` folder to your hosting service
3. Set environment variables as needed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This calculator is for educational and reference purposes only. The calculations are based on the Indian Income Tax laws for FY 2024-25. Please consult a qualified tax professional for accurate tax advice. The developers are not responsible for any errors or omissions in tax calculations.

## Support

For support, email your-email@example.com or raise an issue in the GitHub repository.

## Acknowledgments

- Income Tax Department of India
- React and Node.js communities
- All contributors and testers