export default (rssContent) => {
  const domparser = new DOMParser();
  const parsedRssContent = domparser.parseFromString(rssContent, 'application/xml');

  const error = parsedRssContent.querySelector('parsererror');
  if (error) {
    throw new Error('dataError');
  }

  const feedTitleElement = parsedRssContent.querySelector('channel > title');
  const feedDescriptionElement = parsedRssContent.querySelector('channel > description');
  const feedTitle = feedTitleElement.textContent;
  const feedDescription = feedDescriptionElement.textContent;

  const postElements = parsedRssContent.querySelectorAll('item');
  const getPostContent = (item) => {
    const postTitleElement = item.querySelector('title');
    const postDescriptionElement = item.querySelector('description');
    const postLinkElement = item.querySelector('link');
    const postLink = postLinkElement.textContent;
    const postDescription = postDescriptionElement.textContent;
    const postTitle = postTitleElement.textContent;
    return { postTitle, postDescription, postLink };
  };

  const posts = [...postElements].map(getPostContent);

  const feed = { feedTitle, feedDescription };

  return { feed, posts };
};
