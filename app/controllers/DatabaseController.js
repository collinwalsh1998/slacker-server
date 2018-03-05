//packages
let mongoose = require("mongoose");

module.exports.connect = function(url) {
	return new Promise(function(resolve, reject) {
		mongoose.connect(url, function(error) {
			if(error) {
				return reject(error);
			}

			return resolve();
		});
	});
}

module.exports.close = function() {
	return new Promise(function(resolve, reject) {
		mongoose.connection.close(function(error, response) {
			if(error) {
				return reject(error);
			}

			return resolve();
		});
	});
}