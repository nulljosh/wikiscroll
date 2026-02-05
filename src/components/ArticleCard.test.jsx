import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticleCard from './ArticleCard';

const mockArticle = {
  id: 1,
  title: 'Mount Everest',
  displayTitle: 'Mount Everest',
  extract: 'Mount Everest is the tallest mountain in the world, located in the Himalayas.',
  description: 'mountain in Asia',
  thumbnail: null,
  originalImage: null,
  url: 'https://en.wikipedia.org/wiki/Mount_Everest',
};

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} index={0} />);
    expect(screen.getByText('Mount Everest')).toBeInTheDocument();
  });

  it('renders article extract', () => {
    render(<ArticleCard article={mockArticle} index={0} />);
    expect(screen.getByText(/tallest mountain/)).toBeInTheDocument();
  });

  it('renders article description', () => {
    render(<ArticleCard article={mockArticle} index={0} />);
    expect(screen.getByText('mountain in Asia')).toBeInTheDocument();
  });

  it('renders correct index number', () => {
    render(<ArticleCard article={mockArticle} index={4} />);
    expect(screen.getByText('#5')).toBeInTheDocument();
  });

  it('renders read more link with correct URL', () => {
    render(<ArticleCard article={mockArticle} index={0} />);
    const link = screen.getByText('Read full article').closest('a');
    expect(link).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Mount_Everest');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders geography emoji for mountain article', () => {
    render(<ArticleCard article={mockArticle} index={0} />);
    expect(screen.getByText('🌍')).toBeInTheDocument();
  });

  it('renders without image when no thumbnail', () => {
    render(<ArticleCard article={mockArticle} index={0} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders image when thumbnail provided', () => {
    const articleWithImage = {
      ...mockArticle,
      originalImage: 'https://example.com/everest.jpg',
    };
    render(<ArticleCard article={articleWithImage} index={0} />);
    expect(screen.getByAltText('Mount Everest')).toBeInTheDocument();
  });
});
