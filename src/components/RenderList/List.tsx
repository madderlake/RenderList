import React, { forwardRef, useEffect, useRef, useCallback } from 'react';

interface Item {
  name: string;
  color: string;
}

interface ListProps {
  items: Item[];
  preRenderedItems: JSX.Element[];
  selectedItemsList: JSX.Element[];
  selectedItems: Set<Item>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<Item>>>;
}

const List = forwardRef<HTMLUListElement, ListProps>(
  (
    {
      items,
      preRenderedItems,
      selectedItemsList,
      selectedItems,
      setSelectedItems,
    },
    ref
  ) => {
    const isDragging = useRef<boolean>(false);
    const dragStart = useRef<{ x: number; y: number } | null>(null);
    const dragBox = useRef<HTMLDivElement | null>(null);
    const deselectMode = useRef<boolean>(false);

    useEffect(() => {
      if (!ref || !(ref as React.MutableRefObject<HTMLUListElement>).current)
        return;
      const listElement = (ref as React.MutableRefObject<HTMLUListElement>)
        .current;

      // ✅ Ensure styles update when selection changes
      Array.from(listElement.children).forEach(li => {
        const itemIndex = Number((li as HTMLElement).dataset.index);
        const item = items[itemIndex];

        if (selectedItems.has(item)) {
          li.classList.add('List__item--selected');
        } else {
          li.classList.remove('List__item--selected');
        }
      });
    }, [selectedItems, items, ref]); // ✅ Ensures styling updates on selection changes

    const handleMouseDown = useCallback(
      (event: MouseEvent) => {
        if (event.button !== 0) return;
        isDragging.current = true;
        dragStart.current = { x: event.clientX, y: event.clientY };

        const index = (event.target as HTMLElement).dataset.index;
        if (index !== undefined) {
          const item = items[Number(index)];
          deselectMode.current = selectedItems.has(item);

          // ✅ Toggle selection on click
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(item)) {
              newSet.delete(item);
            } else {
              newSet.add(item);
            }
            return newSet;
          });
        }

        if (!dragBox.current) {
          dragBox.current = document.createElement('div');
          dragBox.current.className = 'drag-selection-box';
          document.body.appendChild(dragBox.current);
        }

        dragBox.current.style.left = `${event.clientX}px`;
        dragBox.current.style.top = `${event.clientY}px`;
        dragBox.current.style.width = '0px';
        dragBox.current.style.height = '0px';

        document.body.style.userSelect = 'none';
      },
      [items, selectedItems, setSelectedItems]
    );

    const handleMouseMove = useCallback(
      (event: MouseEvent) => {
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
        const itemsInList = (ref as React.MutableRefObject<HTMLUListElement>)
          .current!.children;

        Array.from(itemsInList).forEach(li => {
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
              li.classList.remove('List__item--selected');
            } else {
              newSelection.add(item);
              li.classList.add('List__item--selected');
            }
          }
        });

        setSelectedItems(newSelection);
      },
      [items, ref, selectedItems, setSelectedItems]
    );

    const handleMouseUp = useCallback(() => {
      isDragging.current = false;
      deselectMode.current = false;

      if (dragBox.current) {
        document.body.removeChild(dragBox.current);
        dragBox.current = null;
      }

      document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
      if (!ref || !(ref as React.MutableRefObject<HTMLUListElement>).current)
        return;
      const listElement = (ref as React.MutableRefObject<HTMLUListElement>)
        .current;

      listElement.addEventListener('mousedown', handleMouseDown);
      listElement.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        listElement.removeEventListener('mousedown', handleMouseDown);
        listElement.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [selectedItems, handleMouseDown, handleMouseMove, handleMouseUp, ref]);

    return (
      <div>
        <ul
          className={`List__selections ${
            selectedItemsList.length > 0 ? 'active' : ''
          }`}>
          {selectedItemsList}
        </ul>
        <ul className="List" ref={ref}>
          {preRenderedItems}
        </ul>
      </div>
    );
  }
);

export default List;
