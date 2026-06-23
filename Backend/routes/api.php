<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['admin', 'auth:sanctum', 'throttle:60,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
    
        //  Employees management
        Route::apiResource('employees', EmployeeController::class);

        // Salary management 
        Route::get('/salaries/employee/{employeeId}', [SalaryController::class, 'getByEmployee']);
        Route::get('/salaries/summary', [SalaryController::class, 'summary']);
        Route::apiResource('salaries', SalaryController::class);

        // attenadance mangement
        Route::apiResource('attendance', AttendanceController::class);

        // payroll mangement
        Route::get('/payroll/summary', [PayrollController::class, 'summary']); 
        Route::apiResource('payroll', PayrollController::class);
    });