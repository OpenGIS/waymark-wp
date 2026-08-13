<?php

class Waymark_Submission {

	private $allowed;
	private $all_features = ['draw', 'photo', 'file', 'title', 'meta'];

	private $data;
	private $Map;

	private $user;
	private $user_type; // admin / user / guest
	private $status;
	private $alert;
	private $features = [];

	private $redirect_data;
	private $redirect_url;

	public function __construct($data = []) {
		$this->data = $data;

		//Default
		$this->allowed = false;

		//Enabled?
		if (Waymark_Config::get_setting('submission', 'global', 'submission_enable')) {
			// ======= Check User ========

			$this->user = wp_get_current_user();

			//Signed-in user
			if (sizeof($this->user->roles)) {
				//Admin
				if (in_array('administrator', $this->user->roles)) {
					$this->user_type = 'admin';
					$this->allowed = true;

					$this->status = 'publish';

					//Admin get all features
					$this->features = $this->all_features;
					//Current user can
				} elseif ($this->user_can_submit()) {
					$this->user_type = 'user';
					$this->allowed = true;

					$this->status = Waymark_Config::get_setting('submission', 'from_users', 'submission_status');
					$this->alert = Waymark_Config::get_setting('submission', 'from_users', 'submission_alert');

					$this->features = Waymark_Config::get_setting('submission', 'from_users', 'submission_features');
					//Treat as public?
				} elseif (Waymark_Config::get_setting('submission', 'from_public', 'submission_public')) {
					$this->user_type = 'guest';
					$this->allowed = true;

					$this->status = Waymark_Config::get_setting('submission', 'from_public', 'submission_status');
					$this->alert = Waymark_Config::get_setting('submission', 'from_public', 'submission_alert');

					$this->features = Waymark_Config::get_setting('submission', 'from_public', 'submission_features');
					//Curent user can not
				} else {
					$this->allowed = false;
				}
				//Guest
			} else {
				//Public submissions allowed
				if (Waymark_Config::get_setting('submission', 'from_public', 'submission_public')) {
					$this->user_type = 'guest';
					$this->allowed = true;

					$this->status = Waymark_Config::get_setting('submission', 'from_public', 'submission_status');
					$this->alert = Waymark_Config::get_setting('submission', 'from_public', 'submission_alert');

					$this->features = Waymark_Config::get_setting('submission', 'from_public', 'submission_features');
					//NO Public submissions!
				} else {
					$this->allowed = false;
				}
			}

			// ======= Set redirect =======

			//Valid URL provided
			if (array_key_exists('waymark_redirect', $this->data)) {
				$this->redirect_url = wp_validate_redirect($this->data['waymark_redirect']);
				//Default to home
			} else {
				$this->redirect_url = get_option('home');
			}

		}

		//Load
		if ($this->allowed) {
			Waymark_Helper::inc('Admin/Waymark_AJAX.php');
		}
	}

	public function get_allowed() {
		return $this->allowed;
	}

	public function get_status() {
		return $this->status;
	}

	public function get_alert() {
		return $this->alert;
	}

	public function get_features() {
		return $this->features;
	}

	private function user_can_submit() {
		//Guest
		if (! sizeof($this->user->roles)) {
			return false;
		}

		//Admin
		if (in_array('administrator', $this->user->roles)) {
			return true;
		}

		//Other user
		$submission_roles = Waymark_Config::get_setting('submission', 'from_users', 'submission_roles');
		//Current role can
		if (is_array($submission_roles) && sizeof(array_intersect($this->user->roles, $submission_roles))) {
			return true;
		}

		return false;
	}

