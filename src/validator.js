(function () {
    'use strict';

    var tv4 = require('tv4'),
        formats = require('tv4-formats'),
        async = require('async'),

        addReferencedSchemas = function (tv4, loader, done) {
            async.each(tv4.getMissingUris(), function (schemaUri, callback) {
                loader(schemaUri, function (err, schema) {
                    if (err) {
                        callback(err);
                    } else {
                        tv4.addSchema(schema);
                        callback();
                    }
                });
            }, function (err) {
                if (err) {
                    done(err);
                } else if (tv4.getMissingUris().length > 0) {
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