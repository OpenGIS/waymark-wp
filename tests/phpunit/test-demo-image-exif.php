<?php
/**
 * Demo image EXIF metadata tests.
 *
 * @package Waymark
 */

/**
 * Verifies that the checked-in demo images carry the metadata declared in
 * tests/fixtures/demo/image-metadata.json, which the demo seeder reads.
 */
class Test_Demo_Image_Exif extends WP_UnitTestCase {

	/**
	 * Parsed manifest entries.
	 *
	 * @var array
	 */
	private $manifest = [];

	/**
	 * Load the manifest before each test.
	 */
	public function set_up() {
		parent::set_up();

		$manifest_path = dirname( __DIR__ ) . '/fixtures/demo/image-metadata.json';

		$this->assertFileExists( $manifest_path );

		$manifest = json_decode( (string) file_get_contents( $manifest_path ), true );

		$this->assertIsArray( $manifest );
		$this->assertNotEmpty( $manifest );

		$this->manifest = $manifest;
	}

	/**
	 * Build the absolute path to a demo image.
	 *
	 * @param string $file Image file name.
	 * @return string
	 */
	private function image_path( $file ) {
		return dirname( __DIR__ ) . '/fixtures/demo/images/' . $file;
	}

	/**
	 * Convert an EXIF rational value such as "18/1" to a float.
	 *
	 * @param string $value Raw rational value.
	 * @return float
	 */
	private function rational_to_float( $value ) {
		$parts = explode( '/', (string) $value );

		if ( 2 === count( $parts ) && is_numeric( $parts[0] ) && is_numeric( $parts[1] ) ) {
			$denominator = (float) $parts[1];

			if ( 0.0 !== $denominator ) {
				return (float) $parts[0] / $denominator;
			}
		}

		return is_numeric( $value ) ? (float) $value : NAN;
	}

	/**
	 * The manifest lists nine images with unique keys and files.
	 */
	public function test_manifest_lists_nine_unique_images() {
		$this->assertCount( 9, $this->manifest );

		$keys  = array_column( $this->manifest, 'key' );
		$files = array_column( $this->manifest, 'file' );

		$this->assertCount( 9, array_unique( $keys ) );
		$this->assertCount( 9, array_unique( $files ) );
	}

	/**
	 * Every manifest image exists and is readable.
	 */
	public function test_manifest_images_exist_and_are_readable() {
		foreach ( $this->manifest as $image ) {
			$path = $this->image_path( $image['file'] );

			$this->assertFileExists( $path );
			$this->assertFileIsReadable( $path );
		}
	}

	/**
	 * Every image carries the camera, date and orientation metadata.
	 */
	public function test_images_have_expected_exif_metadata() {
		foreach ( $this->manifest as $image ) {
			$path = $this->image_path( $image['file'] );
			$exif = exif_read_data( $path );

			$this->assertIsArray( $exif, $image['file'] );
			$this->assertSame( $image['camera_make'], $exif['Make'], $image['file'] );
			$this->assertSame( $image['camera_model'], $exif['Model'], $image['file'] );
			$this->assertSame( $image['taken_at'], $exif['DateTimeOriginal'], $image['file'] );
			$this->assertSame( $image['taken_at'], $exif['DateTimeDigitized'], $image['file'] );
			$this->assertSame( 1, (int) $exif['Orientation'], $image['file'] );
		}
	}

	/**
	 * Every image's GPS coordinates match the manifest.
	 */
	public function test_images_have_expected_gps_metadata() {
		foreach ( $this->manifest as $image ) {
			$path = $this->image_path( $image['file'] );
			$exif = exif_read_data( $path );

			$this->assertIsArray( $exif, $image['file'] );

			$expected_lat_ref = $image['latitude'] < 0 ? 'S' : 'N';
			$expected_lon_ref = $image['longitude'] < 0 ? 'W' : 'E';

			$this->assertSame( $expected_lat_ref, $exif['GPSLatitudeRef'], $image['file'] );
			$this->assertSame( $expected_lon_ref, $exif['GPSLongitudeRef'], $image['file'] );

			$latitude  = Waymark_Helper::exif_gps_to_gps_float( $exif['GPSLatitude'], $exif['GPSLatitudeRef'] );
			$longitude = Waymark_Helper::exif_gps_to_gps_float( $exif['GPSLongitude'], $exif['GPSLongitudeRef'] );

			$this->assertEqualsWithDelta( (float) $image['latitude'], $latitude, 1e-5, $image['file'] );
			$this->assertEqualsWithDelta( (float) $image['longitude'], $longitude, 1e-5, $image['file'] );

			$this->assertArrayHasKey( 'GPSAltitude', $exif, $image['file'] );
			$this->assertEqualsWithDelta(
				(float) $image['altitude'],
				$this->rational_to_float( $exif['GPSAltitude'] ),
				1e-5,
				$image['file']
			);
		}
	}
}
