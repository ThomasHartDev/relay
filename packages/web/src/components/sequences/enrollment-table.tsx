"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, MoreHorizontal, Play, Pause, Trash2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnrollContactsDialog } from "./enroll-contacts-dialog";
import { ENROLLMENT_STATUS_COLORS } from "@/lib/design-tokens";
import { ENROLLMENT_STATUS_LABELS, type EnrollmentStatus } from "@relay/shared";

interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface EnrollmentTableProps {
  sequenceId: string;
}

export function EnrollmentTable({ sequenceId }: EnrollmentTableProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sequences/${sequenceId}/enrollments`);
      if (res.ok) {
        const json = await res.json();
        setEnrollments(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sequenceId]);

  useEffect(() => {
    void fetchEnrollments();
  }, [fetchEnrollments]);

  async function handleStatusChange(enrollmentId: string, status: EnrollmentStatus) {
    const res = await fetch(`/api/sequences/${sequenceId}/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void fetchEnrollments();
  }

  async function handleRemove(enrollmentId: string) {
    const res = await fetch(`/api/sequences/${sequenceId}/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
    if (res.ok) void fetchEnrollments();
  }

  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Enrollments</h3>
          {!isLoading && (
            <p className="text-xs text-gray-400">
              {activeCount} active &middot; {completedCount} completed &middot; {enrollments.length}{" "}
              total
            </p>
          )}
        </div>
        <Button size="sm" onClick={() => setEnrollDialogOpen(true)}>
          <UserPlus className="mr-2 h-3.5 w-3.5" />
          Enroll
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-400">No contacts enrolled yet</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setEnrollDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-3.5 w-3.5" />
            Enroll Contacts
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {enrollments.map((enrollment) => {
            const colors = ENROLLMENT_STATUS_COLORS[enrollment.status];
            return (
              <div key={enrollment.id} className="flex items-center justify-between px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {enrollment.contact.firstName} {enrollment.contact.lastName}
                  </p>
                  <p className="truncate text-xs text-gray-400">{enrollment.contact.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px]"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {ENROLLMENT_STATUS_LABELS[enrollment.status]}
                  </Badge>

                  <span className="text-xs text-gray-400">
                    {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {enrollment.status === "ACTIVE" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, "PAUSED")}
                        >
                          <Pause className="mr-2 h-3.5 w-3.5" />
                          Pause
                        </DropdownMenuItem>
                      )}
                      {enrollment.status === "PAUSED" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, "ACTIVE")}
                        >
                          <Play className="mr-2 h-3.5 w-3.5" />
                          Resume
                        </DropdownMenuItem>
                      )}
                      {(enrollment.status === "ACTIVE" || enrollment.status === "PAUSED") && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(enrollment.id, "COMPLETED")}
                        >
                          <CheckCircle className="mr-2 h-3.5 w-3.5" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleRemove(enrollment.id)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EnrollContactsDialog
        open={enrollDialogOpen}
        onOpenChange={setEnrollDialogOpen}
        sequenceId={sequenceId}
        onEnrolled={fetchEnrollments}
      />
    </div>
  );
}
