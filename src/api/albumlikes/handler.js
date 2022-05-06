const ClientError = require('../../exceptions/ClientError');

class AlbumLikesHandler {
  constructor(albumsService, service) {
    this._albumsService = albumsService;
    this._service = service;

    this.postAlbumLikesHandler = this.postAlbumLikesHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumLikesHandler(request, h) {
    try {
      const { id } = request.params;
      const { userId } = request.auth.credentials;
      await this._albumsService.getAlbumById(id);
      const result = await this._service.addOrdeleteAlbumLikeIfExists(id, userId);
      const response = h.response({
        status: 'success',
        message: result,
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
      // server error
      const response = h.response({
        status: 'error',
        message: 'Maaf,terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async getAlbumLikesHandler(request, h) {
    try {
      const { id } = request.params;
      await this._albumsService.getAlbumById(id);
      const result = await this._service.getAlbumLikes(id);
      const response = h.response({
        status: 'success',
        data: {
          likes: result.likes,
        },
      });
      if (result.isFromCache) {
        response.header('X-Data-Source', 'cache');
      }
      response.code(200);
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
      // server error
      const response = h.response({
        status: 'error',
        message: 'Maaf,terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AlbumLikesHandler;
