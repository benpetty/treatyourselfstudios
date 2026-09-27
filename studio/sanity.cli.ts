import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'xbsj15ow',
    dataset: 'production',
  },
  // Hosted at https://treatyourself.sanity.studio. Sanity CLI 6 no longer prompts
  // for a hostname on deploy, so `make deploy-studio` needs it pinned here.
  studioHost: 'treatyourself',
})
