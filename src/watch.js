/* eslint-disable no-param-reassign, no-console  */

import * as yup from 'yup';
import parser from './parser.js';
import getter from './getter.js';

const schema = yup.string().url();

const hasRss = (link, links) => links.filter((l) => l === link).length !== 0;

export const catchError = (watchedState) => {
  const { links } = watchedState;
  const { link } = watchedState.form;
  const err = [];
  if (link === '') {
    err.push('emptyInput');
  } else if (!schema.isValidSync(link)) {
    err.push('mastValid');
  } else if (hasRss(link, links)) {
    err.push('alreadyExist');
  }
  if (err.length !== 0) {
    watchedState.error = [...err];
  } else {
    watchedState.processState = 'inProcess';
  }
  watchedState.form.status = 'filling';
};

let idCount = 1;
export const parse = (url, watchedState) => {
  const feedId = idCount;
  return getter(url).then((el) => {
    const parsedRssData = parser(el.contents);
    const ftitle = parsedRssData.querySelector('title').textContent;
    const fdescription = parsedRssData.querySelector('description').textContent;
    const postContent = parsedRssData.querySelectorAll('item');
    const feed = { feedId, ftitle, fdescription };
    idCount += 1;
    const commonPosts = [];
    postContent.forEach((post) => {
      const id = idCount;
      const link = post.querySelector('link').textContent;
      const ptitle = post.querySelector('title').textContent;
      const pdescription = post.querySelector('description').textContent;
      commonPosts.push({
        id, ptitle, pdescription, link,
      });
      idCount += 1;
    });
    watchedState.posts.unshift({ [feedId]: [...commonPosts] });
    watchedState.feeds.unshift(feed);
    watchedState.form.link = '';
    watchedState.links.push(url);
    watchedState.processState = 'idle';
  })
    .catch(() => {
      watchedState.error = 'mastHaveRSS';
      watchedState.processState = 'cancelled';
    });
};
