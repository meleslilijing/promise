;
(function(global) {

	global.Promise = Promise;

	try {
		module.exports = Promise;
	} catch (e) {}

	var PENDING = 'pengding',
		RESOLVED = 'resolved',
		REJECTED = 'rejected';

	function Promise(executor) {

		if(typeof executor !== 'function') {
			console.error('Promise: executor is not function.')
		}

		self = this;

		self.status = PENDING;
		self.value = undefined;

		self.resolvedCallbacks = [];
		self.rejectedCallbacks = [];

		// resolve() and reject(), used to change Promise status, and update the promise value.
		function resolve(val) {
			self.status === RESOLVED;
			self.value = val;
			setTimeout(function() {
				for (var i = 0; i < self.resolvedCallbacks.length; i++) {
					self.resolvedCallbacks[i](val);
				}
			})
		}

		function reject(val) {
			if(self.status === PENDING) {
				self.status === REJECTED;
				self.value = val;
				setTimeout(function() {
					for (var i = 0; i < self.rejectedCallbacks.length; i++) {
						self.rejectedCallbacks[i](val);
					}
				})	
			}
		}

		try {
			executor(resolve, reject)
		} catch (e) {
			reject(val)
		}
	}

	Promise.prototype.then = function(onResolved, onRejected) {
		var self = this;

		// to fix promise值穿透
		onResolve = onResolve || function(value) { return value; }
		onRejected = onRejected || function(reason) { return reason; }

		return new Promise(function(resolve, reject) {

			var onResolvedWraper = function(val) {
				var temp = onResolved(val)
				try {
					if(Promise.isPromise(temp)) {
						temp.then(resolve, reject)
					}
					resolve(temp)
				} catch(e) {
					reject(e)
				}	
			}

			var onRejectedWraper = function(val) {
				var temp = onRejected(val);
				reject(temp)
			}

			// 无论Promise的status是什么， 都先把执行逻辑添加入待执行队列中
			self._onResolved.push(onResolvedWraper);
            self._onRejected.push(onRejectedWraper);

			if(self.status === PENDING) {
				onResolvedWraper(self.value)
			}

			if(self.status === REJECTED) {
				onRejectedWraper(self.value)
			}

		})
	}

	Promise.prototype.catch = function(onRejected) {
		this.then(null, onRejected)
	}

	// 静态方法
	// 。。。
	Promise.isPromise = function(obj) {
		return obj instanceof Promise;
	}

})(this)


// test
function fetch() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			var responseData = {
				rtnCode: 200,
				rtnMsg: 'OK'
			}
			resolve(responseData)
		}, 1000)
	})
}

function fetchData(url) {
	console.log("fetchData")
	fetch(url)
		.then(function(val) {
			console.log("responseData: ");
			console.log(val)
			return 'It\'s new then data'
		})
		.then(function(str) {
			console.log(str)
		})
		.then(function() {
			return new Promise(function(resolve, reject) {
				console.log('wait 1000ms will throw Error')
				
					setTimeout(function() {
						try {
							console.log('throw error now:')
							throw new Error('reject')
							resolve('resolv')
						} catch(e) {
							console.log('In reject branch')
							reject(e)
						}
					}, 1000)	
			})
		})
		.then(function(val) {
			console.log(val)
		})
		.catch(function(reason) {
			console.log('console error reason: ', reason)
		})
}

fetchData()

