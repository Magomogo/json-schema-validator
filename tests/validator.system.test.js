(function () {
    'use strict';

    var assert = require('assert'),
        Validator = require('../src/validator.js') ;

    describe('validator in the wild', function () {
        this.timeout(16000);

        it('fails fast if the schema uri is not a string', function (done) {

            Validator.simple(
                null,

                function (error) {
                    assert(error && error.message && error.message.match(/must be a string/i));
                    done();
                }
            );
        });

        it('loads all referenced remote schemas', function (done) {

            Validator.simple(
                'http://json-schema.org/example/address.json',

                function (error) {
                    assert.ifError(error);
                    done();
                }
            );
        });

        it('loads all referenced local schemas', function (done) {

            Validator.simple(
                ['./tests/data/ota-schema.json', 'file://./tests/data/swiss-hotels-schema.json'],

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

        it('does actual validation with a local schema', function (done) {
            Validator.simple('./tests/data/geo-schema.json', function (error, v) {
                assert.ifError(error);

                assert(v.validate(
                    {latitude: 53.0, longitude: 43.0}
                ).valid);

                done();
            });
        });
    });
}());
