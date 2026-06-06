import { Award } from "lucide-react";
import { CertificateButton } from "@/components/certificate-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CertificatesPage() {
  const user = await requireUser();
  const certificates = await prisma.certificate.findMany({ where: user.role === "ADMIN" ? {} : { userId: user.id }, include: { course: true, user: true }, orderBy: { createdAt: "desc" } });
  return <><PageHeader title="Certificates" description="Verified credentials for approved course completions." />{!certificates.length ? <EmptyState title="No certificates yet" description="Certificates are generated automatically after course approval." /> : <div className="grid gap-5 md:grid-cols-2">{certificates.map((c)=><Card key={c.id}><CardContent className="flex items-center gap-5 pt-5"><span className="rounded-none bg-blue-50 p-4 text-blue-700"><Award className="size-8" /></span><div className="flex-1"><Badge className={c.status==="REVOKED"?"bg-red-50 text-red-700":c.status==="GENERATED"?"bg-emerald-50 text-emerald-700":""}>{c.status}</Badge><h2 className="mt-2 font-semibold">{c.course.title}</h2><p className="text-sm text-slate-500">{c.user.name} · {c.certificateId}</p><a className="mt-2 inline-block text-xs font-semibold text-blue-700" href={`/verify/${c.certificateId}`} target="_blank">Verify credential</a></div>{["GENERATED","ELIGIBLE"].includes(c.status) && <CertificateButton id={c.id} />}</CardContent></Card>)}</div>}</>;
}
