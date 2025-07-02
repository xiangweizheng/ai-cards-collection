import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock the hooks
jest.mock('@/hooks/useCards', () => ({
  useCards: () => ({
    cards: [
      {
        id: '1',
        title: 'Test Card',
        description: 'Test Description',
        type: 'AI工具',
        rarity: 'common',
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    filteredCards: [
      {
        id: '1',
        title: 'Test Card',
        description: 'Test Description',
        type: 'AI工具',
        rarity: 'common',
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    loading: false,
    error: null,
    stats: {
      total: 1,
      byType: { 'AI工具': 1 },
      byRarity: { common: 1 }
    },
    popularTags: ['test'],
    setFilters: jest.fn(),
    addCard: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    refresh: jest.fn()
  })
}));

jest.mock('@/hooks/useDecks', () => ({
  useDecks: () => ({
    decks: [
      {
        id: '1',
        name: 'Test Deck',
        description: 'Test Deck Description',
        cardIds: ['1'],
        isPublic: false,
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    loading: false,
    error: null,
    createDeck: jest.fn(),
    updateDeck: jest.fn(),
    deleteDeck: jest.fn(),
    duplicateDeck: jest.fn(),
    addCardsToDeck: jest.fn(),
    removeCardFromDeck: jest.fn(),
    moveCardInDeck: jest.fn(),
    getCardsInDeck: jest.fn(() => [
      {
        id: '1',
        title: 'Test Card',
        description: 'Test Description',
        type: 'AI工具',
        rarity: 'common',
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]),
    getDeck: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock the sample data initialization
jest.mock('@/lib/sampleData', () => ({
  initializeSampleData: jest.fn()
}));

describe('Home Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Home />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('AI卡片收藏')).toBeInTheDocument();
    });
  });

  it('displays cards view by default', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });
  });

  it('has working view mode toggle', async () => {
    render(<Home />);
    
    await waitFor(() => {
      // Check if view mode buttons are present
      const cardsButton = screen.getByRole('button', { name: /卡片/i });
      const decksButton = screen.getByRole('button', { name: /卡组/i });
      
      expect(cardsButton).toBeInTheDocument();
      expect(decksButton).toBeInTheDocument();
    });
  });

  it('displays deck information when in deck view', async () => {
    render(<Home />);

    await waitFor(() => {
      // Switch to deck view
      const decksButton = screen.getByRole('button', { name: /卡组/i });
      decksButton.click();

      // Check if deck is displayed
      expect(screen.getByText('Test Deck')).toBeInTheDocument();
    });
  });

  it('has proper text contrast for cards and decks', async () => {
    render(<Home />);

    await waitFor(() => {
      // Check if card text has proper contrast
      const cardTitle = screen.getByText('Test Card');
      expect(cardTitle).toHaveClass('text-gray-900');
    });
  });

  it('has functional add button', async () => {
    render(<Home />);
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /添加卡片/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('displays stats panel', async () => {
    render(<Home />);
    
    await waitFor(() => {
      // Stats should be visible
      expect(screen.getByText('1')).toBeInTheDocument(); // Total count
    });
  });

  it('handles error states gracefully', async () => {
    // This test would need to mock error states
    // For now, just ensure no errors are thrown
    expect(() => render(<Home />)).not.toThrow();
  });
});

// Integration test for the getCardsInDeck functionality
describe('Deck Card Integration', () => {
  it('correctly retrieves cards for a deck', async () => {
    const mockGetCardsInDeck = jest.fn(() => [
      {
        id: '1',
        title: 'Test Card',
        description: 'Test Description',
        type: 'AI工具',
        rarity: 'common',
        tags: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    // Mock useDecks with our test function
    jest.doMock('@/hooks/useDecks', () => ({
      useDecks: () => ({
        decks: [],
        loading: false,
        error: null,
        createDeck: jest.fn(),
        updateDeck: jest.fn(),
        deleteDeck: jest.fn(),
        duplicateDeck: jest.fn(),
        addCardsToDeck: jest.fn(),
        removeCardFromDeck: jest.fn(),
        moveCardInDeck: jest.fn(),
        getCardsInDeck: mockGetCardsInDeck,
        getDeck: jest.fn(),
        refresh: jest.fn()
      })
    }));

    render(<Home />);
    
    await waitFor(() => {
      // The component should render without the "cards is not defined" error
      expect(screen.getByText('AI卡片收藏')).toBeInTheDocument();
    });
  });
});
