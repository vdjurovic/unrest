# unREST
unREST is Node.js CLI application for testing REST services. It provides command line interface for most common operations involved in testing REST services, such as invoking endpoints, viewing and processing output, creating custom configuration for most commonly used operations etc.

## Why another REST client?
There are a lot of nice looking GUI clients with a lot of useful features, so why would I use some weird command line utility? This sounds like a legitimate question. After all, GUIs are much prettier and easy to work with. 

To answer this question, only two words: **scripting** and **automation**. unREST allows you to create custom configurations and workflows to streamline common tasks involved intesting your services. For examples, you can parametrize service invocations, extract and process output, parametrize request content and much more. Please read on for samples of application usage.

# Installation
*Warning:* This module is not available in NPM yet, so you will need to run it from source code. The easiest way:
```
nodejs unrest-cli.js
```

# Sample usage
For running samples, we will use freely available JSON REST API from [JSON Placeholder](https://jsonplaceholder.typicode.com/). We will use it to showcase application usage.

After you start the application, you will be presented with a command prompt. To see the list of available commands, use `help` command:

```
unrest> help

  Commands:

    help [command...]           Provides help for a given command.
    exit                        Exits application.
    get [options] <target>      Performs GET request
    post [options] <target>     Performs POST request
    put [options] <target>      Performs PUT request
    delete [options] <target>   Performs DELETE request
    extract [options] [object]  Extracts specific value from JSON object
    save [options] [object]     Saves specified object
    env [options]               Show environment variables for curent session

```

## Simple GET
To run HTTP GET command, simply type `get` followed by URL. This is the simplest usage and is valid for any HTTP method:

```
unrest> get http://jsonplaceholder.typicode.com/posts/1
{ statusCode: 200,
  statusMessage: 'OK',
  headers: 
   { date: 'Wed, 24 Aug 2016 15:21:56 GMT',
     'content-type': 'application/json; charset=utf-8',
     'content-length': '292',
     connection: 'close',
     'set-cookie': [ '__cfduid=dbbdbf1bd8f935904084c54e869477f2b1472052115; expires=Thu, 24-Aug-17 15:21:55 GMT; path=/; domain=.typicode.com; HttpOnly' ],
     'x-powered-by': 'Express',
     vary: 'Origin, Accept-Encoding',
     'access-control-allow-credentials': 'true',
     'cache-control': 'public, max-age=14400',
     pragma: 'no-cache',
     expires: 'Wed, 24 Aug 2016 19:21:56 GMT',
     'x-content-type-options': 'nosniff',
     etag: 'W/"124-yv65LoT2uMHrpn06wNpAcQ"',
     via: '1.1 vegur',
     'cf-cache-status': 'REVALIDATED',
     server: 'cloudflare-nginx',
     'cf-ray': '2d77cbf9a0a04038-SOF' },
  body: 
   { userId: 1,
     id: 1,
     title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
     body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto' } }
     
```
The command outputs some usefull information along with the response, such as status, headers etc. If you want to see the output in more human-readable way, use `-f` option:

```
unrest> get http://jsonplaceholder.typicode.com/posts/1 -f
statusCode:    200
statusMessage: OK
headers: 
  date:                             Wed, 24 Aug 2016 15:23:57 GMT
  content-type:                     application/json; charset=utf-8
  content-length:                   292
  connection:                       close
  set-cookie: 
    - __cfduid=def923b4e1221913898787ad7716fd89a1472052237; expires=Thu, 24-Aug-17 15:23:57 GMT; path=/; domain=.typicode.com; HttpOnly
  x-powered-by:                     Express
  vary:                             Origin, Accept-Encoding
  access-control-allow-credentials: true
  cache-control:                    public, max-age=14400
  pragma:                           no-cache
  expires:                          Wed, 24 Aug 2016 19:23:57 GMT
  x-content-type-options:           nosniff
  etag:                             W/"124-yv65LoT2uMHrpn06wNpAcQ"
  via:                              1.1 vegur
  cf-cache-status:                  HIT
  server:                           cloudflare-nginx
  cf-ray:                           2d77cef1fca7403e-SOF
body: 
  userId: 1
  id:     1
  title:  sunt aut facere repellat provident occaecati excepturi optio reprehenderit
  body: 
    """
      quia et suscipit
      suscipit recusandae consequuntur expedita et cum
      reprehenderit molestiae ut ut quas totam
      nostrum rerum est autem sunt rem eveniet architecto
    """
```
### Parametrized GET
You can specify custom template parameters for URL call. These will be replaced by unREST by values you specify for the call.
```
get http://jsonplaceholder.typicode.com/posts/${id} -p  "id=76"
get http://jsonplaceholder.typicode.com/comments?postId=${postId} -p  "postId=1"
```
As you can see, you can parametrize both path and query string variables. This can come handy when scripting, as we will show in following sections.

## Basic configuration
unREST allows you to specify configuration options in files which are then used to execute HTTP requests. Generally, two configuration files are expected:
* default configuration, which specifies options applied to all requests
* per-request configuration options, which you can specify for each test independently

Per-request configuration options override default options, and options passed from command line override those. So, the order of applying configuration options is:
* default options
* per-request options
* command line options

When unREST starts up, it expects to find two configuration files in current directory: `unrest.config.json` and `tests.json`. First file specifies default configuration options, and the other 
per-test options (in this context, test is considered to be one pre-configured HTTP request).

You can specify different configuration files by starting unREST with options `-d`, which specifies path to default configuration, and `-t`, which specifies path to per-test. configuration.

```
unrest -d ../path/to default.json -t path/to/mytest.json
```

Paths to these files are relatve to current working directory.

### Default configuration

Configuration is in JSON format. The code snippet bellow display sample default configuration files:

```
{
  "defaults": {
      "headers": {
      "Accept":"application/json",
      "x-custom": "my-custom-header"
    },
    "host": "https://somehost.com"
  },
  "client": {
    "connection": {
       "rejectUnauthorized": false
    }
  }
}
```

Section `deafults` specifies headers to apply to each request, and default target host. This allows you to specify only request paths, without host part.

Section `client` defines network options for HTTP client used in application. unREST uses [node-rest-client](https://github.com/aacerox/node-rest-client) module for making HTTP requests. 
For configuing `client` section, you can use all request/response configuration options used for this client (refer to node-rest-client project page for supported options). In this example, we set 
options `rejectUnauthorized` to `false`, which allows the client to accept self-signed SSL certificates for HTTPS requests.

### Per-test configuration
