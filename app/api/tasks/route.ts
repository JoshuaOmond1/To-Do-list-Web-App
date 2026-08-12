import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { tasks } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

async function authenticatedUser() {
  const user = await getChatGPTUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  return user;
}

function taskId(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

function errorResponse(error: unknown) {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const user = await authenticatedUser();
    const rows = await getDb().select().from(tasks).where(eq(tasks.userId, user.userId)).orderBy(asc(tasks.completed), desc(tasks.createdAt), desc(tasks.id));
    return Response.json({ tasks: rows.map((task) => ({ ...task, completed: Boolean(task.completed) })) });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser();
    const body = await request.json() as { title?: string; priority?: string; dueDate?: string | null };
    const title = body.title?.trim() ?? "";
    const priority = ["low", "medium", "high"].includes(body.priority ?? "") ? body.priority as "low" | "medium" | "high" : "medium";
    if (!title || title.length > 160) return Response.json({ error: "Enter a task between 1 and 160 characters." }, { status: 400 });
    const [task] = await getDb().insert(tasks).values({ userId: user.userId, title, priority, dueDate: body.dueDate || null }).returning();
    return Response.json({ task: { ...task, completed: Boolean(task.completed) } }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticatedUser();
    const id = taskId(request);
    if (!id) return Response.json({ error: "Invalid task id." }, { status: 400 });
    const body = await request.json() as { title?: string; completed?: boolean; priority?: string; dueDate?: string | null };
    const changes: { title?: string; completed?: number; priority?: "low" | "medium" | "high"; dueDate?: string | null; updatedAt: string } = { updatedAt: new Date().toISOString() };
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title || title.length > 160) return Response.json({ error: "Enter a task between 1 and 160 characters." }, { status: 400 });
      changes.title = title;
    }
    if (body.completed !== undefined) changes.completed = body.completed ? 1 : 0;
    if (body.priority !== undefined && ["low", "medium", "high"].includes(body.priority)) changes.priority = body.priority as "low" | "medium" | "high";
    if (body.dueDate !== undefined) changes.dueDate = body.dueDate || null;
    const [task] = await getDb().update(tasks).set(changes).where(and(eq(tasks.id, id), eq(tasks.userId, user.userId))).returning();
    if (!task) return Response.json({ error: "Task not found." }, { status: 404 });
    return Response.json({ task: { ...task, completed: Boolean(task.completed) } });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const user = await authenticatedUser();
    const id = taskId(request);
    if (!id) return Response.json({ error: "Invalid task id." }, { status: 400 });
    const [deleted] = await getDb().delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.userId))).returning({ id: tasks.id });
    if (!deleted) return Response.json({ error: "Task not found." }, { status: 404 });
    return Response.json({ deleted: true });
  } catch (error) { return errorResponse(error); }
}
