import { Field, FieldSummary } from "./field";

export type Venue = {
  id: string;
  name: string;
  description?: string;
  address: string;
  imageUrls: string[];
  fields: Field[];
  fieldTypes: FieldSummary[];
};