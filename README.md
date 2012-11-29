# Re

Do it again, if it doesn't work the first time. Supports various configurable
retry strategies, including: constant, exponential backoff and linear backoff.

Functions are styled to match the simplicity and ease of use found in the [async](https://github.com/caolan/async) library.

## Install

    npm install re


## Quick Example

    var Re = require('re'),
        re = new Re();

    re.try(repeatMe, doMeAtTheEnd);

    var repeatMe = function(retryCount, fail, callback){
      if(retryCount < 2) fail(new Error("Not there yet!"));
      else callback(null, retryCount);
    };

    var doMeAtTheEnd = function(err, retryCount){
      console.log("It took this many tries: " + retryCount);
    };

# In the Browser
Tested in Chrome. Usage:

    <script type="text/javascript" src="re.js"></script>
    <script type="text/javascript">
      var re = new Re();

      re.try(repeatMe, doMeAtTheEnd);
    </script>

## Usage

If you like the defaults, call it like this:

    var Re = require('re'),
        re = new Re();

    re.try(function(retryCount, fail, callback){
        if(retryCount < 2) fail(new Error("Not there yet!"));
        else callback(null, retryCount);
      },
      function(err, retryCount){
        console.log("It took this many tries: " + retryCount);
    });


The `re.try` function takes two arguments, a function to call until it works
(or we run out of retries) and a function to call when it finally succeeds (or
we fail too many times).
As the name suggests we automatically wrap your function in a standard `try`
block and, if an exception occurs, call it again according to the retry schedule.

This first function passed to `re.try` should take 3 arguments like this:

    function operation(retryCount, fail, callback)

The `retryCount` argument is the number of the current retry. It'll be zero the first time 
and get bigger every time.

The `fail` argument is a function to call if you
encounter a fail condition in your operation. This let's us know we need to try again.
If you don't call `fail` and no exception happens, you're done. You can pass an `err`
argument to the `fail` function.

The `callback` argument is the callback function you passed into `re.try`. It should be
a function that takes an `err` parameter as it's first argument. The rest of the arguments
are up to you. Call this when you succeed. We'll call it with the last exception or whatever
you passed to the last `fail`, when too many failures happen.

The `re.do` function is like `re.try` expect it doesn't wrap your operation in
a `try...catch`.

## Options

The default options look like this:

    var options = {
        retries : 10,
        strategy : {
          "type": Re.STRATEGIES.EXPONENTIAL,
          "initial":100,
          "base":2
        }
    }

You pass this options object into the `Re` constructor.

    var Re = require('re'),
        re = new Re(options);

This gives you 10 retries and an exponential backoff strategy with the following progression (in milliseconds): 100, 200,
400, 800, 1600, 3200, 6400, 12800, 25600, 51200

### Retry Strategy Examples

The following will retry every 400 milliseconds:

    {"type": Re.STRATEGIES.CONSTANT, "initial": 400}

The following will give a linear backoff strategy that has the following progression (when paired with `retries: 10`) : 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 1800

    {"type": Re.STRATEGIES.LINEAR, "initial": 200, "max":1800}

Both progressive strategies accept the `max` option.  All strategies also accept a
`rand` option. This is a `Boolean` that adds a random multiplier between 1 and 2.
This makes them act like the tradition backoff function. This option is set to `false` by default.

## Technical Details

The traditional exponential backoff function is described here:
[Exponential Backoff in Distributed Systems](http://dthain.blogspot.com/2009/02/exponential-backoff-in-distributed.html).
This is equivalent to our exponential backoff function with the `rand` option set to `true`.

Our formula for exponential backoff looks something like this, when using all the options:

    return Math.min(random * initial * Math.pow(base, retry), max);

Where `random` is a random number in the half-open interval [1, 2). When randomness is turned off,
the value of this variable is always 1.

If you don't specify the `max` option, the formula looks like this:

    return random * initial * Math.pow(base, retry);


I'm shamelessly stealing the following link from [node-retry](https://github.com/tim-kos/node-retry)
just because it's fun for nerdy math people to play with.
You can use it to calculate the exact value you need for the `base` option so that all
retry intervals sum to a desired amount: [Wolfram Alpha](http://www.wolframalpha.com/input/?i=Sum%5B100*x%5Ek%2C+%7Bk%2C+0%2C+9%7D%5D+%3D+30+*+1000).
