import source from "./catalog-source.json";

export type CatalogSpecification = {
  title: string;
  value: string;
  valueHtml: string;
};

export type CatalogVariant = {
  name: string;
  specifications: CatalogSpecification[];
};

export type CatalogImage = {
  src: string;
  source: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export type CatalogCategory = {
  id: string;
  title: string;
  shortName: string;
  description: string;
  gallery: CatalogImage[];
  variants: CatalogVariant[];
  inquiryLabel: string;
};

export const catalogCategories: CatalogCategory[] = source.categories;
export const catalogIntro = source.intro;
export const catalogSourceUrl = source.source;
