const {HELPERS} = require('./constants');

export async function deleteHelper(send_command: (command: string, args?: any[]) => Promise<any>, id: string) {
  await send_command('DEL', [HELPERS, id])
}
