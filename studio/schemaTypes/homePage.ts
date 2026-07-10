import { defineField, defineType } from 'sanity'

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroHeading', title: 'Hero Heading', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'heroSubheading', title: 'Hero Subheading', type: 'text', rows: 3, validation: ( rule ) => rule.required() }),
    defineField({
      name: 'heroImage', title: 'Hero Image', type: 'image', options: { hotspot: true },
      fields: [ defineField({ name: 'alt', title: 'Alternative Text', type: 'string', validation: ( rule ) => rule.required() }) ],
    }),
    defineField({ name: 'welcomeHeading', title: 'Welcome Heading', type: 'string', validation: ( rule ) => rule.required() }),
    defineField({ name: 'welcomeBody', title: 'Welcome Body', type: 'blockContent', validation: ( rule ) => rule.required() }),
    defineField({ name: 'seoTitle', title: 'SEO Title', type: 'string', validation: ( rule ) => rule.required().max( 60 ) }),
    defineField({ name: 'seoDescription', title: 'SEO Description', type: 'text', rows: 2, validation: ( rule ) => rule.required().max( 160 ) }),
  ],
})
