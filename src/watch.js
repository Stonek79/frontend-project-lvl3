/* eslint-disable no-param-reassign, no-console  */

import set from 'lodash/set';
import differenceBy from 'lodash/differenceBy';
import parser from './parser.js';
import getRssData from './getter.js';

const addedFeedsWatcher = (watchedState) => {
  const { feeds, posts } = watchedState;
  const links = feeds.map((feed) => feed.commonLink);
  const postsPromises = links.map((link) => {
    const lastId = feeds.length + posts.length;
    return getRssData(link)
      .then((commonRssLinkData) => parser(commonRssLinkData.contents, lastId, link))
      .then((rssParsedData) => {
        const newParsedPosts = rssParsedData.posts;
        const latestPosts = differenceBy(posts, newParsedPosts, 'link');
        watchedState.posts.unshift(...latestPosts);
      });
  });
  Promise.all(postsPromises).finally(setTimeout(() => addedFeedsWatcher(watchedState), 5000));
};

const madeNormalLinkFont = (id, posts) => posts
  .map((post) => (post.id === +id ? set(post, 'isReviewed', true) : post));

export {
  madeNormalLinkFont, addedFeedsWatcher,
};
