<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\AttendanceRequest;
use App\Models\Attendance;
use App\Models\Employee;

class AttendanceController extends Controller
{
    /**
     * Display a listing of attendance records.
     */
    public function index()
    {
        try {
            $attendance = Attendance::with('employee')
                ->orderBy('date', 'desc')
                ->paginate(15);

            return response()->json([
                'status' => 1,
                'message' => 'Attendance records retrieved successfully.',
                'data' => $attendance
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created attendance record.
     */
    public function store(AttendanceRequest $request)
    {
        try {
            $validated = $request->validated();

            // Check if attendance already exists for this employee on this date
            $existing = Attendance::where('employee_id', $validated['employee_id'])
                ->where('date', $validated['date'])
                ->first();

            if ($existing) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Attendance already recorded for this employee on this date.'
                ], 422);
            }

            $attendance = Attendance::create($validated);
            $attendance->load('employee');

            return response()->json([
                'status' => 1,
                'message' => 'Attendance recorded successfully.',
                'data' => $attendance
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified attendance record.
     */
    public function show($id)
    {
        try {
            $attendance = Attendance::with('employee')->find($id);

            if (!$attendance) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Attendance record not found.'
                ], 404);
            }

            return response()->json([
                'status' => 1,
                'message' => 'Attendance record retrieved successfully.',
                'data' => $attendance
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

}