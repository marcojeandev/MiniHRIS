<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Employee;
use App\Models\Salary;

class Payroll extends Model
{
    protected $table = 'payroll';
    protected $fillable = [
        'employee_id',
        'salary_id',
        'payroll_date',
    ];
    public function employee(){
        return $this->belongsTo(Employee::class);
    }
    public function salary(){
        return $this->belongsTo(Salary::class);
    }
}
