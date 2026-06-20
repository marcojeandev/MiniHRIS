<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Model\Employee;

class Attendance extends Model
{
    protected $table = 'attendance';
    protected $fillable = [
        'employee_id',
        'employee_name',
        'date',
        'time_in',
        'time_out',
        'attendance_status',
    ];
    public function employee(){
        return $this->belongsTo(Employee::class);
    }
}
