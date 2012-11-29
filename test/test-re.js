var retry = require('../lib/re');

	// 800, 1600, 3200, 3200, 3200, ...
var strategy = {
      "type": retry.RETRY_STRATEGY.EXPONENTIAL,
      "initial":100,
      "base":2
    },
	options = {"timeout": 10000, "retries": 10, "retryStrategy": strategy},
	re = new retry.Re(options),
	last = new Date().getTime(),
	first = last;

re.try(function(retryCount, fail, callback){
		var now = new Date().getTime();

		console.log("RETRY: " + retryCount + " of " + options.retries + ", ELAPSED: " + (now - last));
		last = now;
		if(retryCount < 10) throw new Error("Not there yet.");
		else callback(null, retryCount);
	},
	function(err, retries){
		if(err) console.log(err);
		else console.log("It took this many tries: " + retries);

		console.log("TOTAL ELAPSED TIME: " + (last - first));
});
