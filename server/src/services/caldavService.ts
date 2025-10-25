import axios from 'axios'
import { URL } from 'url'

const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || ''
const AUTH_USER = process.env.NEXTCLOUD_USER || ''
const AUTH_PASS = process.env.NEXTCLOUD_PASS || ''

function authHeader() {
  return { Authorization: 'Basic ' + Buffer.from(`${AUTH_USER}:${AUTH_PASS}`).toString('base64') }
}

export async function fetchCalendar(calendarPath = ''): Promise<string> {
  if (!NEXTCLOUD_URL) throw new Error('NEXTCLOUD_URL not configured')
  // calendarPath might be something like '/remote.php/caldav/calendars/user/calendarname'
  const dest = new URL(calendarPath || '/remote.php/caldav', NEXTCLOUD_URL).toString()
  const res = await axios.get(dest, { headers: { ...authHeader(), Accept: 'text/calendar' }, responseType: 'text' })
  return res.data
}
