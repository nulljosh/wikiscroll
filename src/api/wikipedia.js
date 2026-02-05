const API_BASE = 'https://en.wikipedia.org/api/rest_v1';

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (!navigator.onLine) {
        throw new Error('OFFLINE');
      }
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
    }
  }
}

export async function fetchRandomArticles(count = 5) {
  const articles = [];

  const promises = Array.from({ length: count }, () =>
    fetchWithRetry(`${API_BASE}/page/random/summary`, {
      headers: { Accept: 'application/json' },
    })
      .then((data) => ({
        id: data.pageid,
        title: data.title,
        displayTitle: data.displaytitle || data.title,
        extract: data.extract || '',
        extractHtml: data.extract_html || '',
        description: data.description || '',
        thumbnail: data.thumbnail?.source || null,
        originalImage: data.originalimage?.source || null,
        url:
          data.content_urls?.desktop?.page ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
        lang: data.lang || 'en',
        timestamp: data.timestamp || null,
      }))
      .catch(() => null)
  );

  const results = await Promise.all(promises);

  for (const article of results) {
    if (article && article.extract && article.extract.length > 30) {
      articles.push(article);
    }
  }

  if (articles.length === 0 && !navigator.onLine) {
    throw new Error('OFFLINE');
  }

  if (articles.length === 0) {
    throw new Error('NO_ARTICLES');
  }

  return articles;
}
