const tag = 'span'

export function setup(helper) {
  if (!helper.markdownIt) {
    return
  }

  helper.registerOptions((opts, siteSettings) => {
    opts.features[
      'discourse-a2a-bbcode'
    ] = !!siteSettings.discourse_a2a_bbcode_enabled
  })

  helper.whiteList([`${tag}.abb-follow`, `${tag}.abb-share`])

  helper.registerPlugin(md => {
    // services: coma-separated list of services. See the full list at https://www.addtoany.com/buttons/customize/follow_buttons.  => mandatory
    // user: username of the account to follow => mandatory
    md.inline.bbcode.ruler.push('abbfollow', {
      tag: 'abbfollow',
      replace: function(state, tagInfo, content) {
        const user = tagInfo.attrs.user
        if (!user) {
          return false
        }
        const services = tagInfo.attrs.services
        if (!services) {
          return false
        }
        let token = state.push(`${tag}_open`, tag, 1)
        token.attrs = [['class', 'abb-follow']]
        token = state.push('html_raw', '', 0)
        const servicesHtml = services
          .split(',')
          .map(
            s => `<a class="a2a_button_${s}" data-a2a-follow="${user}">${s}</a>`
          )
          .join('\n')
        // The a2a_target class is required to use the "target" AddToAny argument
        token.content = `
          <${tag} class="a2a_kit a2a_kit_size_32 a2a_default_style a2a_follow a2a_target">            
            ${servicesHtml}
          </${tag}>          
        `
        token = state.push(`${tag}_close`, tag, -1)
        return true
      }
    })
    
    // services: coma-separated list of services to be displayed right away (without having to use the + button). See the full list at https://www.addtoany.com/services/. By default, service is "twitter,facebook"
    // url: url to share. Default: current url. MUST BE A VALID URL, OTHERWISE FACEBOOK WON'T WORK.
    // Content of the bbcode: title to share. Default: current page title
    md.inline.bbcode.ruler.push('abbshare', {
      tag: 'abbshare',
      replace: function(state, tagInfo, content) {
        let token = state.push(`${tag}_open`, tag, 1)
        token.attrs = [['class', 'abb-share']]
        token = state.push('html_raw', '', 0)
        const services = tagInfo.attrs.services || 'twitter,facebook'
        const servicesHtml = services
          .split(',')
          .map(s => `<a class="a2a_button_${s}">${s}</a>`)
          .join('\n')
        const titleHtml = content ? ` data-a2a-title="${content}"` : ''
        const urlHtml = tagInfo.attrs.url
          ? ` data-a2a-url="${tagInfo.attrs.url}"`
          : ''
        // The a2a_target class is required to use the "target" AddToAny argument
        token.content = `
          <${tag} class="a2a_kit a2a_kit_size_32 a2a_default_style a2a_target"${titleHtml}${urlHtml}>
            ${servicesHtml}
            <a class="a2a_dd" href="https://www.addtoany.com/share"></a>
          </${tag}>
        `
        token = state.push(`${tag}_close`, tag, -1)
        return true
      }
    })
  })
}
