var assert = require('assert'),
	Re = require('../lib/re'),
	// WARNING: CHANGING ANY OF THE FOLLOWING THREE PARAMATER WILL AFFECT TEST DURATION
	RETRIES = 4,
	INTERVAL = 15,
	options = {retries: RETRIES, strategy: {type: Re.STRATEGIES.CONSTANT, initial: INTERVAL}},
	re;

describe("re.try", function(){
	beforeEach(function(){
		re = new Re(options);
	});

	it("should retry when done is called with an error", function(complete){
		var TEST_TRIES = 2,
			testTryCount = 0;

		re.try(function(retryCount, done){
			var err = (testTryCount < TEST_TRIES) ? new Error("sux0r") : null;
			testTryCount++;

			done(err, retryCount);
		},
		function(err, retryCount){
			assert.ok(testTryCount > 1, "Didn't try more than once.");
			complete();
		});
	});

	it("should run at least 'retries' + 1 times, if done called with error", function(complete){
		var testTryCount = 0;

		re.try(function(retryCount, done){
			testTryCount++;
			done(new Error("sux0r"));
		},
		function(err, retryCount){
			assert.ok(testTryCount >= (RETRIES + 1), "Didn't try hard enough.");
			complete();
		});
	});

	it("should run at most 'retries' + 1 times, if done called with error", function(complete){
		var testTryCount = 0;

		re.try(function(retryCount, done){
			testTryCount++;
			done(new Error("sux0r"));
		},
		function(err, retryCount){
			assert.ok(testTryCount <= (RETRIES + 1), "Tried too hard.");
			complete();
		});
	});

	it("should callback with a falsy err, if success happens within retries", function(complete){

		re.try(function(retryCount, done){

			var err = (retryCount < RETRIES) ? new Error("sux0r") : null;

			done(err, retryCount);
		},
		function(err, retryCount){
			if(err) throw err;
			complete();
		});
	});

	it("should callback with a truthy err, if no success happens", function(complete){

		re.try(function(retryCount, done){
			done(new Error("sux0r"));
		},
		function(err, retryCount){
			assert.ok(err, "There should have been an error, but wasn't.")
			complete();
		});
	});

	it("should retry when an exception is thrown", function(complete){
		var TEST_TRIES = 2,
			testTryCount = 0;

		re.try(function(retryCount, done){
			testTryCount++;

			if(testTryCount < TEST_TRIES) throw new Error("sux0r");

			done(null, retryCount);
		},
		function(err, retryCount){
			assert.ok(testTryCount > 1, "Didn't try more than once.");
			complete();
		});
	});

	it("should run at least 'retries' + 1 times, if exception always thrown", function(complete){
		var testTryCount = 0;

		re.try(function(retryCount, done){
			testTryCount++;
			throw new Error("sux0r");
		},
		function(err, retryCount){
			assert.ok(testTryCount >= (RETRIES + 1), "Didn't try hard enough.");
			complete();
		});
	});

	it("should run at most 'retries' + 1 times, if exception always thrown", function(complete){
		var testTryCount = 0;

		re.try(function(retryCount, done){
			testTryCount++;
			throw new Error("sux0r");
		},
		function(err, retryCount){
			assert.ok(testTryCount <= (RETRIES + 1), "Tried too hard.");
			complete();
		});
	});

	it("should callback with a falsy err, if success happens within retries", function(complete){

		re.try(function(retryCount, done){

			if(retryCount < RETRIES) throw new Error("sux0r");

			done(null, retryCount);
		},
		function(err, retryCount){
			if(err) throw err;
			complete();
		});
	});

	it("should callback with a truthy err, if no success happens", function(complete){

		re.try(function(retryCount, done){
			throw new Error("sux0r");
		},
		function(err, retryCount){
			assert.ok(err, "There should have been an error, but wasn't.")
			complete();
		});
	});
});