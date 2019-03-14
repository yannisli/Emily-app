
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req,res,next)).catch(next);
};

exports.catchAsyncMiddleware = catchAsync;