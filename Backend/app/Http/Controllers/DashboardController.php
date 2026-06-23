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
            // Employee stats
            $totalEmployees = Employee::count();
            $activeEmployees = Employee::where('employee_status', 'active')->count();
            $employeesOnLeave = Employee::where('employee_status', 'leave')->count();
            $totalMonthlyPayroll = Payroll::sum('net_salary');

            // Attendance stats for today
            $today = now()->toDateString();
            $attendanceToday = Attendance::whereDate('date', $today)->count();
            $presentToday = Attendance::whereDate('date', $today)
                ->where('attendance_status', 'present')
                ->count();
            $lateToday = Attendance::whereDate('date', $today)
                ->where('attendance_status', 'late')
                ->count();
            $absentToday = Attendance::whereDate('date', $today)
                ->where('attendance_status', 'absent')
                ->count();
            $leaveToday = Attendance::whereDate('date', $today)
                ->where('attendance_status', 'leave')
                ->count(); // ✅ Added

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
                    'attendance_today' => [
                        'total' => $attendanceToday,
                        'present' => $presentToday,
                        'late' => $lateToday,
                        'absent' => $absentToday,
                        'leave' => $leaveToday, 
                    ],
                    'recent_employees' => $recentEmployees,
                ]
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: '
            ], 500);
        }
    }
}