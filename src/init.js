/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import find from 'lodash/find';
import differenceBy from 'lodash/differenceBy';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId';
import axios from 'axios';
import parseRssContent from './parser.js';
import resources from './locales/resources.js';
import locales from './locales/yuplocales.js';
import watchState from './watchers.js';
import { formStatus, processStatus } from './constants.js';

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const loadRss = (watcher, url) => {
  watcher.process.status = processStatus.loading;
  const urlWithProxy = addProxy(url);
  return axios(urlWithProxy)
    .then((rssContent) => {
      const parsed = parseRssContent(rssContent.data.contents);
      const { feed, posts } = parsed;
      const finalFeed = { ...feed, url, feedId: uniqueId() };
      const finalPosts = posts.map((post) => ({ ...post, linkedId: feed.feedId, id: uniqueId() }));

      watcher.posts.unshift(...finalPosts);
      watcher.feeds.unshift(finalFeed);
      watcher.form = { status: formStatus.filling, valid: true, error: null };
      watcher.process.status = processStatus.idle;
    })
    .catch((err) => {
      console.error(err);
      watcher.process.error = err.message === 'dataError' ? 'dataError' : 'netError';
      watcher.process.status = processStatus.failed;
    });
};

const watchAddedFeeds = (watcher) => {
  const { feeds, posts } = watcher;
  const feedsUrls = feeds.map((feed) => feed.url);
  const getNewPosts = feedsUrls.map((url) => {
    const urlWithProxy = addProxy(url);
    return axios(urlWithProxy)
      .then((commonRssContent) => {
        const newContent = commonRssContent.data.contents;
        const commonFeedId = find(feeds, ['url', url]).feedId;
        const parsedRssContent = parseRssContent(newContent);
        const getDiffPosts = differenceBy(parsedRssContent.posts, posts, 'postLink')
          .map((post) => ({ ...post, linkedId: commonFeedId, id: uniqueId() }));
        watcher.posts.unshift(...getDiffPosts);
      })
      .catch((err) => console.error(err));
  });
  Promise.all(getNewPosts).finally(() => setTimeout(() => watchAddedFeeds(watcher), 5000));
};

const validateUrl = (url, feeds) => {
  const links = feeds.map((feed) => feed.url);
  const schema = yup.string().url().notOneOf(links).required();
  try {
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err.message;
  }
};

export default () => {
  const state = {
    viewedPostIds: new Set([]),
    modalId: '',
    feeds: [],
    posts: [],
    form: {
      status: formStatus.filling,
      valid: true,
      error: '',
    },
    process: {
      status: processStatus.idle,
      error: '',
    },
  };

  yup.setLocale(locales);

  const watchElements = {
    rssSubmitButton: document.querySelector('[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    feedbackElement: document.querySelector('.feedback'),
    rssSubmitForm: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    postsContainer: document.querySelector('.posts'),
  };

  const watcher = watchState(state, watchElements);

  i18next
    .init({
      lng: 'en',
      debug: false,
      resources,
    })
    .then(() => {
      watchElements.rssSubmitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const validationError = validateUrl(url, watcher.feeds);
        if (validationError) {
          watcher.form = { status: formStatus.failed, valid: false, error: validationError };
        } else {
          watcher.form = { status: formStatus.filling, valid: true, error: null };
          loadRss(watcher, url);
        }
      });

      watchElements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        watcher.viewedPostIds.add(id);
        watcher.modalId = id;
      });
    });
  setTimeout(() => watchAddedFeeds(watcher), 5000);
};
