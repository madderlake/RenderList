const sizes: string[]= ["tiny", "small", "medium", "large", "huge"];
const colors: string[] = [
  "navy",
  "blue",
  "aqua",
  "teal",
  "olive",
  "green",
  "lime",
  "yellow",
  "orange",
  "red",
  "maroon",
  "fuchsia",
  "purple",
  "silver",
  "gray",
  "black",
];
const fruits: string[]  = [
  "apple",
  "banana",
  "watermelon",
  "orange",
  "peach",
  "tangerine",
  "pear",
  "kiwi",
  "mango",
  "pineapple",
];
interface Item {
  name: string;
  color: string;
}

export const items: Item[] = sizes.reduce<Item[]>(
  (items, size) => [
    ...items,
    ...fruits.reduce<Item[]>(
      (acc, fruit) => [
        ...acc,
        ...colors.reduce<Item[]>(
          (acc, color) => [
            ...acc,
            {
              name: `${size} ${color} ${fruit}`,
              color,
            },
          ],
          []
        ),
      ],
      []
    ),
  ],
  []
);
