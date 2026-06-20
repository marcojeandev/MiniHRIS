<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayrollRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get payroll ID safely
        $payrollId = $this->route('payroll');
        
        // If it's an object, get the id, otherwise use the value directly
        if ($payrollId && is_object($payrollId) && method_exists($payrollId, 'getKey')) {
            $payrollId = $payrollId->getKey();
        }
        
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'employee_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'exists:employees,id',
                Rule::unique('payrolls', 'employee_id')
                    ->where('payroll_date', $this->payroll_date)
                    ->ignore($payrollId)
            ],
            'basic_salary' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'allowance' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'deductions' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'net_salary' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'payroll_date' => [
                $isUpdate ? 'sometimes' : 'required',
                'date'
            ],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee is required.',
            'employee_id.integer' => 'Invalid employee selected.',
            'employee_id.exists' => 'The selected employee does not exist.',
            'employee_id.unique' => 'Payroll record already exists for this employee on this date.',

            'basic_salary.required' => 'Basic salary is required.',
            'basic_salary.numeric' => 'Basic salary must be a valid number.',
            'basic_salary.min' => 'Basic salary must be at least 0.',
            'basic_salary.max' => 'Basic salary must not exceed 99,999,999.99.',

            'allowance.required' => 'Allowance is required.',
            'allowance.numeric' => 'Allowance must be a valid number.',
            'allowance.min' => 'Allowance must be at least 0.',
            'allowance.max' => 'Allowance must not exceed 99,999,999.99.',

            'deductions.required' => 'Deductions is required.',
            'deductions.numeric' => 'Deductions must be a valid number.',
            'deductions.min' => 'Deductions must be at least 0.',
            'deductions.max' => 'Deductions must not exceed 99,999,999.99.',

            'net_salary.required' => 'Net salary is required.',
            'net_salary.numeric' => 'Net salary must be a valid number.',
            'net_salary.min' => 'Net salary must be at least 0.',
            'net_salary.max' => 'Net salary must not exceed 99,999,999.99.',

            'payroll_date.required' => 'Payroll date is required.',
            'payroll_date.date' => 'Please enter a valid date.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-calculate net salary if not provided
        if ($this->has('basic_salary') && $this->has('allowance') && $this->has('deductions')) {
            $netSalary = $this->basic_salary + ($this->allowance ?? 0) - ($this->deductions ?? 0);
            $this->merge([
                'net_salary' => $netSalary
            ]);
        }
    }
}