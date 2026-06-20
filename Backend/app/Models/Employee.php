<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Salary;
use App\Models\Payroll;

class Employee extends Model
{
    protected $table = 'employees';
    protected $fillable = [
        'employee_id',
        'fullname',
        'email',
        'contact',
        'position',
        'department',
        'date_hired',
        'employee_status'
    ];
    public function salary(){
        return $this->hasOne(Salary::class);
    } 
    public function payroll(){
        return $this->hasOne(Payroll::class);
    } 
    public function attendance(){
        return $this->hasMany(Payroll::class);
    } 
}
