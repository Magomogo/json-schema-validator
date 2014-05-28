(function () {
    'use strict';

    var tv4 = require('tv4'),
        formats = require('tv4-formats'),
        async = require('async'),
        request = require('request'),

        loadedReferences,

        arrayDiff = function(a1, a2) {
            return a1.filter(function(i) {return a2.indexOf(i) < 0;});
        },

        addReferencedSchemas = function (tv4, loader, done) {
            var schemasTodo = function (tv4) {
                return arrayDiff(tv4.getMissingUris(), loadedReferences);
            };

            async.each(schemasTodo(tv4), function (schemaUri, callback) {

                if (loadedReferences.indexOf(schemaUri) !== -1) {
                    callback();
                    return;
                }

                loader(schemaUri, function (err, schema) {
                    loadedReferences.push(schemaUri);
                    if (!err) {
                        tv4.addSchema(schemaUri, schema);
                    }
                    callback();
                });
            }, function (err) {
                if (err) {
                    done(err);
                } else if (schemasTodo(tv4).length > 0) {
                    addReferencedSchemas(tv4, loader, done);
                } else {
                    done();
                }
            });
        },

        Validator = function (schemaUris) {
            this.schemaUris = typeof schemaUris === 'object' ? schemaUris : [schemaUris];
            this.tv4 = tv4.freshApi();
            this.tv4.addFormat(formats);
            loadedReferences = [];
        };

    Validator.prototype.fetchSchemas = function (loader, done) {
        var that = this;

        async.map(this.schemaUris, function (schemaUri, callback) {
            loader(schemaUri, function (err, schema) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, {uri: schemaUri, schema: schema});
                }
            });
        }, function (err, schemas) {
            if (err) {
                done(err);
            } else {
                schemas.map(function (specs) {
                    that.tv4.addSchema(specs.uri, specs.schema);
                });
                addReferencedSchemas(that.tv4, loader, done);
            }
        });
    };

    Validator.prototype.validate = function (json, typeId) {

        if (this.tv4.getSchema(typeId) === undefined) {
            throw new Error (typeId + ' schema is not loaded');
        }

        return this.tv4.validateResult(
            json,
            this.tv4.getSchema(typeId),
            true,
            true
        );
    };

    Validator.simple = function (schemaUris, callback) {
        var schemaLoader = function (url, callback) {
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
            },

            v = new Validator(schemaUris);

        v.fetchSchemas(schemaLoader, function (err) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, v);
            }
        });

    };

    module.exports = Validator;
}());
