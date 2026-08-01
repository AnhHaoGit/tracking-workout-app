import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import formatDate from "@/utils/format-date";

export const GET = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return Response.json(
        { error: "Missing required query param: name" },
        { status: 400 },
      );
    }

    const db = await connectToDatabase();
    const sessionsCollection = db.collection("workoutSessions");

    const result = await sessionsCollection
      .aggregate([
        {
          $match: {
            userId: user.sub,
            status: "Completed",
            name,
            startedAt: { $ne: null },
            finishedAt: { $ne: null },
          },
        },

        {
          $project: {
            date: 1,
            time: 1,
            durationMinutes: {
              $divide: [
                {
                  $subtract: [
                    { $toDate: "$finishedAt" },
                    { $toDate: "$startedAt" },
                  ],
                },
                60000,
              ],
            },
          },
        },

        // sắp xếp đúng thứ tự thời gian trước sau
        { $sort: { date: 1, time: 1 } },
      ])
      .toArray();

    const data = result.map((session) => ({
      label: formatDate(session.date),
      value: Math.round(session.durationMinutes * 100) / 100, // làm tròn 2 chữ số thập phân
    }));

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching duration statistics:", error);
    return Response.json(
      { error: "Cannot fetch duration statistics" },
      { status: 500 },
    );
  }
});
