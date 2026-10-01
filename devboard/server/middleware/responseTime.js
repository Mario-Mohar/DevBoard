// Stamps every response with how long it took to produce.
//
// The measurement has to land after the route has run but before the headers
// leave, so it happens in a wrapped writeHead. Setting the header up front,
// next to the timestamp it is computed from, would always report 0ms, and
// res.on("finish") is too late: by then the headers are already on the wire.
//
// The clock is process.hrtime, not Date.now, so a clock adjustment while a
// request is in flight cannot turn a duration negative.
const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint();
  const writeHead = res.writeHead;

  res.writeHead = function (...args) {
    if (!res.headersSent) {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      res.setHeader("X-Response-Time", `${ms.toFixed(1)}ms`);
    }
    return writeHead.apply(this, args);
  };

  next();
};

module.exports = responseTime;
