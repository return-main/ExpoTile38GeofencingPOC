import {HELPERS} from './constants'
import {Helper} from './helper'
import {Point} from 'geojson'

function arrayToHelper(array: any[]): Helper {
  const token: string = array[0]
  const point: Point = JSON.parse(array[1])
  return ({
    exponentPushToken: token,
    latitude: point.coordinates[1],
    longitude: point.coordinates[0],
  })
}

export async function getHelpers(send_command: (command: string, args?: any[]) => Promise<any>, latitude: number, longitude: number, radius = 500): Promise<Helper[]> {
  const reply = await send_command('NEARBY', [HELPERS, 'POINT', latitude, longitude, radius]);
  return reply[1].map(arrayToHelper);
}
