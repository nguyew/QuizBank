// Gom việc xử lý lỗi về một chỗ: mọi lỗi được trả về dạng JSON { message }.
// Express 5 tự chuyển promise bị reject trong handler async tới đây,
// nên controller không cần try/catch riêng.

// Lỗi của passport-local-mongoose (nhận biết qua err.name)
const STATUS_BY_NAME = {
    MissingUsernameError: 400,
    MissingPasswordError: 400,
    UserExistsError: 409
};

// Route không tồn tại -> 404 dạng JSON (thay vì trang HTML mặc định)
exports.notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    let status = err.status || err.statusCode || 500; // body-parser (JSON hỏng) đã có sẵn status 400
    let message = err.message;
    let errors;

    if (err.name === 'ValidationError' && err.errors) {
        // Mongoose: dữ liệu gửi lên không hợp lệ
        status = 400;
        errors = {};
        for (const [field, e] of Object.entries(err.errors)) errors[field] = e.message;
        message = Object.values(errors).join('; ');
    } else if (err.name === 'CastError') {
        // Ví dụ: id không đúng định dạng ObjectId
        status = 400;
        message = `Invalid ${err.path}: ${err.stringValue ?? err.value}`;
    } else if (err.code === 11000) {
        // MongoDB: vi phạm unique index
        status = 409;
        const fields = Object.keys(err.keyValue ?? {}).join(', ');
        message = fields ? `Duplicate value for: ${fields}` : 'Duplicate value';
    } else if (STATUS_BY_NAME[err.name]) {
        status = STATUS_BY_NAME[err.name];
    }

    if (status >= 500) {
        console.error(err);
        if (process.env.NODE_ENV === 'production') message = 'Internal Server Error';
    }

    res.status(status).json(errors ? { message, errors } : { message });
};