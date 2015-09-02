(function () {
    'use strict';

    var assert = require('assert'),
        Validator = require('../src/validator.js') ;

    describe('validator in the wild', function () {
        this.timeout(16000);

        it('loads all referenced remote schemas', function (done) {

            Validator.simple(
                'https://www.swisshotels.com/availabilities-filtered/schema',

                function (error) {
                    assert.ifError(error);
                    done();
                }
            );
        });

        it('does actual validation', function (done) {
            Validator.simple('http://json-schema.org/geo', function (error, v) {
                assert.ifError(error);

                assert(v.validate(
                    {latitude: 53.0, longitude: 43.0},
                    'http://json-schema.org/geo'
                ).valid);

                done();
            });
        });
    });
}());
