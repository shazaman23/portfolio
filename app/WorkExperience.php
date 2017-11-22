<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class WorkExperience extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'work_experiences';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['title', 'problem', 'description', 'url', 'backgroundImage'];
}
