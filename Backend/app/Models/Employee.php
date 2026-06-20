<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    
}
