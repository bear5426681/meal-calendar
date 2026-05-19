import { handleOAuthRedirect, hasAuthFragmentInUrl, cleanAuthUrl } from 'src/utils/authRedirect'

/** 最早執行：還原 OAuth session 並清掉 /#/#access_token 網址 */
export default async () => {
  if (hasAuthFragmentInUrl()) {
    await handleOAuthRedirect()
  } else if (window.location.hash.match(/^#\/?access_token/)) {
    cleanAuthUrl()
  }
}
