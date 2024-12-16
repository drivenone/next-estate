import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const wh = new Webhook(SIGNING_SECRET)
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (!id) {
    return new Response('Error: No user ID provided', {
      status: 400,
    })
  }

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { first_name, last_name, image_url, email_addresses } = evt.data;
    try {
      const user = await createOrUpdateUser(
        id,
        first_name || null,
        last_name || null,
        image_url || '',
        email_addresses || []
      );
      
      if (user && eventType === 'user.created') {
        try {
          const clerk = await clerkClient();
          await clerk.users.updateUserMetadata(id, {
            publicMetadata: {
              userMongoId: user._id, 
            },
          });
        } catch (error) {
          console.log('Error: Could not update user metadata:', error);
        }
      }
    } catch (error) {
      console.log('Error: Could not create or update user:', error);
      return new Response('Error: Could not create or update user', {
        status: 400,
      });
    }
  }

  if (eventType === 'user.deleted' && id) {
    try {
      await deleteUser(id);
    } catch (error) {
      console.log('Error: Could not delete user:', error);
      return new Response('Error: Could not delete user', {
        status: 400,
      });
    }
  }

  return new Response('Webhook received', { status: 200 })
}