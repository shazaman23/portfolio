<?php

namespace App\Http\Controllers;

use App\Models\WorkExperience;
use App\Mail\ViewerContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class HomeController extends Controller
{
    // /**
    //  * Future home page once things are shifted to SPA.
    //  * 
    //  * @return \Illuminate\Contract\Support\Renderable
    //  */
    // public function index() {
    //     return view('home');
    // }

    /**
     * Load the home page.
     */
    public function home() {
        $workExperiences = WorkExperience::all();
        return view('welcome')->with('experiences', $workExperiences);
    }

    /**
     * Send an email
     */
    public function sendMail(Request $request) {
        $validatedData = Validator::make($request->all(), [
            'name' => 'required|max:150',
            'email' => 'required|email',
            'body' => 'required|string'
        ]);

        if ($validatedData->fails()) {
            return redirect('/#contact-me')->withErrors($validatedData->errors())->withInput();
        }

        Mail::to("intechninja@gmail.com")->send(new ViewerContact($request));

        return redirect('/');
    }

    /**
     * Load page for an individual experience
     */
    public function experienceIndex($id) {
        $experience = WorkExperience::where('id', $id)->firstOrFail();
        return view('experiences.index')->with('experience', $experience);
    }
}
