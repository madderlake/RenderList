import React, { useState, useRef, useEffect } from "react";
import List from "./List";
import { items } from "./items";
import "./renderlist.css";

interface Item {
  name: string;
  color: string;
}

const RenderList: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<Item>>(new Set());
  const listRef = useRef<HTMLUListElement>(null);
  const preRenderedItems = useRef<JSX.Element[] | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragBox = useRef<HTMLDivElement | null>(null);
  const deselectMode = useRef<boolean>(false);

  // Create the list items once
  if (!preRenderedItems.current) {
    preRenderedItems.current = items.map((item, index) => {
      console.log(item); //test renders, filter in dev tools
      return (
        <li
          key={item.name}
          className={`List__item List__item--${item.color}`}
          data-index={index}
        >
          {item.name}
        </li>
      );
    });
  }

  const clearSelections = () => {
    setSelectedItems(new Set());
    if (listRef.current) {
      const itemsInList = listRef.current.children;
      Array.from(itemsInList).forEach((li) => {
        li.classList.remove("List__item--selected");
      });
    }
  };

  const selectAllItems = () => {
    setSelectedItems(new Set(items));
    if (listRef.current) {
      const itemsInList = listRef.current.children;
      Array.from(itemsInList).forEach((li) => {
        li.classList.add("List__item--selected");
      });
    }
  };

  useEffect(() => {
    if (!listRef.current) return;
    const listElement = listRef.current;

    // Start Selection (mousedown)
    const handleMouseDown = (event: globalThis.MouseEvent) => {
      if (event.button !== 0) return;
      isDragging.current = true;
      dragStart.current = { x: event.clientX, y: event.clientY };

      const index = (event.target as HTMLElement).dataset.index;
      if (index !== undefined) {
        const item = items[Number(index)];
        deselectMode.current = selectedItems.has(item);
      }

      // Create a drag-selection-box for better responsiveness
      if (!dragBox.current) {
        dragBox.current = document.createElement("div");
        dragBox.current.className = "drag-selection-box";
        document.body.appendChild(dragBox.current);
      }

      dragBox.current.style.left = `${event.clientX}px`;
      dragBox.current.style.top = `${event.clientY}px`;
      dragBox.current.style.width = "0px";
      dragBox.current.style.height = "0px";

      document.body.style.userSelect = "none";
    };

    // Handle Dragging (mousemove)
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!isDragging.current || !dragBox.current) return;

      const x1 = dragStart.current!.x;
      const y1 = dragStart.current!.y;
      const x2 = event.clientX;
      const y2 = event.clientY;

      dragBox.current.style.left = `${Math.min(x1, x2)}px`;
      dragBox.current.style.top = `${Math.min(y1, y2)}px`;
      dragBox.current.style.width = `${Math.abs(x2 - x1)}px`;
      dragBox.current.style.height = `${Math.abs(y2 - y1)}px`;

      const newSelection = new Set(selectedItems);
      const itemsInList = listElement.children;

      Array.from(itemsInList).forEach((li) => {
        const itemIndex = Number((li as HTMLElement).dataset.index);
        const item = items[itemIndex];
        const liRect = li.getBoundingClientRect();

        const inSelection =
          liRect.left < Math.max(x1, x2) &&
          liRect.right > Math.min(x1, x2) &&
          liRect.top < Math.max(y1, y2) &&
          liRect.bottom > Math.min(y1, y2);

        if (inSelection) {
          if (deselectMode.current) {
            newSelection.delete(item);
            li.classList.remove("List__item--selected");
          } else {
            newSelection.add(item);
            li.classList.add("List__item--selected");
          }
        }
      });

      setSelectedItems(newSelection);
    };

    // End Selection (mouseup)
    const handleMouseUp = () => {
      isDragging.current = false;
      deselectMode.current = false;

      // Remove selection box when selection ends
      if (dragBox.current) {
        document.body.removeChild(dragBox.current);
        dragBox.current = null;
      }

      document.body.style.userSelect = "";
    };

    if (listElement) {
      listElement.addEventListener("mousedown", handleMouseDown);
      listElement.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener("mousedown", handleMouseDown);
        listElement.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [selectedItems]);

  // Clicking an item in the "Selected List" should deselect it
  const handleSelectedClick = (item: Item) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });

    if (listRef.current) {
      const listItem = listRef.current.querySelector(
        `[data-index="${items.indexOf(item)}"]`
      );
      if (listItem) {
        listItem.classList.remove("List__item--selected");
      }
    }
  };

  return (
    <div className="List_container">
      <h1>My Magnificent Fruit Selector</h1>
      <span>
            Click to select individual items, and drag to select multiple items
          </span>
      <div style={{ textAlign: "right" }}>
        {selectedItems.size > 0 && (
          <button onClick={clearSelections}>Clear Selections</button>
        )}{" "}
        {selectedItems.size < items.length && (
          <button onClick={selectAllItems}>Select All</button>
        )}
        {/* {selectedItems.size === 0 && (

        )} */}
      </div>
      <ul className={`List__selections ${selectedItems.size > 0 && 'active'}`} style={{ overflowX: "scroll" }}>
        {Array.from(selectedItems).map((item) => (
          <li
            key={item.name}
            className={`List__item List__item--${item.color}`}
            onClick={() => handleSelectedClick(item)}
          >
            {item.name}
          </li>
        ))}
      </ul>
      <List ref={listRef}>{preRenderedItems.current}</List>
    </div>
  );
};

export default RenderList;
