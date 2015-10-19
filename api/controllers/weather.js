'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var request = require('request');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  weather: weather
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function weather(req, res) {
  var key = "355e806e0c6b3aa9c5c24c36144d073b";
  var url = "http://api.openweathermap.org/data/2.5/weather";
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var options = {uri: url, qs:{appid:key}};
      if(req.query['zip'] != undefined) {
        options.qs.zip = req.query['zip'];
      }
      if(req.query['city'] != undefined) {
        options.qs.city = req.query['city'];
      }
      if(options.qs.city === "" && options.qs.zip === "") {
        res.statusCode = 400;
        res.send({message: "Empty query not allowed"});
        return;
      }
      if(req.query['units'] != undefined) {
        options.qs.units=req.query['units'];
      }
    request.get(options, function(err, request, body) { 
    body = JSON.parse(body);
    if(err) {
      res.statusCode = 500;
      res.send({message: JSON.stringify(err)});
      return;
    }
    if(body.cod === "404") {
      res.statusCode = 404; 
      res.send({message:"Zip or city not found"});
    } else {
      var result = {};
      result.coord = body.coord;
      result.weather = {};
      result.weather.condition = body.weather[0].main;
      result.weather.currentHigh = body.main.temp_max;
      result.weather.currentLow = body.main.temp_min;
      res.statusCode = 200;
      res.send(result);
    }
  });
}
