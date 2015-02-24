var stream = require("stream"),
    _ = require("underscore"),

    StreamNode = require("./index");

exports.StreamNode = {
  basicGraph: function (test) {
    var graph = makeBasicGraph().stats(),
        passThrough,
        writable;

    test.equal(graph.name, "Readable");
    test.ok(_.isObject(graph.readable));
    test.ok(_.isNumber(graph.readable.highWaterMark));
    test.ok(_.isUndefined(graph.writable));
    test.ok(_.isArray(graph.pipes));
    test.equal(graph.pipes.length, 1);

    passThrough = graph.pipes[0];

    test.equal(passThrough.name, "PassThrough");
    test.ok(_.isObject(passThrough.writable));
    test.ok(_.isNumber(passThrough.writable.highWaterMark));
    test.ok(_.isObject(passThrough.readable));
    test.ok(_.isNumber(passThrough.readable.highWaterMark));
    test.ok(_.isObject(passThrough.transform));
    test.ok(_.isBoolean(passThrough.transform.needTransform));
    test.ok(_.isArray(passThrough.pipes));
    test.equal(passThrough.pipes.length, 1);

    writable = passThrough.pipes[0];

    test.equal(writable.name, "Writable");
    test.ok(_.isObject(writable.writable));
    test.ok(_.isNumber(writable.writable.highWaterMark));
    test.ok(_.isUndefined(writable.readable));
    test.ok(_.isUndefined(writable.pipes));

    test.done();
  },
  childrenGraph: function (test) {
    var graph = makeChildrenGraph().stats(),
        childWritable;

    test.equal(graph.name, "Writable");
    test.ok(_.isObject(graph.writable));
    test.ok(_.isArray(graph.children));
    test.equal(graph.children.length, 1);

    childWritable = graph.children[0];

    test.equal(childWritable.name, "Writable");
    test.ok(_.isObject(childWritable.writable));
    test.ok(_.isNumber(childWritable.writable.highWaterMark));

    test.done();
  },
};

// Makes a graph with all possible Stream types, excluding Transform and Duplex
// since Transform itself is both of those.
function makeBasicGraph () {
  var readable = new stream.Readable(),
      passThrough = new stream.PassThrough(),
      writable = new stream.Writable();

  readable._read = nullReadable.bind(readable);
  writable._write = nullWritable;

  readable.pipe(passThrough).pipe(writable);

  return new StreamNode(readable);
}

function makeChildrenGraph () {
  var parentWritable = new stream.Writable(),
      childWritable = new stream.Writable();

  parentWritable._write = childWritable.write.bind(childWritable);

  parentWritable._children = function () {
    return [childWritable];
  };

  childWritable._write = nullWritable;

  parentWritable.write("HAHA");

  return new StreamNode(parentWritable);
}

function nullReadable () {
  this.push(null);
}

function nullWritable (data, encoding, cb) {
  cb();
}
