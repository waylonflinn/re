(function(){

	var assert = {};

	// window in the browser
	var previous_assert = root.assert,
		root.assert = assert;

	assert.noConflict = function(){
		root.assert = previous_assert;
		return assert;
	};

	/*
	 * assert.ok(value, [message])
	 * Tests if value is a true value, it is equivalent to assert.equal(true, value, message);
	 */
	assert.ok = function(value, message){
		assert.equal(true, value, message);
	};

	/*
	 * assert.equal(actual, expected, [message])
	 * Tests shallow, coercive equality with the equal comparison operator ( == ).
	 */
	assert.equal = function(actual, expected, message){
		var message = message ? message : (actual + " not equal to " + expected);
		if(!(actual == expected)) throw new Error(message);
	};

}());