import { defineField, defineType } from 'sanity'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. "Owner & Esthetician"', validation: ( rule ) => rule.required() }),
    defineField({ name: 'bio', title: 'Bio', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({
      name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
