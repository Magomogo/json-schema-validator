(function () {
    'use strict';

    var tv4 = require('tv4'),
        formats = require('tv4-formats'),
        async = require('async'),
        request = require('request'),
        fs = require('fs'),

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
    
    function resolveUri(uri, callback) {
        if (typeof uri !== 'string') {
            callback(new Error('Invalid uri: ' + uri + '. Must be a string.'));
            return;
        }
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            request({
                url: uri,
                strictSSL: false,
                json: true
            }, function (error, response, body) {
                if (error) {
                    callback(error);
                    return;
                }

                if (200 !== response.statusCode) {
                    callback({url: uri, code: response.statusCode});
                    return;
                }

                callback(null, body);
            });
        }
        else {
            if (uri.startsWith('file://')) {
                uri = uri.substr(7);
            }
            fs.readFile(uri, function(err, data) {
                if (err) {
                    callback(err);
                    return;
                }

                data = data.toString();
                try { data = JSON.parse(data); }
                catch (err) {
                    callback(err);
                    return;
                }

                callback(null, data);
            });
        }
    }

    Validator.simple = function (schemaUris, callback) {
        if (schemaUris === null) {
            callback(new Error('Invalid schema uri: ' + schemaUris + '. Must be a string or array of strings.'));
            return;
        }

        var schemaLoader = resolveUri,
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
