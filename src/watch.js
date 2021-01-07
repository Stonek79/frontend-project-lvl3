/* eslint-disable no-param-reassign, no-console  */

import * as yup from 'yup';
import set from 'lodash/set';
import parser from './parser.js';
import getter from './getter.js';

const schema = yup.string().url();

const hasRss = (link, links) => links.filter((l) => l === link).length !== 0;

const formStatusHandler = (link, watchedState) => {
  if (watchedState.form.status === 'filling') return;
  const { links } = watchedState;
  if (link === '') {
    watchedState.error = 'emptyInput';
  } else if (!schema.isValidSync(link)) {
    watchedState.error = 'mustValid';
  } else if (hasRss(link, links)) {
    watchedState.error = 'alreadyExist';
  } else {
    watchedState.processState = 'inProgress';
  }
  watchedState.form.status = 'filling';
};

const addNewRss = (url, watchedState, data) => {
  const commonId = watchedState.posts.length === 0 ? 1
    : Math.max(...watchedState.posts.map((post) => post.id)) + 1;
  const rssParsedData = parser(data.contents, commonId);
  const { feed, commonPosts } = rssParsedData;
  watchedState.posts.unshift(...commonPosts);
  watchedState.feeds.unshift(feed);
  watchedState.links.push(url);
  watchedState.processState = 'idle';
};

const runRssWatcher = (watchedState) => {
  const { links, posts } = watchedState;
  const postsPromises = links.map((link) => {
    const postsTime = [...posts].flatMap((post) => post.ptime);
    const latestPostTime = Math.max(...postsTime);
    const lastId = Math.max(...watchedState.posts.map((post) => post.id)) + 1;
    return getter(link)
      .then((commonRssLinkData) => parser(commonRssLinkData.contents, lastId[0]))
      .then((rssParsedData) => {
        const { commonPosts } = rssParsedData;
        const latestPosts = [...commonPosts].filter((post) => post.ptime > latestPostTime);
        watchedState.posts.unshift(...latestPosts);
      })
      .catch((err) => err);
  });
  Promise.all(postsPromises).finally(setTimeout(() => runRssWatcher(watchedState), 5000));
};

const madeNormalLinkFont = (id, posts) => posts
  .map((post) => (post.id === +id ? set(post, 'font', 'normal') : post));

export {
  addNewRss, formStatusHandler, madeNormalLinkFont, runRssWatcher,
};
