import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
// import { schemaTypes } from './schemaTypes'
const schemaTypes: never[] = []

const SINGLETON_TYPES = new Set( [ 'siteSettings', 'homePage' ] )
const SINGLETON_ACTIONS = new Set( [ 'publish', 'discardChanges', 'restore' ] )

export default defineConfig({
  name: 'treatyourselfstudios',
  title: 'Treat YourSelf Studios',
  projectId: 'xbsj15ow',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: ( listBuilder ) =>
        listBuilder.list()
          .title( 'Content' )
          .items( [
            listBuilder.listItem()
              .title( 'Site Settings' )
              .id( 'siteSettings' )
              .child( listBuilder.document().schemaType( 'siteSettings' ).documentId( 'siteSettings' ) ),
            listBuilder.listItem()
              .title( 'Home Page' )
              .id( 'homePage' )
              .child( listBuilder.document().schemaType( 'homePage' ).documentId( 'homePage' ) ),
            listBuilder.divider(),
            listBuilder.documentTypeListItem( 'serviceCategory' ).title( 'Service Categories' ),
            listBuilder.documentTypeListItem( 'service' ).title( 'Services' ),
            listBuilder.documentTypeListItem( 'servicePackage' ).title( 'Packages' ),
            listBuilder.divider(),
            listBuilder.documentTypeListItem( 'deal' ).title( 'Deals & Specials' ),
            listBuilder.documentTypeListItem( 'faq' ).title( 'FAQs' ),
            listBuilder.documentTypeListItem( 'teamMember' ).title( 'Team Members' ),
            listBuilder.documentTypeListItem( 'testimonial' ).title( 'Testimonials' ),
          ] ),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: ( templates ) => templates.filter( ({ schemaType }) => !SINGLETON_TYPES.has( schemaType ) ),
  },
  document: {
    actions: ( input, context ) =>
      SINGLETON_TYPES.has( context.schemaType )
        ? input.filter( ({ action }) => action && SINGLETON_ACTIONS.has( action ) )
        : input,
  },
})
