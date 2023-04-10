import { Event } from 'pv3';
import S from '@bett3r-dev/jsonschema-definer';

export const ProductCreated = () => Event({
  schema: S.shape({
    name: S.string(),
  })
});