	public function render_front($data = []) {
		//Load CSS/Scripts for rich text editor
		wp_enqueue_editor();

		$content = '<!-- START Waymark Submission -->' . "\n";
		$content .= '<div id="waymark-submission">' . "\n";

		//Ensure Submissions allowed
		if (! $this->allowed) {
			$content .= '</div>' . "\n";
			$content .= '<!-- END Waymark Submission -->' . "\n";

			return $content;
		}

		global $post;

		$get_data = wp_unslash($_GET);

		// Check nonce
		if (array_key_exists(Waymark_Config::get_item('nonce_string'), $get_data) && wp_verify_nonce($get_data[Waymark_Config::get_item('nonce_string')], 'public_add_map')) {
			//Messages
			if (array_key_exists('waymark_status', $get_data)) {
				switch (esc_attr($get_data['waymark_status'])) {
				case 'error':
					$content .= '<div class="waymark-message waymark-error">';

					//Custom message?
					if (isset($get_data['waymark_message'])) {
						$content .= esc_html($get_data['waymark_message']);
					} else {
						$content .= __('There was an error with your submission.', 'waymark');
					}

					$content .= '</div>' . "\n";

					break;
				case 'draft':
					$content .= '	<div class="waymark-message waymark-success">';
					$content .= __('Your submission has been received and is awaiting moderation.', 'waymark');
					$content .= '	</div>' . "\n";

					break;
				case 'publish':
					$content .= '	<div class="waymark-message waymark-success">';

					//Custom message?
					if (isset($get_data['waymark_map_id'])) {
						// translators: %s: link to the published map
						$content .= sprintf(__('Your submission has been <a href="%s">published</a>.', 'waymark'), esc_url(get_permalink((int) $get_data['waymark_map_id'])));
					} else {
						$content .= __('Your submission has been published.', 'waymark');
					}

					$content .= '	</div>' . "\n";

					break;
				}
			}

		}

		// Submission Map Div
		$content .= '	<div id="waymark-map" class="waymark-submission waymark-map"></div>' . "\n";

		// Add Editor
		Waymark_JS::add_editor();

		//Disable certain features?
		$disable_features = array_diff($this->all_features, $this->features);
		foreach ($disable_features as $disable) {
			Waymark_JS::add_call("
				waymark_editor.jq_map_container.addClass('waymark-disable-$disable');
			");
		}

		// Submission Form
		$content .= '	<form action="' . esc_url(Waymark_Helper::http_url()) . '" method="post" id="waymark-map-add" class="waymark-map-add">' . "\n";
		$content .= '		<input type="hidden" name="waymark_action" value="public_add_map" />' . "\n";
		$content .= '		<input type="hidden" name="waymark_security" value="' . wp_create_nonce(Waymark_Config::get_item('nonce_string')) . '" />' . "\n";
		$content .= '		<input type="hidden" name="waymark_redirect" value="' . esc_attr(esc_url(get_permalink($post))) . '" />' . "\n";

		//Title
		if (in_array('title', $this->features)) {
			$content .= '		<div class="waymark-control-group waymark-control-type-text" id="map_title-container">' . "\n";
			$content .= '			<label class="waymark-control-label" for="map_title">' . __('Title', 'waymark') . '</label>' . "\n";
			$content .= '			<div class="waymark-controls">' . "\n";
			$content .= '				<input class="waymark-input" type="text" name="map_title" id="map_title" value="">' . "\n";
			$content .= '			</div>' . "\n";
			$content .= '		</div>' . "\n";
		}

		//Create Form
		$Map = new Waymark_Map;
		$content .= wp_kses($Map->create_form(), Waymark_Helper::allowable_tags('parameter'));

		$content .= '		<input type="submit" value="' . __('Submit', 'waymark') . '" class="button button-primary button-large" />' . "\n";

		$content .= '	</form>' . "\n";

		$content .= '</div>' . "\n";
		$content .= '<!-- END Waymark Submission -->' . "\n";

		return $content;
	}

	public function create_map() {
		//Ensure Submissions allowed
		if (! $this->allowed) {
			return false;
		}

		//Data checks
		if (! array_key_exists('map_data', $this->data) || ! $this->data['map_data']) {
			$this->status = 'error';
			$this->redirect_data['waymark_message'] = __('Your Map was empty.', 'waymark');

			return false;
		}

		//Ensure the data passed is valid JSON
		$raw_map_data = stripslashes($this->data['map_data']);
		if (! Waymark_GeoJSON::get_feature_count($raw_map_data)) {
			$this->status = 'error';
			$this->redirect_data['waymark_message'] = __('Your Map did not contain valid features.', 'waymark');

			return false;
		}

		//If no Title provided
		if (! array_key_exists('map_title', $this->data) || ! $this->data['map_title']) {
			$this->data['map_title'] = esc_html__('Submission', 'waymark') . ' ' . substr(md5(wp_rand(0, 999999)), 0, 5);
		}

		//Create Map
		$this->Map = new Waymark_Map;
		$this->Map->set_data($this->data);

		$this->Map->create_post($this->data['map_title'], [
			'post_status' => $this->status,
		]);

		//Add to collection?
		$submission_collection = false;
		switch ($this->user_type) {
		case 'guest':
			$submission_collection = Waymark_Config::get_setting('submission', 'from_public', 'submission_collection');

			break;
		default:
			$submission_collection = Waymark_Config::get_setting('submission', 'from_users', 'submission_collection');

			break;
		}
		if ($submission_collection) {
			//Link Map to Collection
			wp_set_object_terms($this->Map->post_id, (int) $submission_collection, 'waymark_collection');
		}

		$this->redirect_data['waymark_map_id'] = $this->Map->post_id;

		//Redirect to newly created Map?
		if ($this->status == 'publish') {
			$this->redirect_url = get_permalink($this->Map->post_id);
		}

		return $this->Map->post_id;
	}

	public function do_redirect() {
		$this->redirect_data['waymark_status'] = $this->status;

		//No valid redirect URL? Do not redirect.
		if (! $this->redirect_url) {
			return;
		}

		if (sizeof($this->redirect_data)) {
			//Append query string
			$this->redirect_url .= (strpos($this->redirect_url, '?') === false) ? '?' : '&';

			$this->redirect_url .= http_build_query($this->redirect_data);

			// Nonce URL
			$this->redirect_url = wp_nonce_url($this->redirect_url, 'public_add_map', Waymark_Config::get_item('nonce_string'));
			$this->redirect_url = html_entity_decode($this->redirect_url);

			$this->redirect_url .= '#waymark-submission';
		}

		wp_redirect($this->redirect_url);
	}
}
