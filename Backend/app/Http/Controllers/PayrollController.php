<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\PayrollRequest;
use App\Models\Payroll;

class PayrollController extends Controller
{
    use AuthorizesRequests;

    public function store(PayrollRequest $request){
        try {
            $validated = $request->validated();
            $this->authorize('create', Payroll::class);

            $payroll = Payroll::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Payrol data created successfully.',
                'data' => $payroll
            ]);
            
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(PayrollRequest $request, $id){
        try {
            $payroll = Payroll::findOrFail($id);
            $validated = $request->validated();
            $this->authorize('update', $payroll);

            $payroll->update($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Payrol data updated successfully.',
                'data' => $payroll
            ]);
            
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of payroll records.
     */
    public function index()
    {
        try {
            $payrolls = Payroll::with(['employee', 'salary'])
                ->orderBy('payroll_date', 'desc')
                ->paginate(15);

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

    /**
     * Display the specified payroll record.
     */
    public function show($id)
    {
        try {
            $payroll = Payroll::with(['employee', 'salary'])->find($id);

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

    /**
     * Get payroll records by employee ID.
     */
    public function getByEmployee($employeeId)
    {
        try {
            $payrolls = Payroll::with(['employee', 'salary'])
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

    /**
     * Get payroll summary.
     */
    public function summary()
    {
        try {
            $totalPayroll = Payroll::sum('net_pay');
            $averagePay = Payroll::avg('net_pay');
            $totalEmployees = Payroll::distinct('employee_id')->count();
            
            $highestPay = Payroll::with('employee')
                ->orderBy('net_pay', 'desc')
                ->first();
                
            $lowestPay = Payroll::with('employee')
                ->orderBy('net_pay', 'asc')
                ->first();

            $statusSummary = Payroll::selectRaw('status, COUNT(*) as count, SUM(net_pay) as total')
                ->groupBy('status')
                ->get();

            // Calculate total gross and deductions
            $totalGross = Payroll::sum('gross_pay');
            $totalDeductions = Payroll::sum('total_deductions');

            return response()->json([
                'status' => 1,
                'message' => 'Payroll summary retrieved successfully.',
                'data' => [
                    'total_payroll' => round($totalPayroll, 2),
                    'total_gross_pay' => round($totalGross, 2),
                    'total_deductions' => round($totalDeductions, 2),
                    'average_pay' => round($averagePay, 2),
                    'total_employees_paid' => $totalEmployees,
                    'highest_pay' => $highestPay ? [
                        'employee' => $highestPay->employee->fullname ?? 'N/A',
                        'amount' => round($highestPay->net_pay, 2)
                    ] : null,
                    'lowest_pay' => $lowestPay ? [
                        'employee' => $lowestPay->employee->fullname ?? 'N/A',
                        'amount' => round($lowestPay->net_pay, 2)
                    ] : null,
                    'status_summary' => $statusSummary,
                    'formula' => 'Net Salary = Gross Pay - Total Deductions'
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