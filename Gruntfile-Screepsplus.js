module.exports = function(grunt) {

    let config = require('./.screepsplussecrets.json');
    let branch = grunt.option('branch') || config.branch;
    let email = grunt.option('email') || config.email;
    let password = grunt.option('password') || config.password;

    // this uses github:cavejay/grunt-screeps since the official version doesn't support auth token... yet
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-rsync');

    grunt.initConfig({
        screeps: {
            options: {
                server: {
                    host: 'server1.screepspl.us',
                    port: 21025,
                    http: true,
                },
                email: email,
                password: password,
                branch: branch,
                ptr: false
            },
            dist: {
                src: ['dist/*.js']
            }
        },

        // Remove all files from the dist folder.
        clean: {
            'dist': ['dist']
        },

        // Copy all source files into the dist folder, flattening the folder structure by converting path delimiters to underscores
        copy: {
            // Pushes the game code to the dist folder so it can be modified before being send to the screeps server.
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        // Change the path name utilize dots for folders
                        return dest + src.replace(/\//g, '.');
                    }
                }],
            }
        },
    });

    grunt.registerTask('default',  ['clean', 'copy:screeps', 'screeps']);
};