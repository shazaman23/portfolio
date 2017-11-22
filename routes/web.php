<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ViewerContact;
use Illuminate\Support\Facades\Validator;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::post('/send', function(Request $request) {
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
});
