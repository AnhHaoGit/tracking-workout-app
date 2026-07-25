import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import { ObjectId } from "mongodb";

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const updatedWorkoutSession = body.updatedWorkoutSession;

    const { _id, userId, ...sessionData } = updatedWorkoutSession;
    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(_id), userId: user.sub },
      { $set: sessionData },
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { error: "Session not found or not authorized" },
        { status: 404 },
      );
    }

    return Response.json({ message: "Save the session successfully!" });
  } catch (error) {
    console.error("Error saving workout session:", error);
    return Response.json(
      { error: "Cannot save workout session" },
      { status: 500 },
    );
  }
});

export const GET = withAuth(async (_req, user) => {
  try {
    const { searchParams } = new URL(_req.url);
    const _id = searchParams.get("id");

    if (!_id || !ObjectId.isValid(_id)) {
      return Response.json({ error: "Invalid session id" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection("workoutSessions").findOne({
      _id: new ObjectId(_id),
      userId: user.sub,
    });

    if (!result) {
      return Response.json(
        { error: "Session not found or not authorized" },
        { status: 404 },
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error("Error fetching workout session:", error);
    return Response.json(
      { error: "Cannot fetch workout session" },
      { status: 500 },
    );
  }
});
