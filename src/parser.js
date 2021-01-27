export default (rssContent) => {
  const domparser = new DOMParser();
  const parsedRssContent = domparser.parseFromString(rssContent, 'application/xml');

  const error = parsedRssContent.querySelector('parsererror');
  if (error) {
    throw new Error('dataError');
  }

  const channalTitle = parsedRssContent.querySelector('channel > title');
  const channalDescription = parsedRssContent.querySelector('channel > description');
  const feedTitle = channalTitle.textContent;
  const feedDescription = channalDescription.textContent;

  const items = parsedRssContent.querySelectorAll('item');
  const getPostContent = (item) => {
    const itemTitle = item.querySelector('title');
    const itemDescription = item.querySelector('description');
    const link = item.querySelector('link');
    const postLink = link.textContent;
    const postDescription = itemDescription.textContent;
    const postTitle = itemTitle.textContent;
    return { postTitle, postDescription, postLink };
  };

  const posts = [...items].map(getPostContent);

  const feed = { feedTitle, feedDescription };

  return { feed, posts };
};
