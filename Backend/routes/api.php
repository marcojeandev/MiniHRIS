<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SalaryController;

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

        // Salary mangement
        Route::apiResource('salarys', SalaryController::class);

        // attenadance mangement
        Route::apiResource('attenadance', EmployeeController::class);

        // payroll mangement
        Route::apiResource('payroll', EmployeeController::class);
    });