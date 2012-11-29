exports.RETRY_STRATEGY = RETRY_STRATEGY = {CONSTANT: 0, EXPONENTIAL: 1, LINEAR: 2};

var	RETRIES_DEFAULT = 10,
	EXP_STRAT_DEFAULT = {"type": RETRY_STRATEGY.EXPONENTIAL, "initial":100, "base":2};
	CONST_STRAT_DEFAULT = {"type": RETRY_STRATEGY.CONSTANT, "initial":400};
	LINEAR_STRAT_DEFAULT = {"type": RETRY_STRATEGY.LINEAR, "initial": 100};

exports.Re = Re;

function Re(options){
	if(!(this instanceof Re)) return new Re(options);

	var retryStrategy;

	if(typeof options === "undefined") options = {};
	if(typeof options.timeout === "undefined") options.timeout = TIMEOUT_DEFAULT;
	if(typeof options.retries === "undefined") options.retries = RETRIES_DEFAULT;
	if(typeof options.retryStrategy === "undefined") options.retryStrategy = EXP_STRAT_DEFAULT;
	if(typeof options.retryStrategy.type === "undefined") throw new TypeError("Invalid retry strategy");

	retryStrategy = options.retryStrategy;

	this.retry = 0;
	this.timeout = options.timeout;
	this.maxRetries = options.retries;

	switch(options.retryStrategy.type){
		case RETRY_STRATEGY.CONSTANT:
			if(typeof retryStrategy.initial === "undefined") retryStrategy.initial = CONST_STRAT_DEFAULT.initial;
			this.retryInterval = createConstantRetry(retryStrategy);
			break;
		case RETRY_STRATEGY.EXPONENTIAL:
			if(typeof retryStrategy.initial === "undefined") retryStrategy.initial = EXP_STRAT_DEFAULT.initial;
			if(typeof retryStrategy.base === "undefined") retryStrategy.base = EXP_STRAT_DEFAULT.base;
			this.retryInterval = createExponentialRetry(retryStrategy);
			break;
		case RETRY_STRATEGY.LINEAR:
			if(typeof retryStrategy.initial === "undefined") retryStrategy.initial = LINEAR_STRAT_DEFAULT.initial;
			this.retryInterval = createLinearRetry(retryStrategy);
			break;
		default:
			throw new TypeError("Invalid retry strategy");
			break;
	}
};

Re.prototype.try = function(operation, callback){
	var fail = this.createFailCallback(operation, callback, this.try);

	try{
		operation(this.retry, fail, callback);
	} catch(err) {
		fail(err);
	}
};

Re.prototype.do = function(operation, callback){
	var fail = this.createFailCallback(operation, callback, this.do);

	operation(this.retry, fail, callback);
};

Re.prototype.createFailCallback = function(operation, callback, method){
	var self = this;
	return function(err){
			
		callback = callback || function () {};

		if(self.retry < self.maxRetries){
			setTimeout(function(){
					method.call(self, operation, callback);
				},
				self.retryInterval(self.retry));
		} else {
			return callback(err);
		}

		self.retry++;
	};
};

createExponentialRetry = function(spec){
	return function(retries){
		var spread = spec.rand ? Math.random() + 1 : 1,
			initial = spec.initial,
			base = spec.base,
			max = spec.max,
			full = spread * initial * Math.pow(base, retries);

		return max ? Math.min(full, max) : full;
	};
};

createLinearRetry = function(spec){
	return function(retries){
		var spread = spec.rand ? Math.random() + 1 : 1,
			initial = spec.initial,
			max = spec.max,
			full = spread*initial*(retries+1);
			
		return max ? Math.min(full, max) : full;
	};
};

createConstantRetry = function(spec){
	return function(){
		var spread = spec.rand ? Math.random() + 1 : 1,
			initial = spec.initial;
		return spread*initial;
	};
};