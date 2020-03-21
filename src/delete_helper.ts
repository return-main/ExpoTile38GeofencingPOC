import {HELPERS} from './constants'

export async function deleteHelper(send_command: (command: string, args?: any[]) => Promise<any>, token: string) {
  await send_command('DEL', [HELPERS, token])
}
