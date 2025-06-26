import { Schema } from 'mongoose';

// Fields to remove from all toJSON outputs
const hiddenFields = ['password', '__v'];

export function mongooseGlobalTransformPlugin(schema: Schema) {
  schema.set('toJSON', {
    transform: function (doc, ret, options) {
      // Remove hidden fields
      for (const field of hiddenFields) {
        if (ret[field] !== undefined) {
          delete ret[field];
        }
      }
      // Optionally, remove _id and add id
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      return ret;
    },
  });
}