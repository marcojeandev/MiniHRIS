<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SalaryRequest extends FormRequest
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
        // Get employee ID from route (for update)
        $salaryId = $this->route('salary') ? $this->route('salary')->id : null;

        return [
            'employee_id' => [
                'required',
                'integer',
                'exists:employees,id'
            ],
            'basic_salary' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'allowance' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'deductions' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
            'net_salary' => [
                'nullable',
                'numeric',
                'min:0',
                'max:99999999.99'
            ],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Employee ID
            'employee_id.required' => 'Employee is required.',
            'employee_id.integer' => 'Invalid employee selected.',
            'employee_id.exists' => 'The selected employee does not exist.',

            // Basic Salary
            'basic_salary.required' => 'Basic salary is required.',
            'basic_salary.numeric' => 'Basic salary must be a valid number.',
            'basic_salary.min' => 'Basic salary must be at least 0.',
            'basic_salary.max' => 'Basic salary must not exceed 99,999,999.99.',

            // Allowance
            'allowance.numeric' => 'Allowance must be a valid number.',
            'allowance.min' => 'Allowance must be at least 0.',
            'allowance.max' => 'Allowance must not exceed 99,999,999.99.',

            // Deductions
            'deductions.numeric' => 'Deductions must be a valid number.',
            'deductions.min' => 'Deductions must be at least 0.',
            'deductions.max' => 'Deductions must not exceed 99,999,999.99.',

            // Net Salary
            'net_salary.numeric' => 'Net salary must be a valid number.',
            'net_salary.min' => 'Net salary must be at least 0.',
            'net_salary.max' => 'Net salary must not exceed 99,999,999.99.',
        ];
    }

}