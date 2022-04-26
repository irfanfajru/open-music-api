const ServerErrorResponse = ({ response }) => {
  response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  }).code(500);
};

module.exports = ServerErrorResponse;
