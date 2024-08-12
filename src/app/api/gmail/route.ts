import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/[...nextauth]/Options';
 // Update to match your actual path

type Email = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  sizeEstimate: number;
  internalDate: string;
};

type GmailMessage = {
  id: string;
  threadId?: string;
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(options);

  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: session.accessToken,
  });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages: GmailMessage[] = (response.data.messages || []).filter(
      (message): message is GmailMessage => message.id !== null && message.id !== undefined
    );

    const emails: Email[] = await Promise.all(
      messages.map(async (message: GmailMessage) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        // Extracting important fields
        const headers = msg.data.payload?.headers || [];
        const getHeader = (name: string) => headers.find(header => header.name === name)?.value || '';

        const body = msg.data.payload?.parts?.map(part => {
          if (part.mimeType === 'text/plain') {
            return part.body?.data || '';
          } else if (part.mimeType === 'text/html') {
            return part.body?.data || '';
          }
          return '';
        }).join('') || '';

        return {
          id: message.id,
          threadId: msg.data.threadId || '',
          labelIds: msg.data.labelIds || [],
          snippet: msg.data.snippet || '',
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          date: getHeader('Date'),
          body: body ? Buffer.from(body, 'base64').toString('utf-8') : '',
          sizeEstimate: msg.data.sizeEstimate || 0,
          internalDate: msg.data.internalDate || '',
        };
      })
    );

    return NextResponse.json(emails);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching emails', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req); // Reuse the GET logic
}
