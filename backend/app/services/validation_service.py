import re

def validate_pan(pan: str) -> bool:
    return bool(re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', str(pan).upper()))

def validate_gstin(gstin: str) -> bool:
    return bool(re.match(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$', str(gstin).upper()))

def validate_ifsc(ifsc: str) -> bool:
    return bool(re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', str(ifsc).upper()))

def validate_extracted_data(document_type: str, data: dict) -> dict:
    validation_results = {}
    errors = []

    if document_type == "bank_statement":
        if data.get("ifsc_code"):
            valid = validate_ifsc(data["ifsc_code"])
            validation_results["ifsc_code"] = "valid" if valid else "invalid"
            if not valid:
                errors.append("Invalid IFSC format")

        if data.get("account_number"):
            valid = len(str(data["account_number"])) >= 9
            validation_results["account_number"] = "valid" if valid else "invalid"
            if not valid:
                errors.append("Invalid account number")

    elif document_type in ["itr", "salary_slip"]:
        if data.get("pan"):
            valid = validate_pan(data["pan"])
            validation_results["pan"] = "valid" if valid else "invalid"
            if not valid:
                errors.append("Invalid PAN format")

    elif document_type == "gst_return":
        if data.get("gstin"):
            valid = validate_gstin(data["gstin"])
            validation_results["gstin"] = "valid" if valid else "invalid"
            if not valid:
                errors.append("Invalid GSTIN format")

    return {
        "field_validations": validation_results,
        "errors": errors,
        "is_valid": len(errors) == 0
    }