const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
  },
  {
    mehtod: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
  },
];
module.exports = routes;
