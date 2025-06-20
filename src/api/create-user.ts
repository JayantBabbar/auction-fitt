
// This is a reference implementation for the backend API endpoint
// You'll need to implement this on your backend server

import { clerkClient } from '@clerk/clerk-sdk-node';

interface CreateUserRequest {
  secretKey: string;
  user: {
    emailAddress: string[];
    password: string;
    firstName: string;
    lastName: string;
    unsafeMetadata: {
      role: 'admin' | 'bidder';
    };
  };
}

export async function createUser(req: Request): Promise<Response> {
  try {
    const { secretKey, user }: CreateUserRequest = await req.json();

    // Validate secret key
    if (!secretKey || !secretKey.startsWith('sk_')) {
      return new Response(
        JSON.stringify({ error: 'Invalid secret key' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the user using the clerkClient directly
    // Note: You need to set CLERK_SECRET_KEY environment variable on your server
    const newUser = await clerkClient.users.createUser({
      emailAddress: user.emailAddress,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      unsafeMetadata: user.unsafeMetadata,
    });

    return new Response(
      JSON.stringify({ success: true, userId: newUser.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create user', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Example Express.js implementation:
// app.post('/api/create-user', async (req, res) => {
//   const request = new Request('', {
//     method: 'POST',
//     body: JSON.stringify(req.body),
//   });
//   const response = await createUser(request);
//   const data = await response.json();
//   res.status(response.status).json(data);
// });
