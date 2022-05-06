const albumModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover === null ? null : `http://${process.env.HOST}:${process.env.PORT}/upload/images/${cover}`,
});

module.exports = albumModel;
