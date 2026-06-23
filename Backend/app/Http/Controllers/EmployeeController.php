<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\EmployeeRequest;  
use App\Models\Employee;

class EmployeeController extends Controller
{
    use AuthorizesRequests;

    public function store(EmployeeRequest $request){
        try {
            $validated = $request->validated();
            $this->authorize('create', Employee::class);

            $employees = Employee::create($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Employee data created successfully.',
                'data' => $employees
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'server error. ' . $e->getMessage()
            ]);
        }
    }

    public function update(EmployeeRequest $request, $id){
        try {
            $employees = Employee::findOrFail($id);
            $validated = $request->validated();
            $this->authorize('update', $employees);

            $employees->update($validated);

            return response()->json([
                'status' => 1,
                'message' => 'Employee data updated successfully.',
                'data' => $employees
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'server error.'
            ]);
        }
    }

    public function destroy($id){
        try {
            $employees = Employee::findOrFail($id);
            $this->authorize('delete', $employees);

            $employees->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Employee data deleted successfully.'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'server error.'
            ]);
        }
    }

    public function show($id){
        try {
            $employees = Employee::findOrFail($id);
            $this->authorize('view', $employees);
            
            return response()->json([
                'status' => 1,
                'message' => 'Employee data fetched successfully.',
                'data' => $employees,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'server error. ' . $e->getMessage()
            ]);
        }
    }

    public function index(){
        try {
            $this->authorize('viewAny', Employee::class);
            $employees = Employee::all();
            return response()->json([
                'status' => 1,
                'message' => 'Employees data fetched successfully.',
                'data' => $employees,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'server error. ' . $e->getMessage()
            ]);
        }
    }
}
