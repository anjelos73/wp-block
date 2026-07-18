<?php
namespace WPBlock;

if ( ! defined( 'ABSPATH' ) ) exit;

class Elements {

    private static $elements = [];

    public function init() {
        // Registra gli elementi built-in
        add_action( 'init', [ $this, 'register_defaults' ] );
    }

    public function register_defaults() {
        self::register([
            'type'  => 'text',
            'label' => 'Testo',
            'icon'  => 'dashicons-editor-paragraph',
            'fields' => [
                [
                    'key'     => 'content',
                    'label'   => 'Contenuto',
                    'type'    => 'textarea',
                    'default' => 'Inserisci il tuo testo qui...',
                ],
                [
                    'key'     => 'font_size',
                    'label'   => 'Dimensione font (px)',
                    'type'    => 'number',
                    'default' => 16,
                ],
                [
                    'key'     => 'color',
                    'label'   => 'Colore testo',
                    'type'    => 'color',
                    'default' => '#333333',
                ],
                [
                    'key'     => 'align',
                    'label'   => 'Allineamento',
                    'type'    => 'select',
                    'options' => [ 'left' => 'Sinistra', 'center' => 'Centro', 'right' => 'Destra', 'justify' => 'Giustificato' ],
                    'default' => 'left',
                ],
                [
                    'key'     => 'css_class',
                    'label'   => 'Classe CSS',
                    'type'    => 'text',
                    'default' => '',
                ],
            ],
            'template' => WPB_DIR . 'templates/elements/text.php',
        ]);

        // Segnala al filtro che lista gli elementi per il JS
        add_filter( 'wpb_registered_elements', function() {
            return self::get_all();
        });
    }

    public static function register( array $element ) {
        if ( empty( $element['type'] ) ) return;
        self::$elements[ $element['type'] ] = $element;
    }

    public static function get( $type ) {
        return self::$elements[ $type ] ?? null;
    }

    public static function get_all() {
        return array_values( self::$elements );
    }
}
