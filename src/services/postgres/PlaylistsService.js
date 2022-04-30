const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1,$2,$3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: 'SELECT playlists.id,playlists.name,users.username FROM playlists LEFT JOIN users ON playlists.owner=users.id LEFT JOIN collaborations ON playlists.id=collaborations.playlist_id WHERE collaborations.user_id =$1 OR playlists.owner=$1',
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: 'SELECT playlists.*,users.username FROM playlists LEFT JOIN users ON playlists.owner=users.id where playlists.id=$1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async verifyPlaylistOwner(playlistId, credentialId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id=$1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    if (result.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, credentialId) {
    const query = {
      text: 'SELECT playlists.id,playlists.owner,collaborations.user_id as collaborator_id FROM playlists LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id WHERE playlists.id =$1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== credentialId || result.rows[0].collaborator_id !== credentialId) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id=$1 RETURNING id',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Song gagal di tambahkan pada playlist');
    }
  }

  async getPlaylistSongs(playlistId) {
    const playlist = await this.getPlaylistById(playlistId);
    const query = {
      text: 'SELECT songs.id,songs.title,songs.performer FROM playlist_songs LEFT JOIN songs ON playlist_songs.song_id=songs.id WHERE playlist_songs.playlist_id=$1',
      values: [playlistId],
    };
    const songs = await this._pool.query(query);
    const result = {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: songs.rows,
    };
    return result;
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Song gagal dihapus dari playlist');
    }
  }
}

module.exports = PlaylistsService;
