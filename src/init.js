/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './resources.js';
import { watchAddedFeeds, handleFormEvent, watchedState } from './watchers.js';

export default () => {
  yup.setLocale({
    mixed: {
      default: 'ValidationError',
      notOneOf: 'alreadyExist',
    },
    string: {
      url: 'mustValid',
    },
  });

  const watchingElements = {
    form: document.querySelector('.rss-form'),
    postsContainer: document.querySelector('.posts'),
  };

  i18next
    .init({
      lng: 'en',
      debug: false,
      resources,
    })
    .then(() => {
      const validateLink = (link, feeds) => {
        const links = [...feeds].map((feed) => feed.url);
        const schema = yup.string().url().notOneOf(links).required();
        try {
          schema.validateSync(link);
        } catch (err) {
          return err.message;
        }
        return null;
      };

      watchingElements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const commonLink = formData.get('url');
        const validationResult = validateLink(commonLink, watchedState.feeds);
        if (validationResult) {
          watchedState.form = { status: 'failed', valid: false, error: validationResult };
        } else {
          watchedState.form = { status: 'filling', valid: true, error: null };
          handleFormEvent(watchedState, commonLink);
        }
      });

      watchingElements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        watchedState.reviewedModalId.reviewed.push(id);
        watchedState.reviewedModalId.id = id;
      });

      setTimeout(() => watchAddedFeeds(watchedState), 5000);
    });
};
