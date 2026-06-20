<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Employee;

class Salary extends Model
{
    protected $table = 'salary';
    protected $fillable = [
        'employee_id',
        'basic_salary',
        'allowance',
        'deductions',
        'net_salary',
    ];

    public function employee(){
        return $this->belongsTo(Employee::class);
    }
}
