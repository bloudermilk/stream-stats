# Stream Stats for NodeJS

Stream Stats makes debugging and profiling NodeJS streams easy. Given a complex
graph of streams passing data to each other, Stream Stats can help you identify
bottlenecks and debug stalled streams.

## Documentation

Sorry, I haven't documented the package yet. Please see `tests.js` for examples.

## Caveat emptor

The current state of this project comes with the caveat that it will only
produce a partial graph (tree) starting from a single Readable stream (root).
This was fine for the initial use case where we had a single Readable stream
which had an arbitrarily deep tree of streams. Ideally we would employ such an
algorithm that could produce and monitor a complete directed graph of streams.
Pull requests are gladly accepted :)
