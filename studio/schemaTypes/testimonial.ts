import { defineField, defineType } from 'sanity'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: ( rule ) => rule.required() }),
    defineField({ name: 'attribution', title: 'Attribution', type: 'string', description: 'e.g. "Yasmina S."', validation: ( rule ) => rule.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string', description: 'e.g. "Northgate"' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
