import { supabase, DatabaseCard, DatabaseDeck } from './supabase'
import { Card, CardDeck, CardType, CardRarity } from '@/types'

// 转换函数：从应用类型到数据库类型
function cardToDatabase(card: Card): Omit<DatabaseCard, 'user_id' | 'created_at' | 'updated_at'> {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    type: card.type,
    rarity: card.rarity,
    price: card.price,
    url: card.url,
    image_url: card.imageUrl,
    tags: card.tags || [],
    metadata: card.metadata || {}
  }
}

function deckToDatabase(deck: CardDeck): Omit<DatabaseDeck, 'user_id' | 'created_at' | 'updated_at'> {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    is_public: deck.isPublic || false,
    tags: deck.tags || [],
    card_ids: deck.cardIds || []
  }
}

// 转换函数：从数据库类型到应用类型
function databaseToCard(dbCard: DatabaseCard): Card {
  return {
    id: dbCard.id,
    title: dbCard.title,
    description: dbCard.description,
    type: dbCard.type as CardType,
    rarity: dbCard.rarity as CardRarity,
    price: dbCard.price,
    url: dbCard.url,
    imageUrl: dbCard.image_url,
    tags: dbCard.tags,
    metadata: dbCard.metadata,
    createdAt: new Date(dbCard.created_at),
    updatedAt: new Date(dbCard.updated_at)
  }
}

function databaseToDeck(dbDeck: DatabaseDeck): CardDeck {
  return {
    id: dbDeck.id,
    name: dbDeck.name,
    description: dbDeck.description,
    isPublic: dbDeck.is_public,
    tags: dbDeck.tags,
    cardIds: dbDeck.card_ids,
    createdAt: new Date(dbDeck.created_at),
    updatedAt: new Date(dbDeck.updated_at)
  }
}

// 卡片操作
export const cardOperations = {
  async getAll(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cards:', error)
      return []
    }

    return data.map(databaseToCard)
  },

  async create(card: Card): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .insert([cardToDatabase(card)])

    if (error) {
      console.error('Error creating card:', error)
      return false
    }

    return true
  },

  async update(card: Card): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .update({
        ...cardToDatabase(card),
        updated_at: new Date().toISOString()
      })
      .eq('id', card.id)

    if (error) {
      console.error('Error updating card:', error)
      return false
    }

    return true
  },

  async delete(cardId: string): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      return false
    }

    return true
  }
}

// 卡组操作
export const deckOperations = {
  async getAll(): Promise<CardDeck[]> {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching decks:', error)
      return []
    }

    return data.map(databaseToDeck)
  },

  async create(deck: CardDeck): Promise<boolean> {
    const { error } = await supabase
      .from('decks')
      .insert([deckToDatabase(deck)])

    if (error) {
      console.error('Error creating deck:', error)
      return false
    }

    return true
  },

  async update(deck: CardDeck): Promise<boolean> {
    const { error } = await supabase
      .from('decks')
      .update({
        ...deckToDatabase(deck),
        updated_at: new Date().toISOString()
      })
      .eq('id', deck.id)

    if (error) {
      console.error('Error updating deck:', error)
      return false
    }

    return true
  },

  async delete(deckId: string): Promise<boolean> {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)

    if (error) {
      console.error('Error deleting deck:', error)
      return false
    }

    return true
  }
}

// 批量操作
export const batchOperations = {
  async createCards(cards: Card[]): Promise<boolean> {
    const { error } = await supabase
      .from('cards')
      .insert(cards.map(cardToDatabase))

    if (error) {
      console.error('Error batch creating cards:', error)
      return false
    }

    return true
  },

  async createDecks(decks: CardDeck[]): Promise<boolean> {
    const { error } = await supabase
      .from('decks')
      .insert(decks.map(deckToDatabase))

    if (error) {
      console.error('Error batch creating decks:', error)
      return false
    }

    return true
  }
}
