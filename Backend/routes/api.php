<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\PayrollController;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['admin', 'auth:sanctum', 'throttle:60,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        //  Employees management
        Route::apiResource('employees', EmployeeController::class);

        // Salary management - all use 'salaries' (plural)
        Route::apiResource('salaries', SalaryController::class);
        Route::get('/salaries/employee/{employeeId}', [SalaryController::class, 'getByEmployee']);
        Route::get('/salaries/summary', [SalaryController::class, 'summary']);

        // attenadance mangement
        Route::apiResource('attenadance', EmployeeController::class);

        // payroll mangement
        Route::apiResource('payroll', PayrollController::class);
    });