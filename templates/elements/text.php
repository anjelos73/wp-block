<?php
/**
 * Template: Text Element
 * Variabili disponibili: $attrs (array), $element (array)
 */
if ( ! defined( 'ABSPATH' ) ) exit;

$content   = isset( $attrs['content'] )   ? $attrs['content']   : 'Testo...';
$font_size = isset( $attrs['font_size'] ) ? intval( $attrs['font_size'] ) : 16;
$color     = isset( $attrs['color'] )     ? sanitize_hex_color( $attrs['color'] ) : '#333333';
$align     = isset( $attrs['align'] )     ? sanitize_text_field( $attrs['align'] ) : 'left';
$css_class = isset( $attrs['css_class'] ) ? sanitize_html_class( $attrs['css_class'] ) : '';

$style = sprintf(
    'font-size:%dpx; color:%s; text-align:%s;',
    $font_size,
    esc_attr( $color ),
    esc_attr( $align )
);
?>
<div class="wpb-element wpb-element-text <?php echo esc_attr( $css_class ); ?>" style="<?php echo $style; ?>">
    <?php echo wp_kses_post( $content ); ?>
</div>
