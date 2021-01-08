/* eslint-disable no-param-reassign, no-console  */

import set from 'lodash/set';
import parser from './parser.js';
import getRssData from './getter.js';

const addedFeedsWatcher = (watchedState) => {
  const { links, posts } = watchedState;
  const postsPromises = links.map((link) => {
    const postsTime = [...posts].flatMap((post) => post.ptime);
    const latestPostTime = Math.max(...postsTime);
    const lastId = Math.max(...watchedState.posts.map((post) => post.id)) + 1;
    return getRssData(link)
      .then((commonRssLinkData) => parser(commonRssLinkData.contents, lastId[0]))
      .then((rssParsedData) => {
        const { commonPosts } = rssParsedData;
        const latestPosts = [...commonPosts].filter((post) => post.ptime > latestPostTime);
        watchedState.posts.unshift(...latestPosts);
      });
  });
  Promise.all(postsPromises).finally(setTimeout(() => addedFeedsWatcher(watchedState), 5000));
};

const madeNormalLinkFont = (id, posts) => posts
  .map((post) => (post.id === +id ? set(post, 'font', 'normal') : post));

export {
  madeNormalLinkFont, addedFeedsWatcher,
};
