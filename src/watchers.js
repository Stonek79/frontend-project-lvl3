/* eslint-disable no-param-reassign, no-console  */

import find from 'lodash/find';
import uniqueId from 'lodash/uniqueId';
import differenceBy from 'lodash/differenceBy';
import onChange from 'on-change';
import getParsedRssData from './parser.js';
import getRssData from './getter.js';
import {
  handleProcessStatus, madeErrorView, madeFeedsView, madeModalView, madePostsView,
} from './renders.js';

const state = {
  form: {
    status: 'filling',
    valid: true,
    error: '',
  },
  process: {
    status: 'idle',
    error: '',
  },
  reviewedModalId: {
    reviewed: [],
    id: '',
  },
  feeds: [],
  posts: [],
};

const handleFormState = (form) => {
  const { valid, error } = form.form;
  return valid ? null : madeErrorView(error);
};

const handleProcessState = (processState) => {
  const { status, error } = processState.process;
  switch (status) {
    case 'failed':
      madeErrorView(error);
      break;
    case 'idle':
      handleProcessStatus('loaded');
      break;
    case 'loading':
      madeErrorView('loading');
      break;
    default:
      throw new Error(`Unknown processState: ${status}`);
  }
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'process.status':
      handleProcessState(state);
      break;
    case 'reviewedModalId.id':
      madeModalView(state);
      break;
    case 'reviewedModalId.reviewed':
      madePostsView(state);
      break;
    case 'feeds':
      madeFeedsView(value);
      break;
    case 'posts':
      madePostsView(state);
      break;
    case 'form':
      handleFormState(state);
      break;
    default:
      break;
  }
});

const getPostData = (item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  return { title, description, link };
};

const handleFormEvent = (watcher, url) => {
  watcher.process.status = 'loading';
  getRssData(url)
    .then((data) => {
      const parsed = getParsedRssData(data.contents);

      const feed = {
        url, feedId: uniqueId(), title: parsed.title, description: parsed.description,
      };

      const posts = [...parsed.items]
        .map((post) => ({
          linkedId: feed.feedId, id: uniqueId(), ...getPostData(post),
        }));

      watcher.posts.unshift(...posts);
      watcher.feeds.unshift(feed);
      watcher.form = { status: 'filling', valid: true, error: null };
      watcher.process.status = 'idle';
    })
    .catch((err) => {
      watcher.process.error = err.message;
      watcher.process.status = 'failed';
    });
};

const watchAddedFeeds = (watcher) => {
  const { feeds, posts } = watcher;
  const links = feeds.map((feed) => feed.url);
  const postsPromises = links.map((link) => {
    const commonFeedId = find(feeds, ['url', link]).feedId;
    const commonPosts = posts.filter((post) => post.linkedId === commonFeedId);
    return getRssData(link)
      .then((commonRssLinkData) => {
        const rssParsedData = getParsedRssData(commonRssLinkData.contents);
        const newParsedPosts = [...rssParsedData.items]
          .map((post) => ({
            linkedId: commonFeedId, ...getPostData(post),
          }));
        const diffPosts = differenceBy(newParsedPosts, commonPosts, 'link')
          .map((p) => ({ ...p, id: uniqueId() }));
        watcher.posts.unshift(...diffPosts);
      });
  });
  Promise.all(postsPromises).finally(setTimeout(() => watchAddedFeeds(watcher), 5000));
};

export {
  watchAddedFeeds, getPostData, handleFormEvent, watchedState,
};
