import * as worker from './.output/server/index.mjs'

export default {
  fetch(request, env, ctx) {
    return worker.fetch(request, env, ctx)
  },
}
