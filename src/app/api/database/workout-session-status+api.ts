import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import { ObjectId } from "mongodb";

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const _id = body._id;
    const status = body.status;

    if (!_id || !ObjectId.isValid(_id)) {
      return Response.json({ error: "Invalid session id" }, { status: 400 });
    }

    const current = new Date();
    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    const update =
      status === "In progress"
        ? { $set: { status, startedAt: current } }
        : { $set: { status, finishedAt: current } };

    const result = await sessionsCollection.updateOne(
      { _id: new ObjectId(_id), userId: user.sub },
      update,
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { error: "Session not found or not authorized" },
        { status: 404 },
      );
    }

    return Response.json({
      message: "Workout session status updated successfully!",
      current,
    });
  } catch (error) {
    console.error("Error changing workout session status:", error);
    return Response.json(
      { error: "Cannot change workout session status" },
      { status: 500 },
    );
  }
});
