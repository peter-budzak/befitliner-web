/** Fail closed: production navigation is enabled only with an included build. */
export function webAppEnabled() {
  return process.env.FITLINER_WEB_APP_ENABLED === 'true';
}

export const WEB_APP_LOGIN = '/login';
export const loginLabels: Record<string, string> = {
  sk: 'Prihlásiť sa', en: 'Log in', de: 'Anmelden', es: 'Iniciar sesión',
  fr: 'Se connecter', 'zh-Hans': '登录', pl: 'Zaloguj się',
};
