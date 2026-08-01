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
        { $match: { userId: user.sub, status: "Completed", name } }, // filter

        // seperate data
        { $unwind: "$exercises" },
        { $unwind: "$exercises.sets" },

        // gom lại theo từng session (_id), cộng dồn volume = weight * reps
        // bỏ qua set có weight hoặc reps null (chưa nhập)
        {
          $group: {
            _id: "$_id",
            date: { $first: "$date" },
            time: { $first: "$time" },
            volume: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$exercises.sets.weight", null] },
                      { $ne: ["$exercises.sets.reps", null] },
                    ],
                  },
                  {
                    $multiply: [
                      "$exercises.sets.weight",
                      "$exercises.sets.reps",
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },

        // sắp xếp đúng thứ tự thời gian trước sau
        { $sort: { date: 1, time: 1 } },
      ])
      .toArray();

    const data = result.map((session) => ({
      label: formatDate(session.date),
      value: Math.round(session.volume * 100) / 100, // làm tròn 2 chữ số thập phân
    }));

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching volume statistics:", error);
    return Response.json(
      { error: "Cannot fetch volume statistics" },
      { status: 500 },
    );
  }
});
