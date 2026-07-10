import { defineField, defineType } from 'sanity'

export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
