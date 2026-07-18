<?php
/**
 * Plugin Name: WP Block - Page Builder
 * Plugin URI:  https://github.com/anjelos73/wp-block
 * Description: Visual drag-and-drop page builder for WordPress. Lightweight, OOP, no jQuery.
 * Version:     1.0.0
 * Author:      Angelo Spanu
 * Author URI:  https://github.com/anjelos73
 * License:     GPL-2.0-or-later
 * Text Domain: wp-block
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WPB_VERSION',  '1.0.0' );
define( 'WPB_FILE',     __FILE__ );
define( 'WPB_DIR',      plugin_dir_path( __FILE__ ) );
define( 'WPB_URL',      plugin_dir_url( __FILE__ ) );

require_once WPB_DIR . 'includes/class-plugin.php';

function wpb_run() {
    $plugin = new WPBlock\Plugin();
    $plugin->run();
}
add_action( 'plugins_loaded', 'wpb_run' );
