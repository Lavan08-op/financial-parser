import anthropic
import json
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

def classify_and_extract(text: str) -> dict:
    prompt = f"""You are a financial document parser. Analyze this document text and:
1. Classify the document type (one of: bank_statement, itr, gst_return, salary_slip, invoice, balance_sheet, profit_loss)
2. Extract all relevant financial fields based on the document type

Document text:
{text[:3000]}

Respond ONLY with valid JSON in this exact format:
{{
  "document_type": "bank_statement",
  "extracted_data": {{
    "field1": "value1",
    "field2": "value2"
  }},
  "confidence": 0.95
}}

For bank_statement extract: bank_name, account_holder, account_number, ifsc_code, statement_period, opening_balance, closing_balance, total_credits, total_debits, transaction_count
For itr extract: pan, assessment_year, gross_income, tax_paid, refund, total_deductions, taxable_income
For gst_return extract: gstin, business_name, filing_period, taxable_value, cgst, sgst, igst, total_tax
For salary_slip extract: employee_name, company_name, employee_id, pan, month, gross_salary, net_salary, deductions, pf, professional_tax
For invoice extract: invoice_number, invoice_date, vendor_name, customer_name, gst_number, invoice_amount, tax_amount
For balance_sheet extract: total_assets, total_liabilities, equity, current_assets, current_liabilities, fixed_assets
For profit_loss extract: revenue, gross_profit, operating_expenses, net_profit, ebitda"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        response_text = message.content[0].text.strip()
        # clean json
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        return json.loads(response_text)
    except Exception as e:
        return {
            "document_type": "unknown",
            "extracted_data": {},
            "confidence": 0.0,
            "error": str(e)
        }