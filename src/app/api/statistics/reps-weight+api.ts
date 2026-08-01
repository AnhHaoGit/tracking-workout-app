import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import formatDate from "@/utils/format-date";

const estimateOneRepMax = (weight: number, reps: number) => {
  return Math.round(weight * (1 + reps / 30) * 100) / 100;
};

export const GET = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const exerciseIdParam = searchParams.get("exerciseId");

    if (!exerciseIdParam) {
      return Response.json(
        { error: "Missing required query param: exerciseId" },
        { status: 400 },
      );
    }

    const exerciseId = Number(exerciseIdParam);

    if (Number.isNaN(exerciseId)) {
      return Response.json(
        { error: "exerciseId must be a number" },
        { status: 400 },
      );
    }

    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");
    const sessions = await sessionsCollection
      .aggregate([
        {
          $match: {
            userId: user.sub,
            status: "Completed",
            "exercises.id": exerciseId,
          },
        },
        { $unwind: "$exercises" },
        { $match: { "exercises.id": exerciseId } },
        {
          $project: {
            date: 1,
            time: 1,
            sets: "$exercises.sets",
          },
        },
        { $sort: { date: 1, time: 1 } },
      ])
      .toArray();

    if (sessions.length === 0) {
      return Response.json([]);
    }


    const maxSetsCount = Math.max(...sessions.map((s) => s.sets.length));

    const data = Array.from({ length: maxSetsCount }, (_, setIndex) =>
      sessions.map((session) => {
        const set = session.sets[setIndex];
        const hasData = set && set.weight !== null && set.reps !== null;

        return {
          label: formatDate(session.date),
          value: hasData ? estimateOneRepMax(set.weight, set.reps) : 0,
        };
      }),
    );

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching reps-weight statistics:", error);
    return Response.json(
      { error: "Cannot fetch reps-weight statistics" },
      { status: 500 },
    );
  }
});
