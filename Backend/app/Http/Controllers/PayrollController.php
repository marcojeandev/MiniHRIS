<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\PayrollRequest;
use App\Models\Payroll;

class PayrollController extends Controller
{
    use AuthorizesRequests;

    public function store(PayrollRequest $request)
    {
        try {
            $validated = $request->validated();
            $this->authorize('create', Payroll::class);

            $payroll = Payroll::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Payroll data created successfully.',
                'data' => $payroll
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(PayrollRequest $request, $id)
    {
        try {
            $payroll = Payroll::findOrFail($id);
            $validated = $request->validated();
            $this->authorize('update', $payroll);

            $payroll->update($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Payroll data updated successfully.',
                'data' => $payroll
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        try {
            $payrolls = Payroll::with('employee')->get();

            return response()->json([
                'status' => 1,
                'message' => 'Payroll records retrieved successfully.',
                'data' => $payrolls
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            // ✅ Fixed: Only load 'employee' relationship
            $payroll = Payroll::with('employee')->find($id);

            if (!$payroll) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Payroll record not found.'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Payroll record retrieved successfully.',
                'data' => $payroll
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getByEmployee($employeeId)
    {
        try {
            // ✅ Fixed: Only load 'employee' relationship
            $payrolls = Payroll::with('employee')
                ->where('employee_id', $employeeId)
                ->orderBy('payroll_date', 'desc')
                ->paginate(15);

            if ($payrolls->isEmpty()) {
                return response()->json([
                    'status' => 0,
                    'message' => 'No payroll records found for this employee.'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Payroll records retrieved successfully.',
                'data' => $payrolls
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function summary()
    {
        try {
            $totalPayroll = Payroll::sum('net_salary');
            $totalEmployees = Payroll::distinct('employee_id')->count();
            $averageSalary = Payroll::avg('net_salary');

            return response()->json([
                'status' => 1,
                'message' => 'Payroll summary retrieved successfully.',
                'data' => [
                    'total_payroll' => round($totalPayroll, 2),
                    'total_employees' => $totalEmployees,
                    'average_salary' => round($averageSalary, 2),
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