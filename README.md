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
