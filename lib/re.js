(function (){

	// global on the server, window in the browser
	var root = this,
		previous_re = root.Re;

	Re.noConflict = function(){
		root.Re = previous_re;
		return Re;
	};


	// start actual code
	Re.STRATEGIES = {CONSTANT: 0, EXPONENTIAL: 1, LINEAR: 2};

	var RETRIES_DEFAULT = 10,
		EXP_STRAT_DEFAULT = {"type": Re.STRATEGIES.EXPONENTIAL, "initial":100, "base":2},
		CONST_STRAT_DEFAULT = {"type": Re.STRATEGIES.CONSTANT, "initial":400},
		LINEAR_STRAT_DEFAULT = {"type": Re.STRATEGIES.LINEAR, "initial": 100};

	Re.prototype.retryInterval;

	function Re(options){
		if(!(this instanceof Re)) return new Re(options);

		var strategy;

		if(typeof options === "undefined") options = {};
		if(typeof options.retries === "undefined") options.retries = RETRIES_DEFAULT;
		if(typeof options.strategy === "undefined") options.strategy = EXP_STRAT_DEFAULT;
		if(typeof options.strategy.type === "undefined") throw new TypeError("Invalid retry strategy");

		strategy = options.strategy;

		this.retry = 0;
		this.timeout = options.timeout;
		this.maxRetries = options.retries;

		switch(options.strategy.type){
			case Re.STRATEGIES.CONSTANT:
				if(typeof strategy.initial === "undefined") strategy.initial = CONST_STRAT_DEFAULT.initial;
				this.retryInterval = createConstantRetry(strategy);
				break;
			case Re.STRATEGIES.EXPONENTIAL:
				if(typeof strategy.initial === "undefined") strategy.initial = EXP_STRAT_DEFAULT.initial;
				if(typeof strategy.base === "undefined") strategy.base = EXP_STRAT_DEFAULT.base;
				this.retryInterval = createExponentialRetry(strategy);
				break;
			case Re.STRATEGIES.LINEAR:
				if(typeof strategy.initial === "undefined") strategy.initial = LINEAR_STRAT_DEFAULT.initial;
				this.retryInterval = createLinearRetry(strategy);
				break;
			default:
				throw new TypeError("Invalid retry strategy");
				break;
		}
	};

	Re.prototype.try = function(operation, callback){
		var done = this.createDoneCallback(operation, callback, this.try);

		try{
			operation(this.retry, done);
		} catch(err) {
			done(err);
		}
	};

	Re.prototype.do = function(operation, callback){
		var done = this.createDoneCallback(operation, callback, this.do);

		operation(this.retry, done);
	};

	Re.prototype.createDoneCallback = function(operation, callback, method){
		var self = this;
		return function(err){
			var doneArguments = arguments;

			callback = callback || function () {};

			if(!err) return setTimeout(function(){callback.apply(null, doneArguments);}, 0);

			if(self.retry < self.maxRetries){
				setTimeout(function(){
						method.call(self, operation, callback);
					},
					self.retryInterval(self.retry));
			} else {
				return setTimeout(function(){callback.apply(null, doneArguments);}, 0);
			}

			self.retry++;
		};
	};

	function createExponentialRetry(spec){
		return function(retries){
			var spread = spec.rand ? Math.random() + 1 : 1,
				initial = spec.initial,
				base = spec.base,
				max = spec.max,
				full = spread * initial * Math.pow(base, retries);

			return max ? Math.min(full, max) : full;
		};
	};

	function createLinearRetry(spec){
		return function(retries){
			var spread = spec.rand ? Math.random() + 1 : 1,
				initial = spec.initial,
				max = spec.max,
				full = spread*initial*(retries+1);
				
			return max ? Math.min(full, max) : full;
		};
	};

	function createConstantRetry(spec){
		return function(){
			var spread = spec.rand ? Math.random() + 1 : 1,
				initial = spec.initial;
			return spread*initial;
		};
	};

	// Node.js
	if(typeof module !== 'undefined' && module.exports){
		module.exports = Re;
	}
	// included directly via <script> tag
	else {
		root.Re = Re;
	}

}());