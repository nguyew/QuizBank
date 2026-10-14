// Chỉ lấy các field nằm trong danh sách cho phép (và thực sự có trong obj).
// Dùng để chặn client ghi đè field không được phép như author, _id, questions...
module.exports = (obj, allowedKeys) =>
    Object.fromEntries(
        allowedKeys
            .filter((key) => Object.hasOwn(obj ?? {}, key))
            .map((key) => [key, obj[key]])
    );