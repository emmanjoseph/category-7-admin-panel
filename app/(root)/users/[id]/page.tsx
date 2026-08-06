"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CreditCard,
  Fingerprint,
  Mail,
  MapPin,
  Network,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UserDetails {
  id: number;
  address: string | null;
  createdAt: string;
  email: string;
  fullName: string;
  idNumber: string | null;
  ipAddress: string | null;
  isActive: boolean;
  lastLogin: string | null;
  loginAttempts: number;
  macAddress: string | null;
  paybillAccountNumber: string | null;
  phoneNumber: string | null;
  role: string;
  siteId: number | null;
  updatedAt: string;
  username: string;
}

const formatDate = (date: string | null) => {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function DetailRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof Mail;
  label: string;
  value: string | number | null;
  mono?: boolean;
}) {
  const displayValue = value === null || value === "" ? "Not provided" : value;

  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 break-words font-medium ${mono ? "font-mono text-xs" : "text-sm"}`}
        >
          {displayValue}
        </p>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="h-56 lg:col-span-1" />
      <Skeleton className="h-56 lg:col-span-2" />
      <Skeleton className="h-72 lg:col-span-2" />
      <Skeleton className="h-72" />
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${id}`, { signal });
        const data = await response.json();

        if (!response.ok || !data?.data?.user) {
          throw new Error(data?.message || "Unable to load this user");
        }

        setDetails(data.data.user);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Unable to load this user",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchDetails(controller.signal);
    return () => controller.abort();
  }, [fetchDetails]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/users" />}
          aria-label="Back to users"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-lg font-bold">User details</h1>
          <p className="text-sm text-muted-foreground">
            Account, contact and network information
          </p>
        </div>
      </div>

      {loading && <PageSkeleton />}

      {!loading && error && (
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>Couldn&apos;t load user</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void fetchDetails()}>
              <RefreshCw data-icon="inline-start" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && details && (
        <div className="grid gap-2 lg:grid-cols-3">
          <Card className="lg:col-span-1 bg-card">
            <CardContent className="flex h-full flex-col items-center justify-center py-4 text-center">
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-linear-150 from-emerald-500 to-violet-400 text-white text-2xl font-semibold ring-4 ring-primary/5">
                {initialsFor(details.fullName)}
              </div>
              <h2 className="text-lg font-semibold">{details.fullName}</h2>
              <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">
                @{details.username}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {details.role}
                </Badge>
                <Badge variant={details.isActive ? "outline" : "destructive"}>
                  <span
                    className={`size-1.5 rounded-full ${details.isActive ? "bg-emerald-500" : "bg-destructive"}`}
                  />
                  {details.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                User ID #{details.id}
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-indigo-200/5 ring-1 ring-inset ring-indigo-200/20">
            <CardHeader>
              <CardTitle>Contact information</CardTitle>
              <CardDescription>
                Personal and contact details associated with this account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid divide-y sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              <DetailRow
                icon={Mail}
                label="Email address"
                value={details.email}
              />
              <DetailRow
                icon={Phone}
                label="Phone number"
                value={details.phoneNumber}
              />
              <DetailRow
                icon={MapPin}
                label="Physical address"
                value={details.address}
              />
              <DetailRow
                icon={Fingerprint}
                label="ID number"
                value={details.idNumber}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-fuchsia-200/5 ring-1 ring-inset ring-fuchsia-200/20 shadow-sm">
            <CardHeader>
              <CardTitle>Network & billing</CardTitle>
              <CardDescription>
                Connection identifiers and billing references.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid divide-y sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              <DetailRow
                icon={Network}
                label="IP address"
                value={details.ipAddress}
                mono
              />
              <DetailRow
                icon={Wifi}
                label="MAC address"
                value={details.macAddress}
                mono
              />
              <DetailRow
                icon={CreditCard}
                label="Paybill account number"
                value={details.paybillAccountNumber}
                mono
              />
              <DetailRow
                icon={UserRound}
                label="Site ID"
                value={details.siteId}
              />
            </CardContent>
          </Card>

          <Card className="bg-red-200/5 ring-1 ring-inset ring-red-200/20 shadow-sm">
            <CardHeader>
              <CardTitle>Account activity</CardTitle>
              <CardDescription>Security and account timeline.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <DetailRow
                icon={Clock3}
                label="Last login"
                value={formatDate(details.lastLogin)}
              />
              <DetailRow
                icon={ShieldCheck}
                label="Login attempts"
                value={details.loginAttempts}
              />
              <DetailRow
                icon={CalendarDays}
                label="Created"
                value={formatDate(details.createdAt)}
              />
              <DetailRow
                icon={CalendarDays}
                label="Last updated"
                value={formatDate(details.updatedAt)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
