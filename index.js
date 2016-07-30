
var RestClient = require('node-rest-client').Client;
var prettyjson = require('prettyjson');


var unrest = {};

function formatResponse(raw, data){
  var response = {};
  response.statusCode = raw.statusCode;
  response.statusMessage = raw.statusMessage;
  response.headers = raw.headers;
  if(data != null){
    response.body = data;
  }
  
  return response;
}


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

unrest.put = function() {
  
}

unrest.delete = function() {
  
}

var headerFiller = function(config, testConfig){
  var headers = {};
  for(var header in config.defaults.headers){
    headers[header] = config.defaults.headers[header];
  }
  for(var header in testConfig.request.headers){
     headers[header] = testConfig.request.headers[header];
  }
  return headers;
}

module.exports = unrest;
