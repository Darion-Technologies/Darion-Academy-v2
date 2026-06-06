import Link from "next/link";
import { markNotificationReadAction } from "@/app/actions/account";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <><PageHeader title="Notifications" description="Updates about assignments, reviews, and certificates." /><div className="space-y-3">{items.map((item)=><Card key={item.id} className={`flex items-center gap-4 p-4 ${!item.read ? "border-blue-200 bg-blue-50/30" : ""}`}><div className="flex-1"><div className="flex items-center gap-2"><h2 className="font-semibold">{item.title}</h2>{!item.read && <Badge className="bg-blue-100 text-blue-700">New</Badge>}</div><p className="mt-1 text-sm text-slate-600">{item.message}</p><p className="mt-1 text-xs text-slate-400">{item.createdAt.toLocaleString()}</p></div>{item.href && <Button variant="outline" size="sm" asChild><Link href={item.href}>Open</Link></Button>}{!item.read && <form action={markNotificationReadAction}><input type="hidden" name="id" value={item.id} /><SubmitButton variant="ghost" size="sm" pendingText="Updating...">Mark read</SubmitButton></form>}</Card>)}</div></>;
}
