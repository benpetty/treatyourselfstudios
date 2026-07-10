import { defineArrayMember, defineField, defineType } from 'sanity'

export const servicePackageType = defineType({
  name: 'servicePackage',
  title: 'Package',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: ( rule ) => rule.required() }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
    defineField({
      name: 'prices', title: 'Prices', type: 'array',
      of: [ defineArrayMember({
        type: 'object',
        name: 'priceVariant',
        fields: [
          defineField({ name: 'label', title: 'Variant Label', type: 'string' }),
          defineField({ name: 'amount', title: 'Amount (USD)', type: 'number', validation: ( rule ) => rule.required().positive() }),
        ],
      }) ],
      validation: ( rule ) => rule.required().min( 1 ),
    }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes)', type: 'number', validation: ( rule ) => rule.integer().positive() }),
    defineField({ name: 'benefit', title: 'Benefit One-Liner', type: 'string', validation: ( rule ) => rule.required().max( 120 ) }),
    defineField({ name: 'description', title: 'Description', type: 'blockContent', validation: ( rule ) => rule.required() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
