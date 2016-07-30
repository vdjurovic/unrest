
var RestClient = require('node-rest-client').Client;
var prettyjson = require('prettyjson');


var unrest = {};


unrest.getDirect = function(url, config, callback){
  var client = new RestClient();
  client.get(url, config, function(data, response){
    console.log(response.headers);
    console.log(data);
    callback();
  });
}

unrest.get = function(config, callback) {
  //console.log("UnREST GET");
  var client = new RestClient(config.client);
  client.get(config.defaults.host + "/api/docrepo/content/list?path=/folder1",config.defaults, function (data, response) {
    // parsed response body as js object
    console.log(prettyjson.render(data));
    //console.log(data);
    console.log(prettyjson.render(response.headers));
    // raw response
    //console.log(response);
    callback()
});
}

unrest.postDirect = function(url, config, callback){
  var client = new RestClient(config);
  client.post(url, config, function(data, response){
    console.log(response.headers);
    console.log(data);
    callback();
  });
}

unrest.post = function(config, callback) {
  var client = new RestClient(config);
  var target = config.host + config.endpoint;
  
  client.post(target, config, function(data, response){
    console.log(response.headers);
    console.log(data);
    callback();
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
