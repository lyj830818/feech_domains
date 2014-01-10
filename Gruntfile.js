module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    watch: {
      grunt: {
        files: ["Gruntfile.js", "package.json"],
        tasks: "default"
      },
      javascript: {
        files: ["src/*.js", "test/*.js"],
        tasks: "test"
      }
    },
    mochacli: {
	options: {
            reporter: 'list',
            ui: 'bdd' 
        },

        all: ["test/*.js"]
    },

    jshint: {
      all: [
        "Gruntfile.js",
        "src/*.js",
        "test/*.js"
      //  "src/**/*.js",
      //  "test/**/*.js"
      ],
      options: {
        jshintrc: "jshintrc" 
      }
    }
  });
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-mocha-cli");
  grunt.registerTask("test", ["jshint", "mochacli"]);
  grunt.registerTask("default", ["test"]);
};
