module.exports = function (grunt) {
	grunt.initConfig({
		less: {
			wp_css: {
				files: {
					"assets/css/shared.css": "assets/less/shared.less",
					"assets/css/front.css": "assets/less/front.less",
					"assets/css/admin.css": "assets/less/admin.less",
				},
			},
		},

		concat: {
			wp_css: {
				files: {
					"assets/css/front.css": [
						"assets/css/shared.css",
						"assets/css/front.css",
					],
					"assets/css/admin.css": [
						"assets/css/shared.css",
						"assets/css/admin.css",
					],
				},
			},
			wp_js: {
				files: {
					"assets/js/front.min.js": [
						"assets/js/shared.js",
						"assets/js/front.js",
					],
					"assets/js/admin.min.js": [
						"assets/js/shared.js",
						"assets/js/admin.js",
					],
				},
			},
		},

		terser: {
			wp_js: {
				files: {
					"assets/js/front.min.js": ["assets/js/front.min.js"],
					"assets/js/admin.min.js": ["assets/js/admin.min.js"],
				},
			},
		},

		cssmin: {
			wp_css: {
				files: {
					"assets/css/front.min.css": "assets/css/front.css",
					"assets/css/admin.min.css": "assets/css/admin.css",
				},
			},
		},

		watch: {
			wp_css: {
				files: ["assets/less/*.less"],
				tasks: ["build_wp_css"],
			},
			wp_js: {
				files: ["assets/js/*.js", "!assets/js/*.min.js"],
				tasks: ["build_wp_js"],
			},
			wp_readme: {
				files: ["readme.txt"],
				tasks: ["build_wp_md"],
			},
		},

		wp_readme_to_markdown: {
			build_wp_md: {
				files: {
					"readme.md": "readme.txt",
				},
				options: {
					screenshot_url: "https://ps.w.org/{plugin}/assets/{screenshot}.jpg",
				},
			},
		},

		makepot: {
			target: {
				options: {
					domainPath: "languages/",
					include: ["inc/.*"],
					mainFile: "Waymark.php",
					type: "wp-plugin",
					updateTimestamp: false,
				},
			},
		},
	});

	grunt.loadNpmTasks("grunt-terser");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-wp-readme-to-markdown");
	grunt.loadNpmTasks("grunt-wp-i18n");

	grunt.registerTask("default", [
		"less",
		"concat",
		"terser",
		"cssmin",
		"makepot",
		"wp_readme_to_markdown",
		"watch",
	]);

	grunt.registerTask("build_wp_css", [
		"less:wp_css",
		"concat:wp_css",
		"cssmin:wp_css",
	]);

	grunt.registerTask("build_wp_js", ["concat:wp_js", "terser:wp_js"]);

	grunt.registerTask("build_wp_md", ["wp_readme_to_markdown:build_wp_md"]);

	grunt.registerTask("build", [
		"build_wp_css",
		"build_wp_js",
		"makepot",
		"build_wp_md",
	]);

	grunt.registerTask(
		"sync_version",
		"Sync readme.txt and package.json versions from Waymark.php",
		function () {
			var versionSource = "Waymark.php";
			var versionMatch = grunt.file
				.read(versionSource)
				.match(/^Version:\s*(.+)$/m);

			if (!versionMatch) {
				grunt.fail.fatal("Could not find a Version header in " + versionSource);
				return;
			}

			var version = versionMatch[1].trim();

			// readme.txt
			var readmePath = "readme.txt";
			var readme = grunt.file.read(readmePath);
			var readmeMatch = readme.match(/^Stable tag:\s*(.+)$/m);

			if (!readmeMatch) {
				grunt.fail.fatal("Could not find a Stable tag line in " + readmePath);
				return;
			}

			if (readmeMatch[1].trim() === version) {
				grunt.log.writeln(readmePath + ": already up to date");
			} else {
				var readmeUpdated = readme.replace(
					readmeMatch[0],
					readmeMatch[0].replace(readmeMatch[1], version),
				);
				grunt.file.write(readmePath, readmeUpdated);
				grunt.log.writeln(
					readmePath +
						": Stable tag " +
						readmeMatch[1].trim() +
						" -> " +
						version,
				);
			}

			// package.json
			var packagePath = "package.json";
			var packageContents = grunt.file.read(packagePath);
			var packageMatch = packageContents.match(/"version":\s*"([^"]+)"/);

			if (!packageMatch) {
				grunt.fail.fatal("Could not find a version field in " + packagePath);
				return;
			}

			if (packageMatch[1] === version) {
				grunt.log.writeln(packagePath + ": already up to date");
			} else {
				var packageUpdated = packageContents.replace(
					packageMatch[0],
					packageMatch[0].replace(packageMatch[1], version),
				);
				grunt.file.write(packagePath, packageUpdated);
				grunt.log.writeln(
					packagePath + ": version " + packageMatch[1] + " -> " + version,
				);
			}
		},
	);
};
