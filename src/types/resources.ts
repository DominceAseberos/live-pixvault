export interface UIComponent {
  id?: string;
  name: string;
  category: string;
  author: string;
  html: string;
  sourceUrl: string;
}

export const componentIdentity = (component: UIComponent) =>
  component.id ?? `${component.author}:${component.category}:${component.name}`;
