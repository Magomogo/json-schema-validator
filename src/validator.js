(function () {
    'use strict';

    var tv4 = require('tv4'),
        formats = require('tv4-formats'),
        async = require('async'),

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
                        tv4.addSchema(schema);
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
            loader(schemaUri, callback);
        }, function (err, schemas) {
            if (err) {
                done(err);
            } else {
                schemas.map(function (schema) {
                    that.tv4.addSchema(schema);
                });
                addReferencedSchemas(that.tv4, loader, done);
            }
        });
    };

    Validator.prototype.validate = function (json, typeId) {
        return this.tv4.validateResult(
            json,
            this.tv4.getSchema(typeId),
            true,
            true
        );
    };

    module.exports = Validator;

}());