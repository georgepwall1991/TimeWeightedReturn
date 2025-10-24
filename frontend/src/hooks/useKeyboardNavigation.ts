import { useEffect, useCallback, useRef } from 'react';

interface NavigableItem {
  id: string;
  type: 'client' | 'portfolio' | 'account';
  name: string;
}

interface UseKeyboardNavigationProps {
  items: NavigableItem[];
  onSelect: (item: NavigableItem) => void;
  onClear?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  items,
  onSelect,
  onClear,
  enabled = true,
}: UseKeyboardNavigationProps) => {
  const currentIndexRef = useRef<number>(-1);
  const highlightedItemRef = useRef<NavigableItem | null>(null);

  const moveToNext = useCallback(() => {
    if (items.length === 0) return;

    const nextIndex = Math.min(currentIndexRef.current + 1, items.length - 1);
    currentIndexRef.current = nextIndex;
    highlightedItemRef.current = items[nextIndex];

    return items[nextIndex];
  }, [items]);

  const moveToPrevious = useCallback(() => {
    if (items.length === 0) return;

    const prevIndex = Math.max(currentIndexRef.current - 1, 0);
    currentIndexRef.current = prevIndex;
    highlightedItemRef.current = items[prevIndex];

    return items[prevIndex];
  }, [items]);

  const selectCurrent = useCallback(() => {
    if (highlightedItemRef.current) {
      onSelect(highlightedItemRef.current);
      return true;
    }
    return false;
  }, [onSelect]);

  const clearHighlight = useCallback(() => {
    currentIndexRef.current = -1;
    highlightedItemRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in an input (except the search input)
      const target = event.target as HTMLElement;
      const isSearchInput = target.getAttribute('data-search-input') === 'true';

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Special keys work even in search input
        if (!isSearchInput) return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveToNext();
          break;

        case 'ArrowUp':
          event.preventDefault();
          moveToPrevious();
          break;

        case 'Enter':
          if (isSearchInput && items.length > 0) {
            event.preventDefault();
            // If nothing highlighted, select first item
            if (currentIndexRef.current === -1 && items.length > 0) {
              onSelect(items[0]);
            } else {
              selectCurrent();
            }
          }
          break;

        case 'Escape':
          event.preventDefault();
          clearHighlight();
          onClear?.();
          break;

        case '/':
          // Focus search box (unless already in an input)
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            const searchInput = document.querySelector('[data-search-input="true"]') as HTMLInputElement;
            searchInput?.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, items, moveToNext, moveToPrevious, selectCurrent, clearHighlight, onSelect, onClear]);

  // Reset highlight when items change
  useEffect(() => {
    clearHighlight();
  }, [items, clearHighlight]);

  return {
    highlightedItem: highlightedItemRef.current,
    highlightedIndex: currentIndexRef.current,
    moveToNext,
    moveToPrevious,
    selectCurrent,
    clearHighlight,
  };
};
