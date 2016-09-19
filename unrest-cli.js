#!/usr/bin/env node

var unrest = require('./index.js');
const vorpal = require('vorpal')();
var fs = require('fs');
var dummy = require('dummy-json');
var prettyjson = require('prettyjson');
var commander = require('commander');

var configFile = './unrest.config.json';
var testConfigFile = './tests.json';

commander.version('1.0.0').
  option('-d, --defaults <path>', 'Path to default configuration file').
  option('-t, --tests <path>', 'Path to tests configuration file').
  parse(process.argv);
  
if(commander.defaults){
  configFile = commander.defaults;
}

if(commander.tests){
  testConfigFile = commander.tests;
}

// load config file 
var defaultConfig = {};
fs.readFile(configFile, function(err, data){
  if(err){
    console.log("Could not load defaults configuration file: " + err.message);
  } else {
    defaultConfig = JSON.parse(data);
  }
});
var defaultTestConfig = {};
fs.readFile(testConfigFile, function(err, data){
  if(err){
    console.log("Could not load test configuration file: " + err.message);
  } else {
    defaultTestConfig = JSON.parse(data);
  }
});


var session = {};

function dataFromCmdLineParams(data, delimiter){
  var out = {};
  
  if(Array.isArray(data)){
    for(var i = 0;i < data.length;i++){
      if(!(Object.prototype.toString.call(data[i]) === "[object String]")){
	continue; // skip for empty parameter
      }
      // strip possible single quotes
      var tmp = data[i].replace(/='/,"=").replace(/'$/,"");
      var s = tmp.split(delimiter);
      if(Array.isArray(s) && s.length > 1){
	// trim value and remove starting/trailing single quote from string
	out[s[0].trim()] = s[1].trim().replace(/\b'|'\b/g, "").replace(/\b\\'|\\'\b/g, "");
      }
    }
  } else {
     if(Object.prototype.toString.call(data) === "[object String]"){
       // strip possible single quotes
      var tmp = data.replace(/='/,"=").replace(/'$/,"");
      var s = tmp.split(delimiter);
      if(Array.isArray(s) && s.length > 1){
	  // trim value and remove starting/trailing single quote from string
	  out[s[0].trim()] = s[1].trim().replace(/\b'|'\b/g, "").replace(/\b\'|\'\b/g, "");
      }
     }
     
  }
  return out;
}

function createRequestConfig(target, options){
  var reqConfig = {};
  var config = JSON.parse(dummy.parse(JSON.stringify(defaultConfig), {mockdata: session}));
  var testConfig = JSON.parse(dummy.parse(JSON.stringify(defaultTestConfig), {mockdata: session}));
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
      if(testCase.body.content != null){
	reqConfig.data = testCase.body.content;
      } else if(testCase.body.file != null){
	reqConfig.data = fs.readFileSync(testCase.body.file);
      }
      
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
    reqConfig['parameters'] = {};
    for(var qp in optQueryParams){
      reqConfig.parameters[qp] = optQueryParams[qp];
    }
  }
  if(options['req-content'] != null){
    reqConfig.data = fs.readFileSync(options['req-content']);
  }
    
  return reqConfig;
}

function formatOutput(data, prettyPrint){
  if(prettyPrint){
    return prettyjson.render(data);
  } else {
    return data;
  }
}

// set up commands
vorpal.command('get <target> ', 'Performs GET request').
  option('-h, --header <value>', 'Set request header (format -h "Accept: application/json")').
  option('-p, --path-param <value>', 'Set value of REST path parameter (format -p "param=value")').
  option('-q, --query-param <value>', 'Set value of query parameter (format -q "param=value")').
  option('-f, --format ', 'Pretty print output').
  action(function(args, callback){
   var target = args.target;
   var reqConfig = createRequestConfig(target, args.options);
   var pretty = false;
   if(args.options.format != null){
     pretty = true;
   }
  // copy of command instance. Used to invoke logging in REST callback
  var cmd = this;
  if(defaultTestConfig[target] != null){
    unrest.get(reqConfig, function(output){
      cmd.log(formatOutput(output, pretty));
      callback()
    });
  } else {
    unrest.getDirect(target, reqConfig, function(output){
      cmd.log(formatOutput(output, pretty));
      callback();
    });
  }
  
});

