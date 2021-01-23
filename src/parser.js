export default (rssData) => {
  const domparse = new DOMParser();
  const parsedRssData = domparse.parseFromString(rssData, 'application/xml');

  const errTag = parsedRssData.querySelector('parsererror');
  if (errTag) {
    throw new Error('dataError');
  }

  const title = parsedRssData.querySelector('channel > title');
  const description = parsedRssData.querySelector('channel > description');
  const feedTitle = title.textContent;
  const feedDescription = description.textContent;

  const items = parsedRssData.querySelectorAll('item');
  const getPostData = (item) => {
    const itemTitle = item.querySelector('title');
    const itemDescription = item.querySelector('description');
    const link = item.querySelector('link');
    const postLink = link.textContent;
    const postDescription = itemDescription.textContent;
    const postTitle = itemTitle.textContent;
    return { postTitle, postDescription, postLink };
  };

  const posts = [...items].map((item) => getPostData(item));

  const feed = { feedTitle, feedDescription };

  return { feed, posts };
};
