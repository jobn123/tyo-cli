'use strict';

const path = require('path');

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function fomartPath(p) {
    if (p && typeof p === 'string') {
        const sep = path.sep;
        return sep === '/' ? p : p.replace(/\//g, '/');
    }
    return null;
}

module.exports = {
    isObject,
    fomartPath
}