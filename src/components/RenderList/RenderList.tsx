import React, { useState, useRef, useMemo } from 'react';
import List from './List';
import { items } from './items';
import './renderlist.css';

interface Item {
  name: string;
  color: string;
}

const RenderList: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<Item>>(new Set());
  const listRef = useRef<HTMLUListElement>(null);

  // ✅ `preRenderedItems` is static, just for rendering
  const preRenderedItems = useMemo(
    () =>
      items.map((item, index) => {
        // to test the rendering of the list items, filter in devtools console for an item name - should only see it rendered on page load
        console.log(`Rendering ${item.name}`);
        return (
          <li
            key={item.name}
            className={`List__item List__item--${item.color}`}
            data-index={index}>
            {item.name}
          </li>
        );
      }),
    []
  );

  // ✅ `selectedItemsList` updates dynamically based on `selectedItems`
  const selectedItemsList = useMemo(
    () =>
      Array.from(selectedItems).map(item => (
        <li
          key={item.name}
          className={`List__item List__item--${item.color}`}
          onClick={() => handleSelectedClick(item)}>
          {item.name}
        </li>
      )),
    [selectedItems]
  );

  const clearSelections = () => {
    setSelectedItems(new Set());
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(items));
  };

  const handleSelectedClick = (item: Item) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });
  };

  return (
    <div className="List_container">
      <h1>My Magnificent Fruit Selector</h1>
      <span>
        Click to select individual items, and drag to select multiple items
      </span>

      <div style={{ textAlign: 'right' }}>
        {selectedItems.size > 0 && (
          <button onClick={clearSelections}>Clear Selections</button>
        )}
        {selectedItems.size < items.length && (
          <button onClick={selectAllItems}>Select All</button>
        )}
      </div>

      {/* ✅ Pass `items` and `setSelectedItems` so List.tsx handles selection */}
      <List
        ref={listRef}
        items={items}
        preRenderedItems={preRenderedItems}
        selectedItemsList={selectedItemsList}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
    </div>
  );
};

export default RenderList;
