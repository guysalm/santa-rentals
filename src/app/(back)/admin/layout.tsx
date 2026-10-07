import { Suspense } from "react";
import { requireStaff } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Skeleton } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:flex">
      <AdminNav />
      <main className="min-w-0 flex-1 px-4 py-8 lg:px-10">
        <Suspense fallback={<Skeleton />}>
          <Gate>{children}</Gate>
        </Suspense>
      </main>
      <ConfirmSubmit />
    </div>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return <>{children}</>;
}
