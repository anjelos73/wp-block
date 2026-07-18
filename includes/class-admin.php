<?php
namespace WPBlock;

if ( ! defined( 'ABSPATH' ) ) exit;

class Admin {

    public function init() {
        add_action( 'add_meta_boxes', [ $this, 'add_meta_box' ] );
        add_action( 'save_post',      [ $this, 'save_meta' ] );
        add_action( 'admin_menu',     [ $this, 'add_menu' ] );
    }

    public function add_menu() {
        add_menu_page(
            __( 'WP Block', 'wp-block' ),
            __( 'WP Block', 'wp-block' ),
            'manage_options',
            'wp-block',
            [ $this, 'render_settings_page' ],
            'dashicons-layout',
            58
        );
    }

    public function render_settings_page() {
        echo '<div class="wrap"><h1>WP Block Settings</h1><p>Versione ' . esc_html( WPB_VERSION ) . '</p></div>';
    }

    public function add_meta_box() {
        $post_types = get_post_types( [ 'public' => true ], 'names' );
        foreach ( $post_types as $pt ) {
            add_meta_box(
                'wpb-editor',
                __( 'WP Block Editor', 'wp-block' ),
                [ $this, 'render_editor' ],
                $pt,
                'normal',
                'high'
            );
        }
    }

    public function render_editor( $post ) {
        wp_nonce_field( 'wpb_save_layout', 'wpb_nonce' );
        $layout = get_post_meta( $post->ID, '_wpb_layout', true );
        $layout_json = $layout ? esc_attr( $layout ) : '';
        ?>
        <div id="wpb-app" data-post-id="<?php echo esc_attr( $post->ID ); ?>">

            <!-- Toolbar -->
            <div id="wpb-toolbar">
                <button class="wpb-btn wpb-add-row">
                    <span class="dashicons dashicons-plus-alt2"></span> Aggiungi Riga
                </button>
                <button class="wpb-btn wpb-btn-secondary" id="wpb-preview-toggle">
                    <span class="dashicons dashicons-visibility"></span> Anteprima Shortcode
                </button>
            </div>

            <!-- Canvas drag-and-drop -->
            <div id="wpb-canvas"></div>

            <!-- Sidebar proprietà -->
            <div id="wpb-sidebar">
                <div id="wpb-sidebar-inner">
                    <p class="wpb-sidebar-placeholder">Seleziona un elemento per modificarne le proprietà.</p>
                </div>
            </div>

            <!-- Pannello elementi -->
            <div id="wpb-elements-panel">
                <h3>Elementi</h3>
                <div id="wpb-elements-list"></div>
            </div>

            <!-- Preview shortcode -->
            <div id="wpb-shortcode-preview" style="display:none;">
                <code id="wpb-shortcode-output"></code>
            </div>

            <!-- Hidden input per salvare JSON -->
            <input type="hidden" id="wpb-layout-data" name="wpb_layout_data" value="<?php echo $layout_json; ?>">
        </div>
        <?php
    }

    public function save_meta( $post_id ) {
        if ( ! isset( $_POST['wpb_nonce'] ) ) return;
        if ( ! wp_verify_nonce( $_POST['wpb_nonce'], 'wpb_save_layout' ) ) return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;

        if ( isset( $_POST['wpb_layout_data'] ) ) {
            $layout = wp_kses_post( stripslashes( $_POST['wpb_layout_data'] ) );
            update_post_meta( $post_id, '_wpb_layout', $layout );
        }
    }
}
