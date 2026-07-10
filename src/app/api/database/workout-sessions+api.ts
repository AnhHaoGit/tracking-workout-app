import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";

export const GET = withAuth(async (_req, user) => {
  try {
    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");
    const sessions = await sessionsCollection
      .find({ userId: user.sub })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(sessions);
  } catch (error) {
    console.error("Error fetching workout sessions:", error);
    return Response.json(
      { error: "Cannot fetch workout sessions" },
      { status: 500 },
    );
  }
});

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    const session = {
      ...body,
      userId: user.sub,
    };

    await sessionsCollection.insertOne(session);
    return Response.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating workout session:", error);
    return Response.json(
      { error: "Cannot create workout session" },
      { status: 500 },
    );
  }
});
