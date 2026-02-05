import { useState } from 'react';
import './ArticleCard.css';

const categoryEmojis = {
  biography: '👤',
  geography: '🌍',
  science: '🔬',
  history: '📜',
  technology: '💻',
  art: '🎨',
  music: '🎵',
  sport: '⚽',
  politics: '🏛️',
  default: '📖',
};

function getEmoji(description) {
  if (!description) return categoryEmojis.default;
  const d = description.toLowerCase();
  if (d.includes('born') || d.includes('person') || d.includes('politician') || d.includes('actor') || d.includes('player'))
    return categoryEmojis.biography;
  if (d.includes('village') || d.includes('city') || d.includes('river') || d.includes('country') || d.includes('mountain'))
    return categoryEmojis.geography;
  if (d.includes('species') || d.includes('chemical') || d.includes('protein') || d.includes('science'))
    return categoryEmojis.science;
  if (d.includes('battle') || d.includes('war') || d.includes('dynasty') || d.includes('empire'))
    return categoryEmojis.history;
  if (d.includes('album') || d.includes('song') || d.includes('band') || d.includes('musician'))
    return categoryEmojis.music;
  if (d.includes('film') || d.includes('painting') || d.includes('novel'))
    return categoryEmojis.art;
  if (d.includes('software') || d.includes('computer') || d.includes('programming'))
    return categoryEmojis.technology;
  return categoryEmojis.default;
}

export default function ArticleCard({ article, index }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const emoji = getEmoji(article.description);

  const imageUrl = article.originalImage || article.thumbnail;
  const showImage = imageUrl && !imgError;

  return (
    <div className="article-card">
      {/* Background image (blurred) */}
      {showImage && (
        <div
          className={`card-bg ${imgLoaded ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      <div className="card-overlay" />

      <div className="card-content">
        {/* Index pill */}
        <div className="card-index">
          <span className="card-emoji">{emoji}</span>
          <span className="card-number">#{index + 1}</span>
        </div>

        {/* Thumbnail */}
        {showImage && (
          <div className={`card-image-wrapper ${imgLoaded ? 'loaded' : ''}`}>
            <img
              src={imageUrl}
              alt={article.title}
              className="card-image"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </div>
        )}

        {/* Description tag */}
        {article.description && (
          <p className="card-description">{article.description}</p>
        )}

        {/* Title */}
        <h2 className="card-title">{article.title}</h2>

        {/* Extract */}
        <p className="card-extract">{article.extract}</p>

        {/* Actions */}
        <div className="card-actions">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-read-more"
          >
            <span>Read full article</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span>Scroll for more</span>
        </div>
      </div>
    </div>
  );
}
