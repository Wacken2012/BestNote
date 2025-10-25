/**
 * CalDAV placeholder - suggest using a caldav library or direct HTTP requests with proper auth.
 * Next steps: implement OAuth2 or app-password authentication and use CalDAV XML requests.
 */

import axios from 'axios'

export async function fetchCalendarEvents() {
  const resp = await axios.get('/api/calendar')
  return resp.data
}
