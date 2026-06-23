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
        $attendance = Attendance::with('employee')->get();
        return response()->json([
            'status' => 1,
            'message' => 'Attendance records retrieved successfully.',
            'data' => $attendance
        ]);
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

            $present = $request->attendance_status === 'present';
            $late = $request->attendance_status === 'late';
            $absent = $request->attendance_status === 'absent';
            $on_leave = $request->attendance_status === 'on_leave';
            $empty_time_in = empty($request->time_in);
            $empty_time_out = empty($request->time_out);
            $time_out = $request->time_out;
            $time_in = $request->time_in;

            if (($present || $late) && ($empty_time_in || $empty_time_out)) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Time in and time out are required for present or late status.'
                ], 422);
            }else if(($on_leave || $absent) && ($time_in || $time_out)){
                return response()->json([
                    'status' => 0,
                    'message' => 'Time in and time out are not required for absent or on leave status.'
                ], 422);
            }

            if ($existing) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Attendance already recorded for this employee on this date.'
                ], 422);
            }

            $employee_name = Employee::where('employee_id', $request->employee_id)->first();
            $validated["employee_name"] = $employee_name->fullname;

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
                'message' => 'Server error: '
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
                'message' => 'Server error: '
            ], 500);
        }
    }

}