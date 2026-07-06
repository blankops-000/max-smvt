import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CarListing from './CarListing';

// Mock fetch to simulate an empty cars list
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

describe('SMVT Frontend App', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the navbar with the SMVT brand name', async () => {
    render(<CarListing />);
    expect(await screen.findByText('SMVT')).toBeInTheDocument();
  });

  it('renders the Cars and Admin Panel nav buttons', async () => {
    render(<CarListing />);
    await screen.findByText('SMVT');
    expect(screen.getByRole('button', { name: /view car listings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open admin panel/i })).toBeInTheDocument();
  });

  it('renders search input and filter button', async () => {
    render(<CarListing />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by make, model or title...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle filters/i })).toBeInTheDocument();
    });
  });

  it('shows empty state message when no cars are available', async () => {
    render(<CarListing />);
    await waitFor(() => {
      expect(screen.getByText(/no cars match your search/i)).toBeInTheDocument();
    });
  });

  it('calls the /api/cars endpoint on mount', async () => {
    render(<CarListing />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/cars'));
    });
  });
});
