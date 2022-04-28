const ClientError = require('../../exceptions/ClientError');
const ServerErrorResponse = require('../../utils/ServerErrorResponse');

class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { userId: credentialId } = request.auth.payload;
      const playlistId = await this._playlistsService.addPlaylist(name, credentialId);
      const response = h.response({
        status: 'success',
        data: {
          playlistId,
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
      return ServerErrorResponse(h);
    }
  }

  async getPlaylistsHandler(request, h) {
    try {
      const { userId: credentialId } = request.auth.payload;
      const playlists = await this._playlistsService.getPlaylists(credentialId);
      return {
        status: 'success',
        data: {
          playlists,
        },
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
      return ServerErrorResponse(h);
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { userId: credentialId } = request.auth.payload;
      const { id } = request.params;
      await this._playlistsService.verifyPlaylistOwner(id, credentialId);
      await this._playlistsService.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
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
      return ServerErrorResponse(h);
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostPlaylistSongPayload(request.payload);
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { userId: credentialId } = request.auth.payload;
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const song = await this._songsService.getSongById(songId);
      await this._playlistsService.addPlaylistSong(playlistId, song.id);
      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan pada playlist',
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
      return ServerErrorResponse(h);
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { userId: credentialId } = request.auth.payload;
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const playlist = await this._playlistsService.getPlaylistSongs(playlistId);
      return {
        status: 'success',
        data: {
          playlist,
        },
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
      return ServerErrorResponse(h);
    }
  }

  async deletePlaylistSongHandler(request, h) {
    try {
      await this._validator.validateDeletePlaylistSongPayload(request.payload);
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      const { userId: credentialId } = request.auth.payload;
      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      const song = await this._songsService.getSongById(songId);
      await this._playlistsService.deletePlaylistSong(playlistId, song.id);
      return {
        status: 'success',
        message: 'Song berhasil dihapus dari playlist',
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
      return ServerErrorResponse(h);
    }
  }
}

module.exports = PlaylistsHandler;
