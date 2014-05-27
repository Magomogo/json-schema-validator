(function () {
    'use strict';

    var assert = require('assert'),
        Validator = require('../src/validator.js') ;

    describe('validator in the wild', function () {
        it('loads all referenced remote schemas', function (done) {
            this.timeout(8000);

            Validator.simple(
                'https://www.swiss-hotels.com/availabilities-filtered/schema',

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
