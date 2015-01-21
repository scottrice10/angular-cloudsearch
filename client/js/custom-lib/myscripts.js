function shuffle(items) {
  var cached = items.slice(0), temp, i = cached.length, rand;
  while(--i) {
    rand = Math.floor(i * Math.random());
    temp = cached[rand];
    cached[rand] = cached[i];
    cached[i] = temp;
  }
  return cached;
}

if(typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.slice(0, str.length) == str;
  };
}

if(typeof String.prototype.trim != 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

if(typeof String.prototype.splitOnFirst != 'function') {
  String.prototype.splitOnFirst = function(str) {
    var d = this.indexOf(str);
    if(0 > d)return this;
    else {
      return [this.substr(0, d), this.substr(d + str.length)];
    }
  };
}
/**
 * Source: http://stackoverflow.com/a/22129960/2706988
 */
Object.resolve = function(path, obj) {
  if(!path || !obj) {
    throw new Error('path, obj is required');
  }
  return [obj].concat(path.split('.')).reduce(function(prev, curr) {
    return prev[curr];
  });
};