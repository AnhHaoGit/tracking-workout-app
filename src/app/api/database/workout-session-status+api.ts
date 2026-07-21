import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import { ObjectId } from "mongodb";

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const _id = body._id;
    const status = body.status;
    const startedAt = body.startedAt;
    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    if (status === "In progress") {
      await sessionsCollection.updateOne(
        { _id: new ObjectId(_id), userId: user.sub },
        {
          $set: { status: status, startedAt: startedAt },
        },
      );
    } else {
      await sessionsCollection.updateOne(
        { _id: new ObjectId(_id), userId: user.sub },
        {
          $set: { status: status },
        },
      );
    }

    return Response.json({ message: "Start the session successfully!" });
  } catch (error) {
    console.error("Error changing workout session status:", error);
    return Response.json(
      { error: "Cannot change workout session status" },
      { status: 500 },
    );
  }
});
