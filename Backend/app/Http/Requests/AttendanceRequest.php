<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public access
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Get attendance ID for update (if exists)
        $attendanceId = $this->route('attendance');
        
        // If it's an object, get the id, otherwise use the value directly
        if ($attendanceId && is_object($attendanceId) && method_exists($attendanceId, 'getKey')) {
            $attendanceId = $attendanceId->getKey();
        }
        
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');

        return [
            'employee_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'exists:employees,employee_id'
            ],
            'date' => [
                $isUpdate ? 'sometimes' : 'required',
                'date',
                'before_or_equal:today'
            ],
            'time_in' => [
                'nullable',
                'date_format:H:i',
                'before:time_out'
            ],
            'time_out' => [
                'nullable',
                'date_format:H:i',
                'after:time_in'
            ],
            'attendance_status' => [
                $isUpdate ? 'sometimes' : 'required',
                Rule::in(['present', 'late', 'absent', 'leave'])
            ],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            // Employee ID
            'employee_id.required' => 'Employee is required.',
            'employee_id.string' => 'Invalid employee selected.',
            'employee_id.exists' => 'The selected employee does not exist.',

            // Date
            'date.required' => 'Attendance date is required.',
            'date.date' => 'Please enter a valid date.',
            'date.before_or_equal' => 'Attendance date cannot be in the future.',

            // Time In
            'time_in.nullable' => 'Time in is nullable.',
            'time_in.date_format' => 'Please enter a valid time in format (HH:MM).',
            'time_in.before' => 'Time in must be before time out.',

            // Time Out
            'time_out.date_format' => 'Please enter a valid time out format (HH:MM).',
            'time_out.after' => 'Time out must be after time in.',

            // Attendance Status
            'attendance_status.nullable' => 'Attendance status is nullable.',
            'attendance_status.in' => 'Status must be: present, late, absent, or leave.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-set status based on time_in if not provided
        if ($this->has('time_in') && !$this->has('attendance_status')) {
            $timeIn = $this->time_in;
            
            // If time_in is after 8:00 AM, mark as late
            if ($timeIn > '08:00') {
                $this->merge([
                    'attendance_status' => 'late'
                ]);
            } else {
                $this->merge([
                    'attendance_status' => 'present'
                ]);
            }
        }
    }
}