vorpal.command('post <target>', 'Performs POST request').
  option('-h, --header <value>', 'Set request header (format -h "Accept: application/json")').
  option('-p, --path-param <value>', 'Set value of REST path parameter (format -p "param=value")').
  option('-q, --query-param <value>', 'Set value of query parameter (format -q "param=value")').
  option('-c, --req-content <value>', 'Set request body to be content of specified file').
  option('-f, --format ', 'Pretty print output').
  action(function(args, callback){
    var target = args.target;
    var reqConfig = createRequestConfig(target, args.options);
     var pretty = false;
      if(args.options.format != null){
	pretty = true;
      }
    // copy of command instance. Used to invoke logging in REST callback
    var cmd = this;
    if(defaultTestConfig[target] != null){
      unrest.post(reqConfig, function(output){
	cmd.log(formatOutput(output, pretty));
	callback();
      });
      
    } else {
      unrest.postDirect(target, reqConfig, function(output){
	cmd.log(formatOutput(output, pretty));
	callback();
      });
    }
    
});
  
vorpal.command('put <target>', 'Performs PUT request').
  option('-h, --header <value>', 'Set request header (format -h "Accept: application/json")').
  option('-p, --path-param <value>', 'Set value of REST path parameter (format -p "param=value")').
  option('-c, --req-content <value>', 'Set request body to be content of specified file').
  option('-f, --format ', 'Pretty print output').
  action(function(args, callback){
    var target = args.target;
    var reqConfig = createRequestConfig(target, args.options);
     var pretty = false;
      if(args.options.format != null){
	pretty = true;
      }
    // copy of command instance. Used to invoke logging in REST callback
    var cmd = this;
    if(defaultTestConfig[target] != null){
      unrest.put(reqConfig, function(output){
	cmd.log(formatOutput(output, pretty));
	callback();
      });
      
    } else {
      unrest.putDirect(target, reqConfig, function(output){
	cmd.log(formatOutput(output, pretty));
	callback();
      });
    }
    
});
  
vorpal.command('delete <target>', 'Performs DELETE request').
  option('-h, --header <value>', 'Set request header (format -h "Accept: application/json")').
  option('-p, --path-param <value>', 'Set value of REST path parameter (format -p "param=value")').
  option('-f, --format ', 'Pretty print output').
  action(function(args, callback){
    var target = args.target;
    var reqConfig = createRequestConfig(target, args.options);
     var pretty = false;
      if(args.options.format != null){
	pretty = true;
      }
    // copy of command instance. Used to invoke logging in REST callback
    var cmd = this;
    if(defaultTestConfig[target] != null){
      unrest.delete(reqConfig, function(output){
	cmd.log(formatOutput(output, pretty));
	callback();
      });
      
    } else {
      unrest.deleteDirect(target, reqConfig, function(output){
	cmd.log(formatOutput(output, pretty));
	callback();
      });
    }
    
});
  
vorpal.command('extract [object]', 'Extracts specific value from JSON object').
  option('-h, --header <value>', "Extracts value of specified response header. Header name is case-insensitive.").
  option('-b, --body', 'Extracts response body').
  option('-s, --status', 'Extracts response status code').
  action(function(args, callback){
    
    var input = {};
    if(args.object != null){
      input = JSON.parse(args.object);
    } else if(args.stdin != null){
      // stdin is array, we need first element
      input = args.stdin[0];
    }
    if(args.options.header != null){
      var search = args.options.header.toLowerCase();
      for(var header in input.headers){
	if(header.toLowerCase() === search){
	    this.log(input.headers[header]);
	    break;
	}
      }
    }
    // extract body
    if(args.options.body != null){
      this.log(input.body);
    }
    // extract status
    if(args.options.status != null){
      this.log(input.statusCode);
    }
    callback();
  });
  
vorpal.command('save [object]', 'Saves specified object').
  option('-s, --session <name>', 'Save object to session under specified name').
  option('-f, --file <path>', 'Save object to file with specified path relative to current directory').
  action(function(args, callback){
    var input = {};
    if(args.object != null){
      try {
	input = JSON.parse(args.object);
      } catch(e){
	input = args.object;
      }
      
    } else if(args.stdin != null){
      // stdin is array, we need first element
      input = args.stdin[0];
    }
    if(args.options.session != null){
      session[args.options.session] = input;
    }
    if(args.options.file != null){
      fs.writeFile(args.options.file, input, function(err){
	if(err) {
	  return console.log(err);
	}
      });
    }
    
    callback();
  });

vorpal.command('env', "Show environment variables for curent session").
  option('-t, --test <name>', 'Name of test case to display').
  action(function(args, callback){
    if(args.options.test != null){
       var reqConfig = createRequestConfig(args.options.test, args.options);
       this.log(prettyjson.render(reqConfig));
    } else {
      var env = {};
      env.defaultConfigFile = configFile;
      env.testConfigFile = testConfigFile;
      env.defaults = defaultConfig;
      env.tests = defaultTestConfig;
      env.session = session;
      this.log(prettyjson.render(env));
    }
    
    callback();
  });
  
vorpal.delimiter("unrest>").show();
