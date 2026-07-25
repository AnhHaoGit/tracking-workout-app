import { withAuth } from "@/utils/middleware";
import { connectToDatabase } from "../../../utils/connect-db";

export const POST = withAuth(async (req, user) => {
  const { routine } = await req.json();
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");
    const sub = user.sub;

    const result = await usersCollection.updateOne(
      { sub: sub },
      {
        $set: { routine: routine },
      },
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { error: "Cannot find user's data" },
        { status: 404 },
      );
    }
  } catch (e) {
    console.error("Error creating user:", e);
    return Response.json({ error: "Cannot save user's data" }, { status: 500 });
  }
  return Response.json({ message: "Update workout routine successfully!" });
});
