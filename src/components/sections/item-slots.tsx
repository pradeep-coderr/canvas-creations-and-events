import type { ComponentType, ReactNode } from "react";

/**
 * Optional hooks used only by the admin visual editor (/admin/editor). The
 * public site never passes them, so public sections render exactly as
 * before and ship no editor code. The editor wraps each item with its
 * controls (`Item`) and adds an "Add …" control after the list (`after`),
 * which also keeps an empty section visible there so items can be added.
 */
export interface ItemSlots<T> {
  Item?: ComponentType<{ item: T; children: ReactNode }>;
  after?: ReactNode;
}

export function SlotItem<T>({
  slots,
  item,
  children,
}: {
  slots?: ItemSlots<T>;
  item: T;
  children: ReactNode;
}) {
  const Item = slots?.Item;
  return Item ? <Item item={item}>{children}</Item> : children;
}
