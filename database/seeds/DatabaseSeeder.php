<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Dropdown Cart",
          'problem' => "",
          'description' => "",
          'url' => "https://www.uk2.net/",
          'backgroundImage' => "uk2-dropdown.png"
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Don't Forget Overlay",
          'problem' => "",
          'description' => "",
          'url' => "https://www.uk2.net/",
          'backgroundImage' => "uk2-dont-forget.png"
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Bulk Domain Search",
          'problem' => "",
          'description' => "",
          'url' => "https://www.uk2.net/domain-names/bulk-domain-registration/",
          'backgroundImage' => "uk2-bulk-search.png"
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Dynamic Disclaimers",
          'problem' => "",
          'description' => "",
          'url' => "https://www.uk2.net/#disclaimer-section",
          'backgroundImage' => "uk2-disclaimers.png"
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "Benegov",
          'title' => "Website",
          'problem' => "",
          'description' => "",
          'url' => "http://benegov.kylebarney.io/open-meetings",
          'backgroundImage' => "benegov-site.png"
        ]);
    }
}
