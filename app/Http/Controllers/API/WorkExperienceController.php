<?php

namespace App\Http\Controllers\API;

use App\Models\WorkExperience;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkExperienceController extends Controller
{
    /**
     * Return all work experiences.
     * 
     * @return [WorkExperience]
     */
    public function index() {
        return WorkExperience::get();
    }
    
    /**
     * Create a work experience.
     * 
     * @return WorkExperience
     */
    public function store(Request $request) {
        // $validated = $request->validate([
        //     '' => 'required'
        // ]);

        $workExperience = new WorkExperience;
        // $workExperience->name = $request->get('name');
        $workExperience->save();

        return \Response::json($workExperience, 201);
    }
}
