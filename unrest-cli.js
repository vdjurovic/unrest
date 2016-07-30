#!/usr/bin/env node

var unrest = require('./index.js');
var vorpal = require('vorpal')();
var fs = require('fs');

var configFile = './unrest.config.json';
var testConfigFile = './tests.json';

console.log("Directory: " + process.cwd());

// load config file 
console.log("Reading default config file..")
var config = JSON.parse(fs.readFileSync(configFile));
console.log("Configuration file loaded");
var testConfig = JSON.parse(fs.readFileSync(testConfigFile));

function dataFromCmdLineParams(data, delimiter){
  var out = {};
  if(Array.isArray(data)){
    for(var i = 0;i < data.length;i++){
      var s = data[i].split(delimiter);
      // trim value and remove starting/trailing single quote from string
      out[s[0].trim()] = s[1].trim().replace(/\b'|'\b/g, "");;
    }
  } else {
     var s = data.split(delimiter);
      // trim value and remove starting/trailing single quote from string
      out[s[0].trim()] = s[1].trim().replace(/\b'|'\b/g, "");
  }
  
  return out;
}

function createRequestConfig(target, options){
  var reqConfig = {};
  reqConfig.host = config.defaults.host;
  reqConfig['headers'] = config.defaults.headers;
  // setup client config
  for(var varName in config.client){
    reqConfig[varName] = config.client[varName];
  }
  if(testConfig[target] != null){
    // setup test case configuration
    var testCase = testConfig[target].request;
    reqConfig.endpoint = testCase.endpoint;
    // add headers from request config
    for(var h in testCase.headers){
      reqConfig.headers[h] = testCase.headers[h];
    }
    // set body content
    if(testCase.body != null){
      reqConfig.data = testCase.body.content;
    }
    
  } 
  // override setting from command line
  if(options.header != null){
    var optHeaders = dataFromCmdLineParams(options.header, ':');
    for(var h in optHeaders){
      reqConfig.headers[h] = optHeaders[h];
    }
  }
  if(options['path-param'] != null){
    var optPathParams = dataFromCmdLineParams(options['path-param'], '=');
    reqConfig['path'] = {};
    for(var param in optPathParams){
      reqConfig.path[param] = optPathParams[param];
    }
  }
  if(options['query-param'] != null){
    var optQueryParams = dataFromCmdLineParams(options['query-param'], '=');
    reqConfig['param'] = {};
    for(var qp in optQueryParams){
      reqConfig.param[qp] = optQueryParams[qp];
    }
  }
  if(options['req-content'] != null){
    reqConfig.data = fs.readFileSync(options['req-content']);
  }
    
  return reqConfig;
}

// set up commands
vorpal.command('get <target> ', 'Performs GET request').
  option('-h, --header <value>', 'Set request header (format -h "Accept: application/json")').
  option('-p, --path-param <value>', 'Set value of REST path parameter (format -p "param=value")').
  option('-q, --query-param <value>', 'Set value of query parameter (format -q "param=value")').
  action(function(args, callback){
   var target = args.target;
   var reqConfig = createRequestConfig(target, args.options);
    console.log("target: " + args.target);
    console.log('request config: ' + JSON.stringify(reqConfig));
  if(testConfig[target] != null){
    unrest.get(config, function(){
      callback()
    });
  } else {
    unrest.getDirect(target, reqConfig, function(){
      callback();
    });
  }
  
});

vorpal.command('post <target>', 'Performs POST request').
  option('-h, --header <value>', 'Set request header (format -h "Accept: application/json")').
  option('-p, --path-param <value>', 'Set value of REST path parameter (format -p "param=value")').
  option('-q, --query-param <value>', 'Set value of query parameter (format -q "param=value")').
  option('-c, --req-content <value>', 'Set request body to be content of specified file').
  action(function(args, callback){
    var target = args.target;
    var reqConfig = createRequestConfig(target, args.options);
    console.log("target: " + args.target);
    console.log('request config: ' + JSON.stringify(reqConfig));
    if(testConfig[target] != null){
      unrest.post(reqConfig, function(){
	callback();
      });
      
    } else {
      unrest.postDirect(target, reqConfig, function(){
	callback();
      });
    }
    
});


vorpal.delimiter("unrest>").show();
