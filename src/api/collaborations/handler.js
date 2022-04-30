const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(playlistsService, usersService, collaborationsService, validator) {
    this._playlistsService = playlistsService;
    this._collaborationsService = collaborationsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      await this._validator.validatePostCollaborationPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { userId: owner } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      const user = await this._usersService.getUserById(userId);
      const colabId = await this._collaborationsService.addCollaboration(playlistId, user.id);
      const response = h.response({
        status: 'success',
        data: {
          collaborationId: colabId,
        },
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

      // server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      await this._validator.validatePostCollaborationPayload(request.payload);
      const { playlistId, userId } = request.payload;
      const { userId: owner } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(playlistId, owner);
      const user = await this._usersService.getUserById(userId);
      await this._collaborationsService.deleteCollaboration(playlistId, user.id);
      return {
        status: 'success',
        message: 'Collaborator berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;
