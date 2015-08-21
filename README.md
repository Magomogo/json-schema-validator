json-schema-validator
=====================

[![Build Status](https://travis-ci.org/Magomogo/json-schema-validator.svg)](https://travis-ci.org/Magomogo/json-schema-validator)

This package uses the [tv4](https://www.npmjs.org/package/tv4) JSON Schema validator, and the
formats provided by the [tv4-formats](https://github.com/ikr/tv4-formats/). It loads all the referenced
JSON schemas over the internet to bootstrap tv4.

## Usage

    Validator.simple('http://json-schema.org/geo', function (error, v) {
        assert.ifError(error);

        assert(v.validate(
            {latitude: 53.0, longitude: 43.0},
            'http://json-schema.org/geo'
        ).valid);

        done();
    });
    

### CLI

    echo '{"json": "to validate"}' | json-validate http://some.type.id/
    
## API


Constructor:

    v = new Validator(schemaUris);
    
schemaUris: array of schema Uris to load (can be a string in the case of single URI)

--

    v.fetchSchemas(schemaLoader, callback)
  
Load schemas over the net with `schemaLoader(url, callback)` and add to tv4 validator. All URI-s to
be loaded: given in constructor and referenced by "$ref" clause in each loaded schema. Circular
references are gets resolved.

--

    v.validate(json, typeId)
    
Do validation of `json` against schema defined by `typeId`

Possible type Ids are:

* http://json-schema.org/geo
* http://some.site.somewhere/entry-schema#/definitions/diskUUID 


--

    Validator.simple(uris, callback)
    
Just a shortcut for getting validator bootstrapped using `request` as schema loader
