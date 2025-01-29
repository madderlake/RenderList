import React, { forwardRef } from "react";

interface ListProps {
  children: React.ReactNode;
}

// ✅ Correctly type `ref` as `HTMLUListElement`
const List = forwardRef<HTMLUListElement, ListProps>(({ children }, ref) => {
  return (
    <ul className="List" ref={ref}>
      {children}
    </ul>
  );
});

export default List;
