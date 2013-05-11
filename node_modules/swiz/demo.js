var swiz = require('./lib/swiz');
var Swiz = require('./lib/swiz').Swiz;
var Valve = require('./lib/swiz').Valve;
var Chain = require('./lib/swiz').Chain;
var defToValve = require('./lib/swiz').defToValve;
var O = swiz.struct.Obj;
var F = swiz.struct.Field;

// Note: There's one set of definitions that control both serialization
// and validation
var def = [
  O('Node',
    {
      'fields': [
        F('key', {'val' : new Chain().isString()}),
        F('ip_address_v4', {'val' : new Chain().isIP()}),
        F('name', {'val' : new Chain().isString(), 'filterFrom': ['public']})
      ],

      'plural': 'nodes'
    })
];

var validity = defToValve(def);
var schema = validity.Node;
var v = new Valve(schema);

// Generic payload
var createPayload = {
  key: '1234',
  ip_address_v4: '1.2.0.4',
  name: 'barrr'
};

console.log('validate a payload:\n');

// Validate the generic payload
v.check(createPayload, function(err, cleaned) {
  var sw = new Swiz(def, { 'for': 'public' });
  if (err) {
    console.error(err);
  } else {
    console.log('\n\nserialize an object\n');
    cleaned.getSerializerType = function() {return 'Node';};
    sw.serialize(swiz.SERIALIZATION.SERIALIZATION_JSON, 1, cleaned,
      function(err, results) {
        console.log(results);
      }
    );
  }
});
