var stream = require("stream"),
    _ = require("underscore"),

    StreamNode = require("./index");

exports.StreamNode = {
  basicGraph: function (test) {
    var root = makeBasicGraph().stats(),
        passThrough,
        writable;

    test.equal(root.name, "Readable");
    test.ok(_.isObject(root.readable));
    test.ok(_.isNumber(root.readable.highWaterMark));
    test.ok(_.isUndefined(root.writable));
    test.ok(_.isArray(root.pipes));
    test.equal(root.pipes.length, 1);

    passThrough = root.pipes[0];

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
  multiPipeGraph: function (test) {
    var root = makeMultiPipeGraph().stats(),
        pipe1,
        pipe2;

    test.equal(root.name, "Readable");
    test.ok(_.isObject(root.readable));
    test.ok(_.isArray(root.pipes));
    test.equal(root.pipes.length, 2);

    pipe1 = root.pipes[0];

    test.equal(pipe1.name, "Writable");
    test.ok(_.isObject(pipe1.writable));
    test.ok(_.isNumber(pipe1.writable.highWaterMark));

    pipe2 = root.pipes[0];

    test.equal(pipe2.name, "Writable");
    test.ok(_.isObject(pipe2.writable));
    test.ok(_.isNumber(pipe2.writable.highWaterMark));

    test.done();
  },
  childrenGraph: function (test) {
    var root = makeChildrenGraph().stats(),
        childWritable;

    test.equal(root.name, "Writable");
    test.ok(_.isObject(root.writable));
    test.ok(_.isArray(root.children));
    test.equal(root.children.length, 1);

    childWritable = root.children[0];

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

function makeMultiPipeGraph () {
  var readable = new stream.Readable(),
      pipe1 = new stream.Writable(),
      pipe2 = new stream.Writable();

  readable._read = oneRead.bind(readable);
  pipe1._write = nullWritable;
  pipe2._write = nullWritable;

  readable.pipe(pipe1);
  readable.pipe(pipe2);

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

function oneRead () {
  this.push("Happy now?");
  this.push(null);
}

function nullReadable () {
  this.push(null);
}

function nullWritable (data, encoding, cb) {
  cb();
}
