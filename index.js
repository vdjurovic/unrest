
var RestClient = require('node-rest-client').Client;


var unrest = {};

function formatResponse(raw, data, url){
  var response = {};
  response.statusCode = raw.statusCode;
  response.statusMessage = raw.statusMessage;
  response.headers = raw.headers;
  if(data != null){
    response.body = data;
  }
  
  return response;
}

/**
 * Performs HTTP GET request to specified URL and with specified configuration options. After the request is completed,
 * callback function is invoked to process response data.
 */
unrest.getDirect = function(url, config, callback){
  var client = new RestClient(config);
  client.get(url, config, function(data, response){
    var output = formatResponse(response, data);
    callback(output);
  });
}

unrest.get = function(config, callback) {
  var client = new RestClient(config);
  var target = config.host + config.endpoint;

  client.get(target, config, function (data, response) {
    var output = formatResponse(response, data);
    callback(output);
});
}

unrest.postDirect = function(url, config, callback){
  var client = new RestClient(config);
  client.post(url, config, function(data, response){
    var output = formatResponse(response, data);
    callback(output);
  });
}

unrest.post = function(config, callback) {
  var client = new RestClient(config);
  var target = config.host + config.endpoint;
  
  client.post(target, config, function(data, response){
    var output = formatResponse(response, data);
    callback(output);
  });
  
}

unrest.putDirect = function(url, config, callback){
  var client = new RestClient(config);
  client.put(url, config, function(data, response){
    var output = formatResponse(response, data, url);
    callback(output);
  });
}

unrest.put = function(config, callback) {
  var client = new RestClient(config);
  var target = config.host + config.endpoint;
  
  client.put(target, config, function(data, response){
    var output = formatResponse(response, data, target);
    callback(output);
  });
}

unrest.deleteDirect = function(url, config, callback){
  var client = new RestClient(config);
  client.delete(url, config, function(data, response){
    var output = formatResponse(response, data);
    callback(output);
  });
}

unrest.delete = function(config, callback) {
  var client = new RestClient(config);
  var target = config.host + config.endpoint;

  client.delete(target, config, function (data, response) {
    var output = formatResponse(response, data);
    callback(output);
});
}


module.exports = unrest;
