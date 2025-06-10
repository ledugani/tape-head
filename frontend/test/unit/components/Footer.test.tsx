import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/app/components/Footer';

describe('Footer', () => {
  it('renders footer content', () => {
    render(<Footer />);

    // Check for links
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();

    // Check for copyright text
    expect(screen.getByText(/© 2025 Tape Head. All rights reserved./)).toBeInTheDocument();
  });

  it('renders footer links with correct hrefs', () => {
    render(<Footer />);

    const aboutLink = screen.getByText('About');
    const privacyLink = screen.getByText('Privacy');
    const termsLink = screen.getByText('Terms');

    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toHaveAttribute('href', '/terms');
  });
}); 