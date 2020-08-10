import {HELPERS} from './constants'

/**
 * Supprime un assitant avant qu'il n'expire au bout d'une minute
 * Cette fonction est appelee quand un utilisateur ferme le service d'aide proprement
 * @param send_command
 * @param token
 */
export async function deleteHelper(send_command: (command: string, args?: any[]) => Promise<any>, token: string) {
  await send_command('DEL', [HELPERS, token])
}
