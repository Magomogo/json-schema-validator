#!/usr/bin/env node

(function () {
    'use strict';

    if (process.argv.length !== 3) {
        process.stdout.write('\n\
This script validates JSON from stdin, using schema parameter\n\
Usage:\n\
> cat data.json | json-validate www.hostname/json-schema.json#/definitions/type\n\
\n\
');
        process.exit(1);
    }

    var request = require('request'),
        async = require('async'),
        Validator = require('../src/validator.js'),
        typeId = process.argv[2],

        readStdin = function (callback) {
            var data = '';

            process.stdin.on('data', function (chunk) {
                data += chunk;
            });

            process.stdin.on('end', function () {
                callback(null, JSON.parse(data));
            });
        };

    async.parallel({
        validator: function (callback) { Validator.simple(typeId, callback); },
        json: readStdin
    }, function (err, results) {

        if (err) {
            console.log('ERROR:', err);
        }

        var result = results.validator.validate(results.json, typeId);

        if (!result) {
            console.log('FAILED.');
            process.exit(1);
        } else if(result.valid) {
            console.log('VALID.');
            process.exit(0);
        }

        console.log('RESULT:', [
            result.error.message,
            'at',
            '"' + result.error.dataPath + '"',
            'defined at',
            '"' + result.error.schemaPath + '"'
        ].join(' '));

        process.exit(1);

    });
}());
