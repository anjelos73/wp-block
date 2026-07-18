<?php
namespace WPBlock;

if ( ! defined( 'ABSPATH' ) ) exit;

class Plugin {

    public function run() {
        $this->load_dependencies();
        ( new Admin() )->init();
        ( new Assets() )->init();
        ( new Elements() )->init();
        ( new Shortcode() )->init();
    }

    private function load_dependencies() {
        require_once WPB_DIR . 'includes/class-admin.php';
        require_once WPB_DIR . 'includes/class-assets.php';
        require_once WPB_DIR . 'includes/class-elements.php';
        require_once WPB_DIR . 'includes/class-shortcode.php';
    }
}
