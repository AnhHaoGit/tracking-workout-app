import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import { ObjectId } from "mongodb";

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

export const DELETE = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const _id = body._id;
    if (!_id) {
      return Response.json({ error: "Missing _id" }, { status: 400 });
    }
    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");
    await sessionsCollection.deleteOne({
      _id: new ObjectId(_id),
      userId: user.sub,
    });

    return Response.json({ success: true, _id }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Cannot delete workout session" },
      { status: 500 },
    );
  }
});
