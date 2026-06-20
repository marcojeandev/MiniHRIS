<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
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
         $employeeId = $this->route('employee');
    
        // If it's an object, get the id, otherwise use the value directly
        if ($employeeId instanceof \App\Models\Employee) {
            $employeeId = $employeeId->id;
        }

        return [
            'employee_id' => [
                'required',
                'string',
                'max:50',
                Rule::unique('employees', 'employee_id')->ignore($employeeId)
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employeeId)
            ],
            'fullname' => ['required', 'string', 'max:2555'],
            'contact' => ['required', 'string', 'max:20'],
            'position' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'date_hired' => ['required', 'date', 'before_or_equal:today'],
            'employee_status' => ['required', Rule::in(['active', 'resigned', 'leave'])],
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
            'employee_id.required' => 'Employee ID is required.',
            'employee_id.string' => 'Employee ID must be a valid string.',
            'employee_id.max' => 'Employee ID must not exceed 50 characters.',
            'employee_id.unique' => 'This Employee ID already exists in the system.',

            // Fullname
            'fullname.required' => 'Full name is required.',
            'fullname.string' => 'Full name must be a valid string.',
            'fullname.max' => 'Full name must not exceed 255 characters.',

            // Email
            'email.required' => 'Email address is required.',
            'email.string' => 'Email must be a valid string.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email must not exceed 255 characters.',
            'email.unique' => 'This email address is already registered.',

            // Contact
            'contact.required' => 'Contact number is required.',
            'contact.string' => 'Contact number must be a valid string.',
            'contact.max' => 'Contact number must not exceed 20 characters.',

            // Position
            'position.required' => 'Position is required.',
            'position.string' => 'Position must be a valid string.',
            'position.max' => 'Position must not exceed 100 characters.',

            // Department
            'department.required' => 'Department is required.',
            'department.string' => 'Department must be a valid string.',
            'department.max' => 'Department must not exceed 100 characters.',

            // Date Hired
            'date_hired.required' => 'Date hired is required.',
            'date_hired.date' => 'Please enter a valid date.',
            'date_hired.before_or_equal' => 'Date hired cannot be in the future.',

            // Employee Status
            'employee_status.required' => 'Employee status is required.',
            'employee_status.in' => 'Employee status must be: active, resigned, or leave.',
        ];
    }
}
