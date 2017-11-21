<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ViewerContact;

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
    Mail::to("intechninja@gmail.com")->send(new ViewerContact($request));
    return view('welcome');
});
