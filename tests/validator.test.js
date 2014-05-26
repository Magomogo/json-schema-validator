(function () {
    'use strict';

    var sinon = require('sinon'),
        Validator = require('../src/validator.js');

    describe('validator', function () {

        it('loads all referenced remote schemas on initialization', function (done) {
            var schemaLoader = sinon.stub(),
                swissHotelsValidator = new Validator('https://www.swiss-hotels.com/ota/schema');

            schemaLoader.withArgs('https://www.swiss-hotels.com/ota/schema')
                .yields(null, require('./data/ota-schema.json'));

            schemaLoader.withArgs('https://www.swiss-hotels.com/schema')
                .yields(null, require('./data/swiss-hotels-schema.json'));

            schemaLoader.yields({err: true});

            swissHotelsValidator.fetchSchemas(schemaLoader, function () {
                sinon.assert.calledWith(schemaLoader, 'https://www.swiss-hotels.com/ota/schema', sinon.match.any);
                sinon.assert.calledWith(schemaLoader, 'https://www.swiss-hotels.com/schema', sinon.match.any);
                done();
            });
        });

        it('loads multiple schemas passed in constructor', function (done) {
            var schemaLoader = sinon.stub(),
                swissHotelsValidator = new Validator(['url1', 'url2']);

            schemaLoader.yields(null, {});

            swissHotelsValidator.fetchSchemas(schemaLoader, function () {
                sinon.assert.calledWith(schemaLoader, 'url1', sinon.match.any);
                sinon.assert.calledWith(schemaLoader, 'url2', sinon.match.any);
                done();
            });
        });

        it('tries to load referenced schemas only once ignoring errors', function (done) {
            var schemaLoader = sinon.stub(),
                swissHotelsValidator = new Validator('https://www.swiss-hotels.com/ota/schema');

            schemaLoader.withArgs('https://www.swiss-hotels.com/ota/schema')
                .yields(null, require('./data/ota-schema.json'));

            schemaLoader.withArgs('https://www.swiss-hotels.com/schema')
                .yields(null, require('./data/swiss-hotels-schema.json'));

            schemaLoader.yields(null, {});

            swissHotelsValidator.fetchSchemas(schemaLoader, function () {
                sinon.assert.callCount(schemaLoader, 4);
                done();
            });

        });
    });

}());