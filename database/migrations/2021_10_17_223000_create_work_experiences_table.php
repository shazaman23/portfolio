<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkExperiencesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('work_experiences', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('title');
            $table->text('problem');
            $table->text('description');
            $table->string('url');
            $table->string('myPart');
            $table->string('backgroundImage');
            $table->string('demoText')->nullable();
            $table->boolean('noMobile');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('work_experiences');
    }
}
