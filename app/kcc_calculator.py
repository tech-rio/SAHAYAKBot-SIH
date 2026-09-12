"""
SAHAYAKBot KCC Calculator Module
Computes Kisan Credit Card 4% subsidized loan interest and savings.
"""
from pydantic import BaseModel, Field
from typing import Optional


class KCCResult(BaseModel):
    """KCC Loan Calculation Result"""
    loan_amount: float
    base_rate: str = "7.0%"
    base_interest: float
    subvention_rate: str = "-3.0%"
    subvention_amount: float
    net_rate: str = "4.0%"
    net_interest: float
    annual_farmer_savings: float
    max_collateral_free_limit: int = 160000
    statutory_ref: str = "RBI Circular RPCD.CO.LBS.BC.No / Govt of India Interest Subvention Scheme (IS-PRI)"


def calculate_kcc(amount: float = 150000) -> KCCResult:
    """
    Calculate KCC 4% subsidized interest based on loan amount.
    
    Formula:
    - Base interest: 7% per annum
    - Government subvention: 3% (for prompt repayment)
    - Net farmer interest: 4% per annum
    
    Args:
        amount: Loan amount in INR (default ₹1,50,000)
    
    Returns:
        KCCResult with all computed values
    """
    # Clamp to valid range
    amount = max(10000, min(amount, 300000))
    
    base_interest = round(amount * 0.07, 2)
    subvention = round(amount * 0.03, 2)
    net_interest = round(amount * 0.04, 2)

    return KCCResult(
        loan_amount=amount,
        base_interest=base_interest,
        subvention_amount=subvention,
        net_interest=net_interest,
        annual_farmer_savings=subvention,
    )
