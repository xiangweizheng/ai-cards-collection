'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardDeck } from '@/types';
import { useCards } from '@/hooks/useCards';
import { useDecks } from '@/hooks/useDecks';
import { CardGrid } from '@/components/Card/CardGrid';
import { DeckGrid } from '@/components/Deck/DeckGrid';
import { SearchBar } from '@/components/Search/SearchBar';
import { QuickAddCard } from '@/components/Card/QuickAddCard';
import { AddCardForm } from '@/components/Card/AddCardForm';
import { EditCardModal } from '@/components/Card/EditCardModal';
import { StatsPanel } from '@/components/Stats/StatsPanel';
import { SettingsModal } from '@/components/Settings/SettingsModal';
import { CreateDeckModal } from '@/components/Deck/CreateDeckModal';
import { DeckDetailModal } from '@/components/Deck/DeckDetailModal';
import { AddCardsToDeckModal } from '@/components/Deck/AddCardsToDeckModal';
import { initializeSampleData } from '@/lib/sampleData';
import { ImportModal } from '@/components/Import/ImportModal';

type ViewMode = 'cards' | 'decks';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<CardDeck | null>(null);
  const [showDeckDetail, setShowDeckDetail] = useState(false);
  const [showAddCardsToDeck, setShowAddCardsToDeck] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // 使用自定义hooks
  const {
    cards,
    filteredCards,
    loading: cardsLoading,
    error: cardsError,
    stats,
    popularTags,
    setFilters,
    addCard,
    updateCard,
    deleteCard,
    refresh: cardsRefresh
  } = useCards();

  const {
    decks,
    loading: decksLoading,
    error: decksError,
    createDeck,
    // updateDeck,
    deleteDeck,
    duplicateDeck,
    addCardsToDeck,
    removeCardFromDeck,
    moveCardInDeck,
    getCardsInDeck,
    getDeck,
    refresh: decksRefresh
  } = useDecks();

  // 处理卡片添加
  const handleCardAdded = (card: Card) => {
    addCard(card);
    setShowAddForm(false);
  };

  // 处理卡片编辑
  const handleCardEdit = (card: Card) => {
    setEditingCard(card);
  };

  // 处理卡片保存
  const handleCardSave = (card: Card) => {
    updateCard(card);
    setEditingCard(null);
  };

  // 处理卡片删除
  const handleCardDelete = (card: Card) => {
    deleteCard(card.id);
  };

  // 获取卡组中的卡片数量
  const getDeckCardCount = (deckId: string) => {
    return getCardsInDeck(deckId).length;
  };

  // 处理卡组操作
  const handleDeckClick = (deck: CardDeck) => {
    setSelectedDeck(deck);
    setShowDeckDetail(true);
  };

  const handleDeckEdit = (deck: CardDeck) => {
    // TODO: 实现卡组编辑
    console.log('编辑卡组:', deck.name);
  };

  const handleDeckDelete = (deck: CardDeck) => {
    deleteDeck(deck.id);
  };

  const handleDeckDuplicate = (deck: CardDeck) => {
    duplicateDeck(deck.id);
  };

  // 创建卡组
  const handleCreateDeck = (deckData: Omit<CardDeck, 'id' | 'createdAt' | 'updatedAt'>) => {
    createDeck(deckData);
    setShowCreateDeck(false);
  };

  // 添加卡片到卡组
  const handleAddCardsToDeck = (deckId: string, cardIds: string[]) => {
    addCardsToDeck(deckId, cardIds);
    setShowAddCardsToDeck(false);
  };

  // 从卡组移除卡片
  const handleRemoveCardFromDeck = (deckId: string, cardId: string) => {
    removeCardFromDeck(deckId, cardId);
  };

  // 调整卡组中卡片顺序
  const handleReorderCardsInDeck = (deckId: string, fromIndex: number, toIndex: number) => {
    moveCardInDeck(deckId, fromIndex, toIndex);
  };

  // 分享卡组
  const handleShareDeck = (deck: CardDeck) => {
    const deckCards = getCardsInDeck(deck.id);
    const shareData = {
      name: deck.name,
      description: deck.description,
      cardCount: deckCards.length,
      cards: deckCards.map(card => ({
        title: card.title,
        type: card.type,
        rarity: card.rarity
      }))
    };

    const shareText = `🎴 ${shareData.name}\n\n${shareData.description}\n\n包含 ${shareData.cardCount} 张卡片:\n${shareData.cards.map(card => `• ${card.title} (${card.type})`).join('\n')}`;

    if (navigator.share) {
      navigator.share({
        title: shareData.name,
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('卡组信息已复制到剪贴板！');
      });
    }
  };

  // 初始化示例数据
  useEffect(() => {
    initializeSampleData();
  }, []);

  // 处理数据变化
  const handleDataChanged = () => {
    cardsRefresh();
    decksRefresh();
  };

  // 处理导入完成
  const handleImportComplete = (_newCards: Card[], _newDecks: CardDeck[], summary: { cardsAdded: number, decksAdded: number }) => {
    // 更新数据
    handleDataChanged();

    // 显示成功消息
    alert(`导入成功！添加了 ${summary.cardsAdded} 张卡片和 ${summary.decksAdded} 个卡组。`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🎴 AI卡片收藏
              </h1>
              <div className="text-sm text-gray-500">
                {viewMode === 'cards' ? `${stats.total} 张卡片` : `${decks.length} 个卡组`}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* 视图切换 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  卡片
                </button>
                <button
                  onClick={() => setViewMode('decks')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'decks'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  卡组
                </button>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImport(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  导入
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  设置
                </button>
                <button
                  onClick={() => viewMode === 'cards' ? setShowAddForm(true) : setShowCreateDeck(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {viewMode === 'cards' ? '添加卡片' : '创建卡组'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-200px)]">
        <div className="space-y-6 h-full">
          {/* 快速添加和搜索 */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <QuickAddCard onCardAdded={handleCardAdded} />
              </div>
              <div className="lg:col-span-2">
                <SearchBar
                  onFiltersChange={setFilters}
                  popularTags={popularTags}
                />
              </div>
              <div className="lg:col-span-1">
                <StatsPanel cards={filteredCards} />
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {(cardsError || decksError) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">
                {cardsError || decksError}
              </p>
            </div>
          )}

          {/* 内容区域 */}
          <div className="flex-1 overflow-auto">
            {viewMode === 'cards' ? (
              <CardGrid
                cards={filteredCards}
                loading={cardsLoading}
                onCardClick={(card) => window.open(card.url, '_blank')}
                onCardEdit={handleCardEdit}
                onCardDelete={handleCardDelete}
                emptyMessage="还没有卡片，快来添加第一张吧！"
              />
            ) : (
              <DeckGrid
                decks={decks}
                cards={cards}
                getCardCount={getDeckCardCount}
                loading={decksLoading}
                onDeckClick={handleDeckClick}
                onDeckEdit={handleDeckEdit}
                onDeckDelete={handleDeckDelete}
                onDeckDuplicate={handleDeckDuplicate}
                emptyMessage="还没有卡组，创建一个来整理你的卡片吧！"
              />
            )}
          </div>
        </div>
      </main>

      {/* 添加卡片表单模态框 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddCardForm
              onCardAdded={handleCardAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* 编辑卡片模态框 */}
      {editingCard && (
        <EditCardModal
          card={editingCard}
          isOpen={!!editingCard}
          onSave={handleCardSave}
          onCancel={() => setEditingCard(null)}
        />
      )}

      {/* 设置模态框 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onDataChanged={handleDataChanged}
      />

      {/* 创建卡组模态框 */}
      <CreateDeckModal
        isOpen={showCreateDeck}
        onClose={() => setShowCreateDeck(false)}
        onCreateDeck={handleCreateDeck}
        availableCards={cards}
      />

      {/* 卡组详情模态框 */}
      <DeckDetailModal
        isOpen={showDeckDetail}
        onClose={() => setShowDeckDetail(false)}
        deck={selectedDeck}
        cards={selectedDeck ? getCardsInDeck(selectedDeck.id) : []}
        onCardEdit={handleCardEdit}
        onCardRemove={handleRemoveCardFromDeck}
        onCardReorder={handleReorderCardsInDeck}
        onAddCards={(deckId) => {
          setSelectedDeck(getDeck(deckId));
          setShowAddCardsToDeck(true);
        }}
        onShareDeck={handleShareDeck}
      />

      {/* 添加卡片到卡组模态框 */}
      <AddCardsToDeckModal
        isOpen={showAddCardsToDeck}
        onClose={() => setShowAddCardsToDeck(false)}
        deck={selectedDeck}
        availableCards={cards}
        onAddCards={handleAddCardsToDeck}
      />

      {/* JSON导入模态框 */}
      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={handleImportComplete}
        existingCards={cards}
        existingDecks={decks}
      />
    </div>
  );
}
