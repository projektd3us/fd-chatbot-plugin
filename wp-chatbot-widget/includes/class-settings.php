<?php
/**
 * Chatbot Widget settings: defaults, get, sanitize, frontend config, CSS variables.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_Chatbot_Widget_Settings {

	const OPTION_KEY = 'wp_chatbot_widget_settings';

	public static function get_defaults() {
		return array(
			'chat_api_url'           => '',
			'fallback_chat_api_url'  => '',
			'proxy_url'              => '',
			'chatbot_name'           => '',
			'welcome_message'         => '',
			'input_placeholder'      => '',
			'max_message_length'     => 500,
			'footer_text'            => '',
			'primary_color'           => '#f97316',
			'primary_hover'           => '#ea580c',
			'secondary_color'        => '#64748b',
			'success_color'           => '#10b981',
			'danger_color'           => '#ef4444',
			'warning_color'           => '#f59e0b',
			'bg_primary'              => '#ffffff',
			'bg_secondary'           => '#f8fafc',
			'bg_tertiary'             => '#f1f5f9',
			'bg_chat'                 => '#ffffff',
			'bg_user_message'        => '#f97316',
			'bg_bot_message'          => '#f1f5f9',
			'text_primary'            => '#1e293b',
			'text_secondary'         => '#64748b',
			'text_muted'              => '#94a3b8',
			'border_color'            => '#e2e8f0',
			'bg_primary_dark'         => '#0f172a',
			'bg_secondary_dark'       => '#1e293b',
			'bg_tertiary_dark'        => '#334155',
			'bg_chat_dark'            => '#1e293b',
			'bg_bot_message_dark'     => '#334155',
			'text_primary_dark'       => '#f8fafc',
			'text_secondary_dark'     => '#cbd5e1',
			'border_color_dark'       => '#334155',
			'elevenlabs_enabled'      => false,
			'elevenlabs_api_key'      => '',
			'elevenlabs_voice_id'     => '',
			'feedback_like_url'       => '',
			'feedback_dislike_url'    => '',
			'health_check_url'       => '',
			'jobs_api_url'            => '',
		);
	}

	public static function get_settings() {
		$saved = get_option( self::OPTION_KEY, array() );
		$defaults = self::get_defaults();
		return wp_parse_args( $saved, $defaults );
	}

	public static function register() {
		register_setting(
			'wp_chatbot_widget',
			self::OPTION_KEY,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => self::get_defaults(),
			)
		);
	}

	public static function sanitize( $input ) {
		if ( ! is_array( $input ) ) {
			return self::get_defaults();
		}
		$defaults = self::get_defaults();
		$out      = array();

		$url_keys = array(
			'chat_api_url', 'fallback_chat_api_url', 'proxy_url',
			'feedback_like_url', 'feedback_dislike_url', 'health_check_url', 'jobs_api_url',
		);
		foreach ( $url_keys as $key ) {
			$out[ $key ] = isset( $input[ $key ] ) ? esc_url_raw( trim( (string) $input[ $key ] ) ) : $defaults[ $key ];
		}

		$text_keys = array(
			'chatbot_name', 'welcome_message', 'input_placeholder', 'footer_text',
			'elevenlabs_api_key', 'elevenlabs_voice_id',
		);
		foreach ( $text_keys as $key ) {
			$out[ $key ] = isset( $input[ $key ] ) ? sanitize_text_field( $input[ $key ] ) : $defaults[ $key ];
		}

		$out['max_message_length'] = isset( $input['max_message_length'] )
			? max( 100, min( 2000, absint( $input['max_message_length'] ) ) )
			: $defaults['max_message_length'];

		$color_keys = array(
			'primary_color', 'primary_hover', 'secondary_color', 'success_color', 'danger_color', 'warning_color',
			'bg_primary', 'bg_secondary', 'bg_tertiary', 'bg_chat', 'bg_user_message', 'bg_bot_message',
			'text_primary', 'text_secondary', 'text_muted', 'border_color',
			'bg_primary_dark', 'bg_secondary_dark', 'bg_tertiary_dark', 'bg_chat_dark', 'bg_bot_message_dark',
			'text_primary_dark', 'text_secondary_dark', 'border_color_dark',
		);
		foreach ( $color_keys as $key ) {
			$val = isset( $input[ $key ] ) ? sanitize_hex_color( $input[ $key ] ) : $defaults[ $key ];
			$out[ $key ] = $val ? $val : $defaults[ $key ];
		}

		$out['elevenlabs_enabled'] = ! empty( $input['elevenlabs_enabled'] );

		return wp_parse_args( $out, $defaults );
	}

	public static function get_frontend_config() {
		$s = self::get_settings();
		return array(
			'chatApiUrl'          => $s['chat_api_url'],
			'fallbackChatApiUrl'  => $s['fallback_chat_api_url'],
			'proxyUrl'            => $s['proxy_url'],
			'chatbotName'         => $s['chatbot_name'],
			'welcomeMessage'      => $s['welcome_message'],
			'inputPlaceholder'    => $s['input_placeholder'] ? $s['input_placeholder'] : __( 'Type your message...', 'wp-chatbot-widget' ),
			'maxMessageLength'    => (int) $s['max_message_length'],
			'footerText'          => $s['footer_text'],
			'elevenlabsEnabled'   => (bool) $s['elevenlabs_enabled'],
			'elevenlabsApiKey'    => $s['elevenlabs_api_key'],
			'elevenlabsVoiceId'   => $s['elevenlabs_voice_id'],
			'feedbackLikeUrl'     => $s['feedback_like_url'],
			'feedbackDislikeUrl'  => $s['feedback_dislike_url'],
			'healthCheckUrl'      => $s['health_check_url'],
			'jobsApiUrl'          => $s['jobs_api_url'],
			'showFeedback'        => ! empty( $s['feedback_like_url'] ) || ! empty( $s['feedback_dislike_url'] ),
		);
	}

	public static function get_css_variables() {
		$s = self::get_settings();
		$vars = array(
			'--wp-cb-primary-color'       => $s['primary_color'],
			'--wp-cb-primary-hover'        => $s['primary_hover'],
			'--wp-cb-secondary-color'      => $s['secondary_color'],
			'--wp-cb-success-color'        => $s['success_color'],
			'--wp-cb-danger-color'         => $s['danger_color'],
			'--wp-cb-warning-color'        => $s['warning_color'],
			'--wp-cb-bg-primary'           => $s['bg_primary'],
			'--wp-cb-bg-secondary'          => $s['bg_secondary'],
			'--wp-cb-bg-tertiary'          => $s['bg_tertiary'],
			'--wp-cb-bg-chat'              => $s['bg_chat'],
			'--wp-cb-bg-user-message'      => $s['bg_user_message'],
			'--wp-cb-bg-bot-message'       => $s['bg_bot_message'],
			'--wp-cb-text-primary'         => $s['text_primary'],
			'--wp-cb-text-secondary'       => $s['text_secondary'],
			'--wp-cb-text-muted'           => $s['text_muted'],
			'--wp-cb-border-color'         => $s['border_color'],
			'--wp-cb-bg-primary-dark'      => $s['bg_primary_dark'],
			'--wp-cb-bg-secondary-dark'     => $s['bg_secondary_dark'],
			'--wp-cb-bg-tertiary-dark'      => $s['bg_tertiary_dark'],
			'--wp-cb-bg-chat-dark'          => $s['bg_chat_dark'],
			'--wp-cb-bg-bot-message-dark'   => $s['bg_bot_message_dark'],
			'--wp-cb-text-primary-dark'     => $s['text_primary_dark'],
			'--wp-cb-text-secondary-dark'   => $s['text_secondary_dark'],
			'--wp-cb-border-color-dark'     => $s['border_color_dark'],
		);
		$parts = array();
		foreach ( $vars as $name => $value ) {
			$parts[] = $name . ':' . $value;
		}
		return implode( ';', $parts );
	}
}
