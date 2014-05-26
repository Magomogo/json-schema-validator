(function () {
    'use strict';

    var request = require('request'),
        Validator = require('../src/validator.js'),
        assert = require('assert'),

        schemaLoader = function (url, callback) {

            console.log(url);

            request({
                url: url,
                strictSSL: false,
                json: true
            }, function (error, response, body) {
                if (error) {
                    callback(error);
                    return;
                }

                if (200 !== response.statusCode) {
                    callback({url: url, code: response.statusCode});
                    return;
                }

                callback(null, body);
            });
        };

    describe('validator in wild', function () {

        it('loads all referenced remote schemas', function (done) {
            var validator = new Validator('https://www.swiss-hotels.com/availabilities-filtered/schema');

            this.timeout(10000);

            validator.fetchSchemas(schemaLoader, function (err) {
                if (err) {
                    done(new Error(JSON.stringify(err)));
                } else {
                    done();
                }
            });
        });

        it('does actual validation', function (done) {
            var validator = new Validator('http://json-schema.org/geo');

            validator.fetchSchemas(schemaLoader, function (err) {
                if (err) {
                    done(new Error(JSON.stringify(err)));
                } else {
                    assert(validator.validate({
                        latitude: 53.0,
                        longitude: 43.0
                    }, 'http://json-schema.org/geo').valid);

                    done();
                }
            });
        });
    });

}());