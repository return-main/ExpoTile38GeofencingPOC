import {HELPERS} from './constants'

export async function addHelper(send_command: (command: string, args?: any[]) => Promise<any>, id: string, latitude: number, longitude: number, expiration = 60) {
  await send_command('SET', [HELPERS, id, 'POINT', latitude, longitude])
  // Expire the helper after 1 minute
  await send_command('EXPIRE', [HELPERS, id, expiration])
}
