import { defineArrayMember, defineType } from 'sanity'

export const blockContentType = defineType({
  name: 'blockContent',
  title: 'Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
      ],
      lists: [ { title: 'Bullet', value: 'bullet' } ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [ { name: 'href', type: 'url', title: 'URL', validation: ( rule ) => rule.required() } ],
          }),
        ],
      },
    }),
  ],
})
