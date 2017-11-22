<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Mail\ViewerContact;
use App\WorkExperience;

class SiteController extends Controller
{
    public function home() {
      return view('welcome');
    }

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

    public function experienceIndex(WorkExperience $id) {
      return view('welcome');
    }
}
