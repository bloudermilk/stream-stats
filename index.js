var _ = require("underscore");

module.exports = StreamNode;

function StreamNode (node) {
  this.node = node;
}

StreamNode.prototype.stats = function () {
  return _.omit({
    name: this.nodeName(),
    readable: this.readableStats(),
    writable: this.writableStats(),
    transform: this.transformStats(),
    pipes: this.pipesStats(),
    children: this.childrenStats(),
  }, _.isUndefined);
};

StreamNode.prototype.nodeName = function () {
  return this.node.constructor.name;
};

StreamNode.prototype.readableStats = function () {
  if (this.node._readableState) return _.pick(this.node._readableState, isStat);
};

StreamNode.prototype.writableStats = function () {
  if (this.node._writableState) return _.pick(this.node._writableState, isStat);
};

StreamNode.prototype.transformStats = function () {
  if (this.node._transformState) return _.pick(this.node._transformState, isStat);
};

StreamNode.prototype.pipesStats = function () {
  var pipes;

  // Not Readable, no pipes could possibly exist
  if (!this.node._readableState) return;

  if (!this.node._readableState.pipes) pipes = [];
  else if (_.isObject(this.node._readableState.pipes)) pipes = [this.node._readableState.pipes];
  else if (_.isArray(this.node._readableState.pipes)) pipes = this.node._readableState.pipes;
  else throw "Unexpected value for _readableState.pipes";

  return _.map(pipes, streamToStats);
};

StreamNode.prototype.childrenStats = function () {
  if (!_.isFunction(this.node._children)) return;

  return _.map(this.node._children(), streamToStats);
};

// A value is a stat if it is a boolean or number
function isStat (value) {
  return _.isBoolean(value) || _.isNumber(value);
}

function streamToStats (stream) {
  return new StreamNode(stream).stats();
}
