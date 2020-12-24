/* eslint-disable no-param-reassign, no-console  */

import * as yup from 'yup';
import parser from './parser.js';
import getter from './getter.js';

const schema = yup.string().url();

const hasRss = (link, links) => links.filter((l) => l === link).length !== 0;

export const formStatusHandler = (formStatus, watchedState) => {
  if (formStatus === 'filling') return;
  const { links } = watchedState;
  const { link } = watchedState.form;
  if (link === '') {
    watchedState.error = 'emptyInput';
  } else if (!schema.isValidSync(link)) {
    watchedState.error = 'mastValid';
  } else if (hasRss(link, links)) {
    watchedState.error = 'alreadyExist';
  } else {
    watchedState.processState = 'inProgress';
  }
  watchedState.form.status = 'filling';
};

const rssDataParser = (url, watchedState) => getter(url)
  .then((el) => {
    let idCount = watchedState.posts.length === 0
      ? 1 : Math.max(...watchedState.posts.map((post) => post.id)) + 1;
    const feedId = idCount;
    const parsedRssData = parser(el.contents);
    const ftitle = parsedRssData.querySelector('title').textContent;
    const fdescription = parsedRssData.querySelector('description').textContent;
    const postContent = parsedRssData.querySelectorAll('item');
    const feed = { feedId, ftitle, fdescription };
    idCount += 1;
    const commonPosts = [];
    postContent.forEach((post) => {
      const id = idCount;
      const ptime = post.querySelector('pubDate').textContent;
      const link = post.querySelector('link').textContent;
      const ptitle = post.querySelector('title').textContent;
      const pdescription = post.querySelector('description').textContent;
      commonPosts.push({
        id, ptitle, pdescription, link, ptime: Date.parse(ptime), font: 'bold', feedId,
      });
      idCount += 1;
    });
    return { feed, commonPosts };
  })
  .catch((err) => err);

const newRssParser = (url, watchedState) => rssDataParser(url, watchedState)
  .then((rssData) => {
    const { feed, commonPosts } = rssData;
    watchedState.posts.unshift(...commonPosts);
    watchedState.feeds.unshift(feed);
    watchedState.form.link = '';
    watchedState.links.push(url);
    watchedState.processState = 'idle';
  })
  .catch(() => {
    watchedState.error = 'mastHaveRSS';
    watchedState.processState = 'failed';
  });

const runRssWatcher = (watchedState) => {
  const { links, posts } = watchedState;
  links.forEach((link) => {
    const postsTime = [...posts].flatMap((post) => post.ptime);
    const latestPostTime = Math.max(...postsTime);
    rssDataParser(link, watchedState).then((rssData) => {
      const { commonPosts } = rssData;
      const latestPosts = [...commonPosts].filter((post) => post.ptime > latestPostTime);
      watchedState.posts.unshift(...latestPosts);
    });
  });
  setTimeout(() => runRssWatcher(watchedState), 5000);
};

export const processStateHandler = (processState, watchedState) => {
  const url = watchedState.form.link;
  switch (processState) {
    case 'inProgress':
      newRssParser(url, watchedState);
      break;
    case 'idle':
      setTimeout(() => runRssWatcher(watchedState), 5000);
      break;
    case 'failed':
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};
