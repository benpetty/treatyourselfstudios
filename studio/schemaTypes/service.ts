import { defineArrayMember, defineField, defineType } from 'sanity'

export const serviceType = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: ( rule ) => rule.required() }),
    defineField({
      name: 'category', title: 'Category', type: 'reference', to: [ { type: 'serviceCategory' } ],
      validation: ( rule ) => rule.required(),
    }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
    defineField({
      name: 'prices', title: 'Prices', type: 'array',
      description: 'One entry for a simple price; multiple for variants (e.g. Brazilian $65 / Manzilian $75)',
      of: [ defineArrayMember({
        type: 'object',
        name: 'priceVariant',
        fields: [
          defineField({ name: 'label', title: 'Variant Label', type: 'string', description: 'Empty for single-price services' }),
          defineField({ name: 'amount', title: 'Amount (USD)', type: 'number', validation: ( rule ) => rule.required().positive() }),
        ],
        preview: { select: { title: 'label', subtitle: 'amount' } },
      }) ],
      validation: ( rule ) => rule.required().min( 1 ),
    }),
    defineField({ name: 'priceNote', title: 'Price Note', type: 'string', description: 'e.g. "Toe hair removal is an additional $5"' }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes)', type: 'number', validation: ( rule ) => rule.integer().positive() }),
    defineField({ name: 'benefit', title: 'Benefit One-Liner', type: 'string', description: 'Menu-row summary, benefit-led', validation: ( rule ) => rule.required().max( 120 ) }),
    defineField({ name: 'description', title: 'Detail Description', type: 'blockContent' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false, description: 'Featured services get highlighted styling in the menu' }),
    defineField({ name: 'seasonal', title: 'Seasonal', type: 'boolean', initialValue: false, description: 'Rendered under a "Seasonal" subheading within the category' }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
  preview: { select: { title: 'name', subtitle: 'category.title' } },
})
