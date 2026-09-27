import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'xbsj15ow',
    dataset: 'production',
  },
  // Hosted at https://treatyourself.sanity.studio. Sanity CLI 6 prompts for
  // neither on deploy: studioHost names the URL, and appId identifies the
  // already-deployed Studio so `make deploy-studio` updates it in place.
  studioHost: 'treatyourself',
  deployment: {
    appId: 'y1b9e3b24shwgwz27cphnjgr',
  },
})
