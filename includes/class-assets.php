<?php
namespace WPBlock;

if ( ! defined( 'ABSPATH' ) ) exit;

class Assets {

    public function init() {
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin' ] );
        add_action( 'wp_enqueue_scripts',    [ $this, 'enqueue_front' ] );
    }

    public function enqueue_admin( $hook ) {
        // Carica solo nelle pagine post/page edit
        global $pagenow;
        if ( ! in_array( $pagenow, [ 'post.php', 'post-new.php' ] ) ) return;

        // SortableJS (CDN)
        wp_enqueue_script(
            'sortablejs',
            'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
            [],
            '1.15.2',
            true
        );

        wp_enqueue_style(
            'wpb-admin',
            WPB_URL . 'assets/css/admin.css',
            [],
            WPB_VERSION
        );

        wp_enqueue_script(
            'wpb-admin',
            WPB_URL . 'assets/js/admin.js',
            [ 'sortablejs' ],
            WPB_VERSION,
            true
        );

        // Localizza script con dati PHP -> JS
        wp_localize_script( 'wpb-admin', 'WPB', [
            'ajaxurl'  => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'wpb_ajax' ),
            'elements' => apply_filters( 'wpb_registered_elements', [] ),
        ] );
    }

    public function enqueue_front() {
        wp_enqueue_style(
            'wpb-front',
            WPB_URL . 'assets/css/front.css',
            [],
            WPB_VERSION
        );
    }
}
