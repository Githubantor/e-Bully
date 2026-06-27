exports.success = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

exports.created = (res, data) => {
  res.status(201).json(data);
};

exports.noContent = (res) => {
  res.status(204).end();
};
