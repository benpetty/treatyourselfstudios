import { defineArrayMember, defineField, defineType } from 'sanity'

export const serviceCategoryType = defineType({
  name: 'serviceCategory',
  title: 'Service Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: ( rule ) => rule.required() }),
    defineField({ name: 'menuLabel', title: 'Nav Menu Label', type: 'string', description: 'Short label for the Services dropdown; defaults to Title if empty' }),
    defineField({ name: 'order', title: 'Display Order', type: 'number', validation: ( rule ) => rule.required().integer() }),
    defineField({ name: 'isAddOnCategory', title: 'Is the Add-Ons category?', type: 'boolean', initialValue: false, description: 'Add-ons render on the Packages page and as cross-sells, not as a standalone category page' }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', description: 'e.g. "Facials in West Seattle | Treat YourSelf Studios"', validation: ( rule ) => rule.required().max( 60 ) }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2, validation: ( rule ) => rule.required().max( 160 ) }),
    defineField({ name: 'intro', title: 'Intro Copy', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({
      name: 'educationBlocks', title: 'Education Blocks', type: 'array',
      description: '"What is a lash lift?"-style explainers, rendered as expandable sections',
      of: [ defineArrayMember({
        type: 'object',
        name: 'educationBlock',
        fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string', validation: ( rule ) => rule.required() }),
          defineField({ name: 'body', title: 'Body', type: 'blockContent', validation: ( rule ) => rule.required() }),
        ],
      }) ],
    }),
    defineField({ name: 'preCare', title: 'Pre-Care Guide', type: 'blockContent' }),
    defineField({ name: 'postCare', title: 'Post-Care Guide', type: 'blockContent' }),
    defineField({
      name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
  ],
  orderings: [ { title: 'Display Order', name: 'orderAsc', by: [ { field: 'order', direction: 'asc' } ] } ],
})
