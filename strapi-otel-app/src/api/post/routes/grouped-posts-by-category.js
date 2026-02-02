module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/grouped-posts-by-category',
      handler: 'api::post.post.listGroupedPostsByCategory',
    },
  ],
};
