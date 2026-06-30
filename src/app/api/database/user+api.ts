import { withAuth } from "@/utils/middleware";
import { connectToDatabase } from "../../../utils/connect-db";

export const GET = withAuth(async (req, user) => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");
    const sub = user.sub;
    const userData = await usersCollection.findOne({ sub: sub });
    return Response.json(userData);
  } catch (e) {
    console.error("Error creating user:", e);
    return Response.json({ error: "Cannot save user's data" }, { status: 500 });
  }
});
