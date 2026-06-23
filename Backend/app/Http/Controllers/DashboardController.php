<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $totalEmployees = Employee::count();
            $activeEmployees = Employee::where('employee_status', 'active')->count();
            $employeesOnLeave = Employee::where('employee_status', 'leave')->count();
            
            // Get latest payroll total
            $totalMonthlyPayroll = Payroll::sum('net_salary');

            // Recent employees (last 5)
            $recentEmployees = Employee::orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'employee_id', 'fullname', 'position', 'department', 'employee_status']);

            return response()->json([
                'status' => 1,
                'message' => 'Dashboard data retrieved successfully.',
                'data' => [
                    'stats' => [
                        'total_employees' => $totalEmployees,
                        'active_employees' => $activeEmployees,
                        'employees_on_leave' => $employeesOnLeave,
                        'total_monthly_payroll' => round($totalMonthlyPayroll, 2),
                    ],
                    'recent_employees' => $recentEmployees,
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