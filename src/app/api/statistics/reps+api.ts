import { connectToDatabase } from "@/utils/connect-db";
import { withAuth } from "@/utils/middleware";
import formatDate from "@/utils/format-date";

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

    const result = await sessionsCollection
      .aggregate([
        // chỉ lấy session đã hoàn thành, VÀ có chứa bài tập với id này
        // (lọc sớm ở cấp session trước khi unwind, tránh unwind session không liên quan)
        {
          $match: {
            userId: user.sub,
            status: "Completed",
            "exercises.id": exerciseId,
          },
        },

        // tách từng exercise ra thành document riêng
        { $unwind: "$exercises" },

        // loại bỏ các exercise KHÁC trong cùng session (session có thể có
        // nhiều bài, nhưng chỉ giữ đúng bài đang được yêu cầu thống kê)
        { $match: { "exercises.id": exerciseId } },

        // tách từng set của đúng bài tập đó
        { $unwind: "$exercises.sets" },

        // gom lại theo session, cộng dồn tổng reps của riêng bài tập này trong buổi đó
        {
          $group: {
            _id: "$_id",
            date: { $first: "$date" },
            time: { $first: "$time" },
            totalReps: {
              $sum: {
                $cond: [
                  { $ne: ["$exercises.sets.reps", null] },
                  "$exercises.sets.reps",
                  0,
                ],
              },
            },
          },
        },

        { $sort: { date: 1, time: 1 } },
      ])
      .toArray();

    const data = result.map((session) => ({
      label: formatDate(session.date),
      value: session.totalReps,
    }));

    return Response.json(data);
  } catch (error) {
    console.error("Error fetching reps statistics:", error);
    return Response.json(
      { error: "Cannot fetch reps statistics" },
      { status: 500 },
    );
  }
});
