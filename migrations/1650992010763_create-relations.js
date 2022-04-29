/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // relasi songs dengan albums
  // pgm.addConstraint('songs', 'fk_songs.albums_id_albums.id',
  // 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');

  // relasi playlist dengan users
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');

  // relasi playlist songs dengan playlist dan songs
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id');
};
