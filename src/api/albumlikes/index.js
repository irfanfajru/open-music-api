const AlbumLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albumlikes',
  version: '1.0.0',
  register: async (server, { albumsService, service }) => {
    const albumLikesHandler = new AlbumLikesHandler(albumsService, service);
    server.route(routes(albumLikesHandler));
  },
};
