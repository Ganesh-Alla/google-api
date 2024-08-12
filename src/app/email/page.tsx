"use client"
import { useEffect, useState } from 'react';

type Email = {
  id: string;
  snippet: string;
};

export default function Emails() {
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    async function fetchEmails() {
      const res = await fetch('/api/gmail');
      const data: Email[] = await res.json();
      setEmails(data);
    }

    fetchEmails();
  }, []);
console.log(emails);
  return (
    <div>
      <h1>Your Emails</h1>
      <ul>
        {emails.map((email) => (
          <li key={email.id}>
            <h2>{email.snippet}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}
