const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class AlbumsLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addOrdeleteAlbumLikeIfExists(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id=$1 AND album_id=$2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    await this._cacheService.delete(`albumlikes:${albumId}`);
    if (!result.rows.length) {
      const id = `album-like-${nanoid(16)}`;
      const queryAdd = {
        text: 'INSERT INTO user_album_likes VALUES($1,$2,$3) RETURNING id',
        values: [id, userId, albumId],
      };
      const resultAdd = await this._pool.query(queryAdd);
      if (!resultAdd.rows.length) {
        throw new InvariantError('Gagal menyukai album');
      }
      return 'Berhasil menyukai album';
    }

    const queryDelete = {
      text: 'DELETE FROM user_album_likes WHERE user_id=$1 AND album_id=$2 RETURNING id',
      values: [userId, albumId],
    };
    const resultDelete = await this._pool.query(queryDelete);
    if (!resultDelete.rows.length) {
      throw new InvariantError('Gagal batal menyukai album');
    }
    return 'Berhasil batal menyukai album';
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`albumlikes:${albumId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id=$1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const mappedResult = {
        likes: result.rows.length,
        isFromCache: true,
      };
      await this._cacheService.set(`albumlikes:${albumId}`, JSON.stringify(mappedResult));
      return {
        likes: result.rows.length,
        isFromCache: false,
      };
    }
  }
}

module.exports = AlbumsLikesService;
