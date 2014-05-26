(function () {
    'use strict';

    var request = require('request'),
        Validator = require('../src/validator.js');

    describe('validator system test', function () {

        it('loads all referenced remote schemas', function (done) {
            var validator = new Validator('https://www.swiss-hotels.com/availabilities-filtered/schema');

            this.timeout(10000);

            validator.fetchSchemas(function (url, callback) {
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
            }, function (err) {
                if (err) {
                    done(new Error(JSON.stringify(err)));
                } else {
                    done();
                }
            });
        });

    });

}());