/* eslint-disable no-param-reassign, no-console  */

import * as yup from 'yup';
import set from 'lodash/set';
import parser from './parser.js';
import getRssData from './getter.js';

const schema = yup.string().url();

const hasRss = (link, links) => links.filter((l) => l === link).length !== 0;

const formStatusErrorCatcher = (link, watchedState) => {
  if (watchedState.form.status === 'filling') return;
  const { links } = watchedState;
  if (link === '') {
    watchedState.error.unshift('emptyInput');
  } else if (!schema.isValidSync(link)) {
    watchedState.error.unshift('mustValid');
  } else if (hasRss(link, links)) {
    watchedState.error.unshift('alreadyExist');
  } else {
    watchedState.processState = 'inProgress';
  }
  watchedState.form.status = 'filling';
};

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
  formStatusErrorCatcher, madeNormalLinkFont, addedFeedsWatcher,
};
