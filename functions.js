//functions.js


//========mysql connection=======\\

var mysql = require('mysql'), 
	bcrypt = require('bcryptjs'),
	Q = require('q');

var async = require('async');

var mysql_connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'da'
});
mysql_connection.connect();


//========mysql queries / functions=====\\
exports.getPoetry = function(callback) {
	var deferred = Q.defer();
	var poetryQuery = mysql_connection.query('SELECT * FROM poetry;', function(err, poems) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			if (poems) {
				callback(null, poems);
			} else {
				console.log('no poems were found.');
				callback(null, poems);
			};
		}
	});
}

exports.createPoem = function(title, body, callback) {
	var deferred = Q.defer();
	var insertPoemQuery = mysql_connection.query('INSERT INTO poetry (title, body) VALUES (?,?)', [title, body], function(err) {
		if (err) {
			console.log(err);
			console.log(insertPoemQuery);
			callback(err);
		} else {
			console.log('sucessfully added poem!');
			callback(null);
		}
	});
};
//==========user functions===============\\
function selectSingle(table, keyName, key, callback) {
	keyString = "'" + key + "'";
	var queryString = 'select * from ' + table + ' where ' + keyName + ' = ' + keyString + ';';
	var query = mysql_connection.query(queryString, function(err,result){
	console.log(query.sql);
	if (err) {
		console.error(err);
		return;
	}
	console.log('printing selectSingle result...');
	console.log(result);
	callback(result);
});}

function insertSingle(table, object, callback) {
	var queryString = 'insert into ' + table + ' set ?';
	var query = mysql_connection.query('insert into ' + table + ' set ?', object, function(err, result) {
		console.log(query.sql);
		if (err) {
			console.log(err);
			return;
		}
		console.log('successfully inserted the row into the table.');
		console.log(result);
		//callback(result);
	});
}

//used in local-signup strategy
exports.localReg = function (username, password, callback) {
  var deferred = Q.defer();
  var hash = bcrypt.hashSync(password, 8);
  var user = {
    "username": username,
    "password": hash
  }
  //check if username is already assigned in our database
 var userMatch = selectSingle('users','username', user.username, function(result){
 console.log('selectSingleResults'); console.log(result);
  if (result.length > 0) {
	console.log('username already exists');
	callback(new Error('username already exists'));
  } else {
      console.log('Username is free for use');
      insertSingle('users', user);
      console.log("USER: " + user.username);
      callback(null, user);
  };
});
}

//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password, callback) {
  var deferred = Q.defer();
  var hashPass = bcrypt.hashSync(password, 8);
  var userMatch = selectSingle('users','username',username, function(result) {
  if (result.length > 0) {
    console.log("FOUND USER");
    var hash = result[0].password;
    console.log(hash);
    console.log(bcrypt.compareSync(hashPass, hash));
    if (bcrypt.compareSync(password, hash)) {
      callback(null, result[0]);
    } else {
      console.log("PASSWORDS NOT MATCH");
      callback(new  Error('passwords do not match'));
    }
  } else {
          console.log("Cant find user");
          callback(new Error('cant find user'));
    };
});
};