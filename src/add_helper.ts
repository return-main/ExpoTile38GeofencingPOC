import {HELPERS} from './constants'
import {Helper} from './helper'

/**
 * Ajoute l'assistant à la base de données
 * Cet assistant expire apres 60 secondes
 * @param send_command
 * @param helper
 * @param expiration
 */
export async function addHelper(send_command: (command: string, args?: any[]) => Promise<any>, helper: Helper, expiration = 60) {
  await send_command('SET', [HELPERS, helper.exponentPushToken, 'POINT', helper.latitude, helper.longitude])
  // Expire the helper after 1 minute
  await send_command('EXPIRE', [HELPERS, helper.exponentPushToken, expiration])
}
