'use strict';

let counter=0;

function logger(req, res, next){
    console.log('Request' + ++counter + ' - ' + req.method + ' ' + req.path + ' - ' + new Date().toLocaleDateString() +' '+ new Date().toLocaleTimeString());
    next();
}

module.exports = logger;