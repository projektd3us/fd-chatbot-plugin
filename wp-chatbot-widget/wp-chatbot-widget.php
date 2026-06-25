<?php
/**
 * Plugin Name: Chatbot Widget
 * Plugin URI: 
 * Description: Generic floating chatbot window (minimizable, bubble when minimized). All URLs, name, and appearance are configured in Settings → Chatbot Widget.
 * Version: 1.0.0
 * Author:
 * Author URI:
 * License: GPL v2 or later
 * Text Domain: wp-chatbot-widget
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WP_CHATBOT_WIDGET_VERSION', '1.0.0' );
define( 'WP_CHATBOT_WIDGET_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP_CHATBOT_WIDGET_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once WP_CHATBOT_WIDGET_PLUGIN_DIR . 'includes/class-settings.php';

add_action( 'admin_menu', 'wp_chatbot_widget_add_settings_page' );
add_action( 'admin_init', array( 'WP_Chatbot_Widget_Settings', 'register' ) );
add_action( 'wp_enqueue_scripts', 'wp_chatbot_widget_enqueue_frontend' );
add_action( 'wp_footer', 'wp_chatbot_widget_render_container', 5 );

function wp_chatbot_widget_add_settings_page() {
	add_options_page(
		__( 'Chatbot Widget', 'wp-chatbot-widget' ),
		__( 'Chatbot Widget', 'wp-chatbot-widget' ),
		'manage_options',
		'wp-chatbot-widget',
		'wp_chatbot_widget_render_settings_page'
	);
}

function wp_chatbot_widget_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	require_once WP_CHATBOT_WIDGET_PLUGIN_DIR . 'admin/settings-page.php';
}

function wp_chatbot_widget_enqueue_frontend() {
	$settings = WP_Chatbot_Widget_Settings::get_settings();
	if ( empty( $settings['chat_api_url'] ) ) {
		return;
	}

	wp_enqueue_style(
		'wp-chatbot-widget',
		WP_CHATBOT_WIDGET_PLUGIN_URL . 'assets/css/chatbot-widget.css',
		array(),
		WP_CHATBOT_WIDGET_VERSION
	);
	wp_enqueue_style(
		'font-awesome',
		'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
		array(),
		'6.0.0'
	);

	wp_enqueue_script(
		'wp-chatbot-widget-core',
		WP_CHATBOT_WIDGET_PLUGIN_URL . 'assets/js/chatbot-core.js',
		array(),
		WP_CHATBOT_WIDGET_VERSION,
		true
	);
	wp_enqueue_script(
		'wp-chatbot-widget',
		WP_CHATBOT_WIDGET_PLUGIN_URL . 'assets/js/chatbot-widget.js',
		array( 'wp-chatbot-widget-core' ),
		WP_CHATBOT_WIDGET_VERSION,
		true
	);

	$config = WP_Chatbot_Widget_Settings::get_frontend_config();
	wp_localize_script( 'wp-chatbot-widget', 'wpChatbotWidgetConfig', $config );
}

function wp_chatbot_widget_render_container() {
	$settings = WP_Chatbot_Widget_Settings::get_settings();
	if ( empty( $settings['chat_api_url'] ) ) {
		return;
	}

	$vars = WP_Chatbot_Widget_Settings::get_css_variables();
	echo '<div id="wp-chatbot-widget-root" data-css-vars="' . esc_attr( $vars ) . '"></div>';
}
