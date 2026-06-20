<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\SalaryRequest;
use App\Models\Salary;
use App\Models\Employee;
use App\Models\Payroll;

class SalaryController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of salaries.
     */
    public function index()
    {
        try {
            $salaries = Salary::with('employee')->paginate(15);

            return response()->json([
                'status' => 1,
                'message' => 'Salaries retrieved successfully.',
                'data' => $salaries
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created salary.
     */
    public function store(SalaryRequest $request)
    {
        try {
            $this->authorize('create', Salary::class);
            
            $validated = $request->validated();
            
            // Auto-calculate net salary if not provided
            if (!isset($validated['net_salary'])) {
                $validated['net_salary'] = $validated['basic_salary'] + ($validated['allowance'] ?? 0) - ($validated['deductions'] ?? 0);
            }

            $salary = Salary::create($validated);


            // Load employee relationship
            $salary->load('employee');

            return response()->json([
                'status' => 1,
                'message' => 'Employee salary data created successfully.',
                'data' => $salary
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified salary.
     */
    public function show($id)
    {
        try {
            $salary = Salary::with('employee')->find($id);

            if (!$salary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Salary not found.'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Salary retrieved successfully.',
                'data' => $salary
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified salary.
     */
    public function update(SalaryRequest $request, $id)
    {
        try {
            $salary = Salary::find($id);

            if (!$salary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Salary not found.'
                ], 404);
            }

            $this->authorize('update', $salary);

            $validated = $request->validated();

            // Auto-calculate net salary if not provided
            if (!isset($validated['net_salary'])) {
                $validated['net_salary'] = ($validated['basic_salary'] ?? $salary->basic_salary) 
                    + ($validated['allowance'] ?? $salary->allowance ?? 0) 
                    - ($validated['deductions'] ?? $salary->deductions ?? 0);
            }

            $salary->update($validated);

            // Load employee relationship
            $salary->load('employee');

            return response()->json([
                'status' => 1,
                'message' => 'Salary updated successfully.',
                'data' => $salary
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified salary.
     */
    public function destroy($id)
    {
        try {
            $salary = Salary::find($id);

            if (!$salary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Salary not found.'
                ], 404);
            }

            $this->authorize('delete', $salary);

            $salary->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Salary deleted successfully.',
                'data' => null
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get salary by employee ID.
     */
    public function getByEmployee($employeeId)
    {
        try {
            $employee = Employee::find($employeeId);

            if (!$employee) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Employee not found.'
                ], 404);
            }

            $salary = Salary::with('employee')
                ->where('employee_id', $employeeId)
                ->first();

            if (!$salary) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No salary record found for this employee.'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Salary retrieved successfully.',
                'data' => $salary
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get salary summary.
     */
    public function summary()
    {
        try {
            $totalEmployees = Salary::distinct('employee_id')->count();
            $totalPayroll = Salary::sum('net_salary');
            $averageSalary = Salary::avg('net_salary');
            
            $highestSalary = Salary::with('employee')
                ->orderBy('net_salary', 'desc')
                ->first();
                
            $lowestSalary = Salary::with('employee')
                ->orderBy('net_salary', 'asc')
                ->first();

            $departmentSummary = Salary::with('employee')
                ->selectRaw('employees.department, COUNT(*) as employees, SUM(salary.net_salary) as total_salary')
                ->join('employees', 'salary.employee_id', '=', 'employees.id')
                ->groupBy('employees.department')
                ->get();

            return response()->json([
                'status' => 1,
                'message' => 'Salary summary retrieved successfully.',
                'data' => [
                    'total_employees' => $totalEmployees,
                    'total_payroll' => round($totalPayroll, 2),
                    'average_salary' => round($averageSalary, 2),
                    'highest_salary' => $highestSalary ? [
                        'employee' => $highestSalary->employee->fullname ?? 'N/A',
                        'amount' => round($highestSalary->net_salary, 2)
                    ] : null,
                    'lowest_salary' => $lowestSalary ? [
                        'employee' => $lowestSalary->employee->fullname ?? 'N/A',
                        'amount' => round($lowestSalary->net_salary, 2)
                    ] : null,
                    'department_summary' => $departmentSummary
                ]
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}