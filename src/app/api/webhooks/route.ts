import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent, UserWebhookEvent, clerkClient } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'
import { db } from '@/lib/db'

function isUserEvent(event: WebhookEvent): event is UserWebhookEvent {
  return event.type.startsWith('user.')
}

interface UserInput {
    id: string
    name: string
    email: string
    picture: string
    role?: Role
  }

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env')
  }

  const wh = new Webhook(SIGNING_SECRET)
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 })
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
    return new Response('Error: Verification error', { status: 400 })
  }
  

  console.log(evt.type)


  if (isUserEvent(evt) && (evt.type == 'user.created' || evt.type == 'user.updated')) {
    const { data } = evt
    
    const primaryEmail = data.email_addresses.find(
      email => email.id === data.primary_email_address_id
    )?.email_address

    if (!primaryEmail) {
      console.error('No primary email found')
      return new Response('Error: No primary email', { status: 400 })
    }

    const user: UserInput = {
        id: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        email: primaryEmail,
        picture: data.image_url,
        role: 'USER' as Role
      }

    if(!user) return;

    const dbUser = await db.user.upsert({
        where: {
        email: user.email
        },
        update: user,
        create: {
        ...user,
        role: user.role || 'USER' as Role
        }
    })

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(user.id).catch(() => null);

    if(clerkUser) {
        await client.users.updateUserMetadata(user.id, {
            privateMetadata: {
                role : dbUser.role || 'USER'
            }
        })
    }
  }

  if (isUserEvent(evt) && evt.type == 'user.deleted') {
    const { data } = evt

    await db.user.delete({
        where: {
            id: data.id
        },
    })
   
  }

  return new Response('Webhook received', { status: 200 })
}