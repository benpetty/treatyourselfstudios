import { defineField, defineType } from 'sanity'

export const dealType = defineType({
  name: 'deal',
  title: 'Deal / Special',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'details', title: 'Details', type: 'text', rows: 3, validation: ( rule ) => rule.required() }),
    defineField({ name: 'finePrint', title: 'Fine Print', type: 'string', description: 'e.g. "Cannot be combined with other deals"' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
