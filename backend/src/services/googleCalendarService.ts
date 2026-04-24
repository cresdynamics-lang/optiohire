import { URLSearchParams } from 'url'

export interface GoogleMeetEventOptions {
  summary: string
  description: string
  start: string
  end: string
  attendees: string[]
}

export class GoogleCalendarService {
  private clientId = process.env.GOOGLE_CLIENT_ID || ''
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  private refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || ''
  private calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
  private timezone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'UTC'

  isEnabled() {
    return !!this.clientId && !!this.clientSecret && !!this.refreshToken
  }

  private async getAccessToken(): Promise<string> {
    if (!this.isEnabled()) {
      throw new Error('Google Calendar integration is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALENDAR_REFRESH_TOKEN.')
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: 'refresh_token'
    })

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      throw new Error(`Google token refresh failed: ${tokenRes.status} ${errText}`)
    }

    const tokenData = await tokenRes.json() as { access_token?: string; expires_in?: number }
    if (!tokenData.access_token) {
      throw new Error('Google token refresh did not return an access token.')
    }

    return tokenData.access_token
  }

  async createMeetEvent(options: GoogleMeetEventOptions): Promise<{ meetingLink: string; eventId: string }> {
    const accessToken = await this.getAccessToken()

    const eventPayload = {
      summary: options.summary,
      description: options.description,
      start: {
        dateTime: options.start,
        timeZone: this.timezone
      },
      end: {
        dateTime: options.end,
        timeZone: this.timezone
      },
      attendees: options.attendees.filter(Boolean).map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `optiohire-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: true
      }
    }

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events?conferenceDataVersion=1`
    const res = await fetch(calendarUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Google Calendar event creation failed: ${res.status} ${errText}`)
    }

    const data = await res.json() as any
    const meetingLink = data.hangoutLink || data.conferenceData?.entryPoints?.find((entry: any) => entry.entryPointType === 'video')?.uri || data.htmlLink
    if (!meetingLink) {
      throw new Error('Google Calendar event did not return a meeting link.')
    }

    return {
      meetingLink,
      eventId: data.id || ''
    }
  }
}
