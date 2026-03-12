import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { FinancialStatement } from '../entities/financial-statement.entity';

@Injectable()
export class FinancialCalculatorService {
    /**
     * Safe division handling for zero denominator.
     * Returns 0 if denominator is 0.
     */
    safeDiv(a: Decimal, b: Decimal): Decimal {
        if (b.isZero()) {
            return new Decimal(0);
        }
        return a.div(b);
    }

    /**
     * Calculates financial metrics and Z-Score based on Emerging Market formula.
     */
    calculateMetrics(stmt: FinancialStatement) {
        const {
            revenue,
            netIncome,
            equity,
            totalAssets,
            currentAssets,
            totalLiabilities,
            currentLiabilities,
            cashFlowOperating,
        } = stmt;

        // Edge Case: Negative Equity -> Insolvency check
        if (equity.isNegative()) {
            return {
                current_ratio: this.safeDiv(currentAssets, currentLiabilities),
                debt_equity: this.safeDiv(totalLiabilities, equity),
                roe: new Decimal(-999), // Flagged value
                z_score: new Decimal(-999), // Flagged value
                is_insolvent: true,
            };
        }

        // 1. Current Ratio = Current Assets / Current Liabilities
        const currentRatio = this.safeDiv(currentAssets, currentLiabilities);

        // 2. Debt to Equity = Total Liabilities / Equity
        const debtEquity = this.safeDiv(totalLiabilities, equity);

        // 3. ROE = Net Income / Equity
        const roe = this.safeDiv(netIncome, equity);

        // 4. Z-Score (Emerging Market Formula)
        // Formula: 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4
        // X1 = (Current Assets - Current Liabilities) / Total Assets
        // X2 = Retained Earnings / Total Assets. Using Net Income as proxy for simplicity in this MVP context if Retained Earnings not available.
        //      (Note: Ideally Retained Earnings should be tracked. Using Net Income for this MVP step).
        // X3 = EBIT / Total Assets. Using Net Income + Interest + Tax, or just Net Income if EBIT unavailable.
        //      (Using Net Income as proxy for MVP).
        // X4 = Book Value of Equity / Total Liabilities

        const workingCapital = currentAssets.minus(currentLiabilities);

        // X1
        const x1 = this.safeDiv(workingCapital, totalAssets);

        // X2 (Using Net Income as proxy for Retained Earnings accumulation for this period)
        const x2 = this.safeDiv(netIncome, totalAssets);

        // X3 (Using Net Income + (Assume 0 interest/tax for now as they aren't in entity) -> Net Income / Total Assets)
        // Effectively X2 and X3 are same in this simplified model without specific EBIT/RE fields.
        // To add variety/correctness likelihood, we might use Operating Cash Flow for X3 if it represents 'earnings' better?
        // Let's stick to Net Income for both X2 and X3 to be consistent with "Net Income" field availability.
        const x3 = this.safeDiv(netIncome, totalAssets);

        // X4
        const x4 = this.safeDiv(equity, totalLiabilities);

        const term1 = x1.times(6.56);
        const term2 = x2.times(3.26);
        const term3 = x3.times(6.72);
        const term4 = x4.times(1.05);

        const zScore = term1.plus(term2).plus(term3).plus(term4);

        return {
            current_ratio: currentRatio,
            debt_equity: debtEquity,
            roe: roe,
            z_score: zScore,
            is_insolvent: false,
        };
    }
}
