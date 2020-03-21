import {HELPERS} from './constants'
import {Helper} from './helper'

export async function getHelpers(send_command: (command: string, args?: any[]) => Promise<any>, latitude: number, longitude: number, radius = 500): Promise<Helper[]> {
  const reply = await send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude, radius]);
  return reply[1].map((array: any[]) => ({token: array[0], latitude, longitude}));
}
