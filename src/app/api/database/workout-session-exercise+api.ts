import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import { ObjectId } from "mongodb";

export const DELETE = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const _id = body._id;
    const exerciseId = body.exerciseId;

    if (!_id || exerciseId === undefined) {
      return Response.json(
        { error: "Missing _id or exerciseId." },
        { status: 400 },
      );
    }

    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    const session = await sessionsCollection.findOne({
      _id: new ObjectId(_id),
      userId: user.sub,
    });

    if (!session) {
      return Response.json(
        { error: "Workout session not found." },
        { status: 404 },
      );
    }

    const updatedExercises = session.exercises.filter(
      (exercise: any) => String(exercise.id) !== String(exerciseId),
    );

    const result = await sessionsCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { exercises: updatedExercises } },
      { returnDocument: "after" },
    );

    return Response.json({
      message: "Delete exercise successfully!",
      session: result,
    });
  } catch (error) {
    return Response.json({ error: "Cannot delete exercise." }, { status: 500 });
  }
});

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const _id = body._id;
    const exercises = body.exercises;

    if (!_id || !Array.isArray(exercises) || exercises.length === 0) {
      return Response.json(
        { error: "Missing _id or exercises." },
        { status: 400 },
      );
    }

    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    const session = await sessionsCollection.findOne({
      _id: new ObjectId(_id),
      userId: user.sub,
    });

    if (!session) {
      return Response.json(
        { error: "Workout session not found." },
        { status: 404 },
      );
    }

    const updatedExercises = [...session.exercises, ...exercises];

    const result = await sessionsCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { exercises: updatedExercises } },
      { returnDocument: "after" },
    );

    return Response.json({
      message: "Add exercises successfully!",
      session: result,
    });
  } catch (error) {
    return Response.json({ error: "Cannot add exercises." }, { status: 500 });
  }
});