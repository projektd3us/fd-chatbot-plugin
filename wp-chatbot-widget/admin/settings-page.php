<?php
/**
 * Admin settings page for Chatbot Widget.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$opt = WP_Chatbot_Widget_Settings::OPTION_KEY;
$s   = WP_Chatbot_Widget_Settings::get_settings();
$preview_url = home_url( '/' );
?>

<div class="wrap wp-chatbot-widget-settings">
	<h1><?php esc_html_e( 'Chatbot Widget Settings', 'wp-chatbot-widget' ); ?></h1>

	<?php if ( isset( $_GET['settings-updated'] ) ) : ?>
		<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Settings saved.', 'wp-chatbot-widget' ); ?></p></div>
	<?php endif; ?>

	<form method="post" action="options.php" id="wp-chatbot-widget-form">
		<?php settings_fields( 'wp_chatbot_widget' ); ?>

		<p class="description" style="margin-bottom: 1em;">
			<?php esc_html_e( 'Configure the floating chatbot. Leave Chat API URL empty to disable the widget. No URLs or names are hardcoded—all values are set here.', 'wp-chatbot-widget' ); ?>
		</p>
		<p>
			<a href="<?php echo esc_url( $preview_url ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Preview on front end', 'wp-chatbot-widget' ); ?></a>
		</p>

		<h2 class="title"><?php esc_html_e( 'General', 'wp-chatbot-widget' ); ?></h2>
		<table class="form-table">
			<tr>
				<th scope="row"><label for="chatbot_name"><?php esc_html_e( 'Chatbot name', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="text" name="<?php echo esc_attr( $opt ); ?>[chatbot_name]" id="chatbot_name" value="<?php echo esc_attr( $s['chatbot_name'] ); ?>" class="regular-text" placeholder="<?php esc_attr_e( 'e.g. Support Assistant', 'wp-chatbot-widget' ); ?>" /></td>
			</tr>
			<tr>
				<th scope="row"><label for="welcome_message"><?php esc_html_e( 'Welcome message', 'wp-chatbot-widget' ); ?></label></th>
				<td><textarea name="<?php echo esc_attr( $opt ); ?>[welcome_message]" id="welcome_message" rows="3" class="large-text"><?php echo esc_textarea( $s['welcome_message'] ); ?></textarea>
				<p class="description"><?php esc_html_e( 'First message shown in the chat.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
			<tr>
				<th scope="row"><label for="input_placeholder"><?php esc_html_e( 'Input placeholder', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="text" name="<?php echo esc_attr( $opt ); ?>[input_placeholder]" id="input_placeholder" value="<?php echo esc_attr( $s['input_placeholder'] ); ?>" class="regular-text" /></td>
			</tr>
			<tr>
				<th scope="row"><label for="max_message_length"><?php esc_html_e( 'Max message length', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="number" name="<?php echo esc_attr( $opt ); ?>[max_message_length]" id="max_message_length" value="<?php echo esc_attr( $s['max_message_length'] ); ?>" min="100" max="2000" step="1" /> (100–2000)</td>
			</tr>
			<tr>
				<th scope="row"><label for="footer_text"><?php esc_html_e( 'Footer text', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="text" name="<?php echo esc_attr( $opt ); ?>[footer_text]" id="footer_text" value="<?php echo esc_attr( $s['footer_text'] ); ?>" class="regular-text" placeholder="<?php esc_attr_e( 'e.g. Created by My Company', 'wp-chatbot-widget' ); ?>" />
				<p class="description"><?php esc_html_e( 'Leave empty to hide.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
		</table>

		<h2 class="title"><?php esc_html_e( 'API', 'wp-chatbot-widget' ); ?></h2>
		<table class="form-table">
			<tr>
				<th scope="row"><label for="chat_api_url"><?php esc_html_e( 'Chat API URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[chat_api_url]" id="chat_api_url" value="<?php echo esc_attr( $s['chat_api_url'] ); ?>" class="large-text" placeholder="https://example.com/chat" />
				<p class="description"><?php esc_html_e( 'Required. POST endpoint for chat (body: message, redis_session_id?).', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
			<tr>
				<th scope="row"><label for="fallback_chat_api_url"><?php esc_html_e( 'Fallback Chat API URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[fallback_chat_api_url]" id="fallback_chat_api_url" value="<?php echo esc_attr( $s['fallback_chat_api_url'] ); ?>" class="large-text" />
				<p class="description"><?php esc_html_e( 'Optional. Used if main request fails.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
			<tr>
				<th scope="row"><label for="proxy_url"><?php esc_html_e( 'Proxy URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[proxy_url]" id="proxy_url" value="<?php echo esc_attr( $s['proxy_url'] ); ?>" class="large-text" />
				<p class="description"><?php esc_html_e( 'Optional. Base URL for proxy (chat/ElevenLabs/feedback). If empty, direct APIs are used.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
			<tr>
				<th scope="row"><label for="health_check_url"><?php esc_html_e( 'Health check URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[health_check_url]" id="health_check_url" value="<?php echo esc_attr( $s['health_check_url'] ); ?>" class="large-text" />
				<p class="description"><?php esc_html_e( 'Optional. Shown in widget settings as API status.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
		</table>

		<h2 class="title"><?php esc_html_e( 'Appearance', 'wp-chatbot-widget' ); ?></h2>
		<table class="form-table">
			<tr>
				<th scope="row"><?php esc_html_e( 'Primary color', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[primary_color]" value="<?php echo esc_attr( $s['primary_color'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['primary_color'] ); ?>" class="wp-cb-color-hex" data-for="primary_color" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Primary hover', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[primary_hover]" value="<?php echo esc_attr( $s['primary_hover'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['primary_hover'] ); ?>" class="wp-cb-color-hex" data-for="primary_hover" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'User message background', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[bg_user_message]" value="<?php echo esc_attr( $s['bg_user_message'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['bg_user_message'] ); ?>" class="wp-cb-color-hex" data-for="bg_user_message" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Bot message background', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[bg_bot_message]" value="<?php echo esc_attr( $s['bg_bot_message'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['bg_bot_message'] ); ?>" class="wp-cb-color-hex" data-for="bg_bot_message" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Chat background', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[bg_chat]" value="<?php echo esc_attr( $s['bg_chat'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['bg_chat'] ); ?>" class="wp-cb-color-hex" data-for="bg_chat" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Text primary', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[text_primary]" value="<?php echo esc_attr( $s['text_primary'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['text_primary'] ); ?>" class="wp-cb-color-hex" data-for="text_primary" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Text secondary', 'wp-chatbot-widget' ); ?></th>
				<td><input type="color" name="<?php echo esc_attr( $opt ); ?>[text_secondary]" value="<?php echo esc_attr( $s['text_secondary'] ); ?>" /> <input type="text" value="<?php echo esc_attr( $s['text_secondary'] ); ?>" class="wp-cb-color-hex" data-for="text_secondary" size="8" /></td>
			</tr>
			<tr>
				<th scope="row"><?php esc_html_e( 'Secondary / Success / Danger / Warning', 'wp-chatbot-widget' ); ?></th>
				<td>
					<input type="color" name="<?php echo esc_attr( $opt ); ?>[secondary_color]" value="<?php echo esc_attr( $s['secondary_color'] ); ?>" title="Secondary" />
					<input type="color" name="<?php echo esc_attr( $opt ); ?>[success_color]" value="<?php echo esc_attr( $s['success_color'] ); ?>" title="Success" />
					<input type="color" name="<?php echo esc_attr( $opt ); ?>[danger_color]" value="<?php echo esc_attr( $s['danger_color'] ); ?>" title="Danger" />
					<input type="color" name="<?php echo esc_attr( $opt ); ?>[warning_color]" value="<?php echo esc_attr( $s['warning_color'] ); ?>" title="Warning" />
				</td>
			</tr>
		</table>

		<h2 class="title"><?php esc_html_e( 'Voice (ElevenLabs)', 'wp-chatbot-widget' ); ?></h2>
		<table class="form-table">
			<tr>
				<th scope="row"><?php esc_html_e( 'Use ElevenLabs', 'wp-chatbot-widget' ); ?></th>
				<td><label><input type="checkbox" name="<?php echo esc_attr( $opt ); ?>[elevenlabs_enabled]" value="1" <?php checked( ! empty( $s['elevenlabs_enabled'] ) ); ?> /> <?php esc_html_e( 'Enable ElevenLabs TTS', 'wp-chatbot-widget' ); ?></label></td>
			</tr>
			<tr>
				<th scope="row"><label for="elevenlabs_api_key"><?php esc_html_e( 'ElevenLabs API key', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="password" name="<?php echo esc_attr( $opt ); ?>[elevenlabs_api_key]" id="elevenlabs_api_key" value="<?php echo esc_attr( $s['elevenlabs_api_key'] ); ?>" class="regular-text" autocomplete="off" /></td>
			</tr>
			<tr>
				<th scope="row"><label for="elevenlabs_voice_id"><?php esc_html_e( 'ElevenLabs Voice ID', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="text" name="<?php echo esc_attr( $opt ); ?>[elevenlabs_voice_id]" id="elevenlabs_voice_id" value="<?php echo esc_attr( $s['elevenlabs_voice_id'] ); ?>" class="regular-text" />
				<p class="description"><?php esc_html_e( 'Optional. Default voice for TTS.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
		</table>

		<h2 class="title"><?php esc_html_e( 'Feedback', 'wp-chatbot-widget' ); ?></h2>
		<table class="form-table">
			<tr>
				<th scope="row"><label for="feedback_like_url"><?php esc_html_e( 'Feedback Like URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[feedback_like_url]" id="feedback_like_url" value="<?php echo esc_attr( $s['feedback_like_url'] ); ?>" class="large-text" />
				<p class="description"><?php esc_html_e( 'Optional. POST like payload. If empty, like/dislike buttons are hidden.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
			<tr>
				<th scope="row"><label for="feedback_dislike_url"><?php esc_html_e( 'Feedback Dislike URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[feedback_dislike_url]" id="feedback_dislike_url" value="<?php echo esc_attr( $s['feedback_dislike_url'] ); ?>" class="large-text" /></td>
			</tr>
		</table>

		<h2 class="title"><?php esc_html_e( 'Optional: Jobs', 'wp-chatbot-widget' ); ?></h2>
		<table class="form-table">
			<tr>
				<th scope="row"><label for="jobs_api_url"><?php esc_html_e( 'Jobs API URL', 'wp-chatbot-widget' ); ?></label></th>
				<td><input type="url" name="<?php echo esc_attr( $opt ); ?>[jobs_api_url]" id="jobs_api_url" value="<?php echo esc_attr( $s['jobs_api_url'] ); ?>" class="large-text" />
				<p class="description"><?php esc_html_e( 'If set and backend returns job_filters, job sidebar is enabled and filters are POSTed here.', 'wp-chatbot-widget' ); ?></p></td>
			</tr>
		</table>

		<p class="submit">
			<?php submit_button( __( 'Save Settings', 'wp-chatbot-widget' ), 'primary', 'submit', false ); ?>
		</p>
	</form>
</div>

<script>
(function() {
	document.querySelectorAll('.wp-cb-color-hex').forEach(function(txt) {
		var colorInput = document.querySelector('input[name="<?php echo esc_js( $opt ); ?>[' + txt.getAttribute('data-for') + ']"]');
		if (!colorInput) return;
		txt.addEventListener('input', function() {
			var v = this.value.replace(/[^#a-fA-F0-9]/g, '');
			if (v.charAt(0) !== '#') v = '#' + v;
			if (/^#[0-9A-Fa-f]{6}$/.test(v)) colorInput.value = v;
		});
		colorInput.addEventListener('input', function() { txt.value = this.value; });
	});
})();
</script>
