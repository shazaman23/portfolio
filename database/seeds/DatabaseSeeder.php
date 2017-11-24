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
          'problem' => "UK2.net needed a good, easy way for clients to keep track of the items in their cart. Along with providing clients with a summary of their cart items, it also needed to provide a CTA that would let them return to their cart and complete their order.",
          'description' => "I developed the dropdown cart structure using PHP and HTML with CSS to run the styling and control dropdown behaviour. Javascript was then used to manipulate the cart data and parse the list of items in the cart. The finished feature combined with the dont forget overlay improved sales on the site by more than £2,500!",
          'url' => "https://www.uk2.net/",
          'myPart' => "Developed",
          'backgroundImage' => "uk2-dropdown.png",
          'created_at' => date("Y-m-d h:i:s"),
          'updated_at' => date("Y-m-d h:i:s")
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Don't Forget Overlay",
          'problem' => "Have you ever started shopping online and then left the site before you were finished? UK2.net wanted a friendly way to remind clients of the status of their cart before leaving. The reminder would both let the client see what was in their cart and provide them a CTA to finish their order before leaving.",
          'description' => "I used Javascript and JQuery to parse the cart information and track the movements of the mouse to trigger the overlay. I also used PHP, HTML, and CSS to develop and style this feature. The finished feature combined with the cart dropdown improved sales on the site by more than £2,500!",
          'url' => "https://www.uk2.net/",
          'myPart' => "Developed",
          'backgroundImage' => "uk2-dont-forget.png",
          'created_at' => date("Y-m-d h:i:s"),
          'updated_at' => date("Y-m-d h:i:s")
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Bulk Domain Search",
          'problem' => "UK2.net had a search field that was designed to accept multiple search items. However, in order to work properly the items had to be separated by commas! UK2.net needed to rework the search area so it would be more user friendly.",
          'description' => "I developed a search using simple input fields with HTML and PHP for structure, CSS for style, and JQuery to add/remove input fields and parse the data for submission. The new system is more user friendly and made it possible to validate each searched item individually when it is submitted.",
          'url' => "https://www.uk2.net/domain-names/bulk-domain-registration/",
          'myPart' => "Developed",
          'backgroundImage' => "uk2-bulk-search.png",
          'created_at' => date("Y-m-d h:i:s"),
          'updated_at' => date("Y-m-d h:i:s")
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "UK2",
          'title' => "Dynamic Disclaimers",
          'problem' => "UK2 found that the disclaimers on their site were confusing at times. Some pages had multiple disclaimers with different definitions using the same symbols. Some pages had disclaimers but the definitions for each symbol were hard to find. UK2 needed a better way to use and organize discliamers on their site.",
          'description' => "I designed and developed a system in which all the disclaimers were located in one file. PHP is then used on any page that has a disclaimer icon to generate an accurate list of disclaimer definitions at the bottom of the page. Additionally, links were added to each symbol so that a user could click a disclaimer symbol in line and an overlay with the definition would popup.",
          'url' => "https://www.uk2.net/#disclaimer-section",
          'myPart' => "Designed & Developed",
          'backgroundImage' => "uk2-disclaimers.png",
          'created_at' => date("Y-m-d h:i:s"),
          'updated_at' => date("Y-m-d h:i:s")
        ]);
        DB::table('work_experiences')->insert([
          'brand' => "Benegov",
          'title' => "Website",
          'problem' => "Kyle Barney and I started a small business focused on app development for city governments. The apps that we designed were geared towards improving efficiency for governmental bodies by handling things like applications to committees, public meeting scheduling, and citizen complaints.",
          'description' => "I designed and developed a large portion of the benegov website. In development of the site we implemented vanilla Javascript, HTML, PHP, and Bootstrap CSS in the Laravel Framework. The site was never launched but a number of the apps were successfully finished and some were demoed by a city government in Texas.",
          'url' => "http://benegov.kylebarney.io/open-meetings",
          'myPart' => "Designed & Developed",
          'backgroundImage' => "benegov-site.png",
          'created_at' => date("Y-m-d h:i:s"),
          'updated_at' => date("Y-m-d h:i:s")
        ]);
    }
}
