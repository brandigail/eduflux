import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { certificates, courses, users } from "@/db/schema";
import { requireStudent } from "@/lib/api-auth";
import { ensureCertificate } from "@/lib/certificates";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/certificate/[courseId]">) {
  const guard = await requireStudent();
  if (guard.response) return guard.response;

  const { courseId } = await ctx.params;
  if (!(await ensureCertificate(guard.user.id, courseId))) {
    return Response.json({ error: "Finish every lesson and pass the quiz to earn this certificate." }, { status: 403 });
  }

  const db = getDb();
  const [row] = await db
    .select({
      certificateId: certificates.id,
      issuedAt: certificates.issuedAt,
      studentName: users.name,
      courseTitle: courses.title,
      instructorId: courses.instructorId,
    })
    .from(certificates)
    .innerJoin(users, eq(users.id, certificates.userId))
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(and(eq(certificates.userId, guard.user.id), eq(certificates.courseId, courseId)))
    .limit(1);
  if (!row) return Response.json({ error: "Certificate not found." }, { status: 404 });

  const [instructor] = await db.select({ name: users.name }).from(users).where(eq(users.id, row.instructorId)).limit(1);
  const pdf = await buildCertificatePdf({
    studentName: row.studentName,
    courseTitle: row.courseTitle,
    instructorName: instructor?.name ?? "EduFlux",
    issuedAt: row.issuedAt,
    certificateId: row.certificateId,
  });

  const safeName = row.courseTitle.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="eduflux-certificate-${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
