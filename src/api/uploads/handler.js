const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(albumsService, service, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;
    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postUploadCoverHandler(request, h) {
    try {
      const { cover } = request.payload;
      this._validator.validateImageHeaders(cover.hapi.headers);
      const { id } = request.params;
      const prevCover = await this._albumsService.getCoverAlbum(id);
      const filename = await this._service.writeFile(cover, cover.hapi);
      if (prevCover !== null) {
        this._service.deleteFile(filename);
      }
      await this._albumsService.editCoverAlbum(id, filename);
      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = UploadsHandler;
