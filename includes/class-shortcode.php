<?php
namespace WPBlock;

if ( ! defined( 'ABSPATH' ) ) exit;

class Shortcode {

    public function init() {
        add_shortcode( 'wp_block_layout', [ $this, 'render' ] );
        add_filter( 'the_content',        [ $this, 'auto_render' ] );
    }

    /**
     * Shortcode manuale: [wp_block_layout id="123"]
     */
    public function render( $atts ) {
        $atts = shortcode_atts( [ 'id' => 0 ], $atts );
        $post_id = intval( $atts['id'] );
        if ( ! $post_id ) return '';
        return $this->render_layout( $post_id );
    }

    /**
     * Auto-render: se il post ha un layout WPBlock, sostituisce il contenuto
     */
    public function auto_render( $content ) {
        if ( ! is_singular() ) return $content;
        $post_id = get_the_ID();
        $layout  = get_post_meta( $post_id, '_wpb_layout', true );
        if ( empty( $layout ) ) return $content;
        return $this->render_layout( $post_id );
    }

    private function render_layout( $post_id ) {
        $json = get_post_meta( $post_id, '_wpb_layout', true );
        if ( empty( $json ) ) return '';

        $layout = json_decode( stripslashes( $json ), true );
        if ( ! is_array( $layout ) ) return '';

        ob_start();
        echo '<div class="wpb-layout">';
        foreach ( $layout as $row ) {
            $this->render_row( $row );
        }
        echo '</div>';
        return ob_get_clean();
    }

    private function render_row( $row ) {
        $cols = isset( $row['columns'] ) ? $row['columns'] : 1;
        echo '<div class="wpb-row wpb-cols-' . intval( $cols ) . '">';
        if ( ! empty( $row['columns_data'] ) ) {
            foreach ( $row['columns_data'] as $column ) {
                echo '<div class="wpb-column">';
                if ( ! empty( $column['elements'] ) ) {
                    foreach ( $column['elements'] as $element ) {
                        $this->render_element( $element );
                    }
                }
                echo '</div>';
            }
        }
        echo '</div>';
    }

    private function render_element( $element ) {
        $type   = $element['type'] ?? '';
        $attrs  = $element['attrs'] ?? [];
        $def    = Elements::get( $type );

        if ( ! $def || empty( $def['template'] ) ) return;

        $template = $def['template'];
        if ( file_exists( $template ) ) {
            include $template;
        }
    }
}
