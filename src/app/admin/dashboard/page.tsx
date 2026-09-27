"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

type StudentProfile = {
  user_id: string;
  full_name: string;
  email: string;
  age: number | null;
  status: string;
  created_at: string;
};

type TeacherProfile = {
  user_id: string;
  email: string;
  name: string;
  is_teacher: boolean;
  status: string;
  created_at: string;
};

type AdminStats = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  upcomingMeetings: number;
  recentAnnouncements: number;
};

type Tab = "overview" | "students" | "teachers";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [upcomingMeetings, setUpcomingMeetings] = useState<
    { id: string; title: string; date: string; start_time: string; status: string }[]
  >([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    { id: string; title: string; created_at: string }[]
  >([]);

  const [studentForm, setStudentForm] = useState({
    full_name: "",
    email: "",
    password: "",
    age: "",
    mun_experience: "",
    debate_experience: "",
    goals: "",
  });
  const [studentFormBusy, setStudentFormBusy] = useState(false);

  const [teacherForm, setTeacherForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [teacherFormBusy, setTeacherFormBusy] = useState(false);

  const loadAuthorization = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      window.location.replace("/admin/login");
      return;
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_profiles")
      .select("is_active")
      .eq("user_id", sessionData.session.user.id)
      .maybeSingle();

    if (adminError) {
      setError("We couldn't verify admin authorization.");
      setStatus("error");
      return;
    }

    if (!adminProfile?.is_active) {
      setStatus("denied");
      return;
    }

    setStatus("ready");
  }, []);

  const refreshData = useCallback(async () => {
    const supabase = getSupabaseClient();

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalTeachers,
      activeTeachers,
      upcomingMeetingsCount,
      recentAnnouncementsCount,
      studentList,
      teacherList,
      meetingsList,
      announcementsList,
    ] = await Promise.all([
      supabase.from("student_profiles").select("id", { count: "exact", head: true }),
      supabase.from("student_profiles").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
      supabase.from("student_profiles").select("id", { count: "exact", head: true }).eq("status", "INACTIVE"),
      supabase.from("teacher_profiles").select("id", { count: "exact", head: true }),
      supabase.from("teacher_profiles").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
      supabase.from("meetings").select("id", { count: "exact", head: true }).eq("status", "UPCOMING"),
      supabase.from("announcements").select("id", { count: "exact", head: true }).order("created_at", { ascending: false }).limit(5),
      supabase.from("student_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("teacher_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("meetings").select("id, title, date, start_time, status").eq("status", "UPCOMING").order("date", { ascending: true }).order("start_time", { ascending: true }).limit(5),
      supabase.from("announcements").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    const failed = [totalStudents, activeStudents, inactiveStudents, totalTeachers, activeTeachers, upcomingMeetingsCount, recentAnnouncementsCount, studentList, teacherList, meetingsList, announcementsList].find((r) => r.error);

    if (failed?.error) {
      throw new Error("We couldn't load platform data. Please try again.");
    }

    setStats({
      totalStudents: totalStudents.count ?? 0,
      activeStudents: activeStudents.count ?? 0,
      inactiveStudents: inactiveStudents.count ?? 0,
      totalTeachers: totalTeachers.count ?? 0,
      activeTeachers: activeTeachers.count ?? 0,
      upcomingMeetings: upcomingMeetingsCount.count ?? 0,
      recentAnnouncements: recentAnnouncementsCount.count ?? 0,
    });
    setStudents((studentList.data ?? []) as StudentProfile[]);
    setTeachers((teacherList.data ?? []) as TeacherProfile[]);
    setUpcomingMeetings((meetingsList.data ?? []) as { id: string; title: string; date: string; start_time: string; status: string }[]);
    setRecentAnnouncements((announcementsList.data ?? []) as { id: string; title: string; created_at: string }[]);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadAuthorization());
  }, [loadAuthorization]);

  useEffect(() => {
    if (status !== "ready") return;

    let active = true;

    void Promise.resolve()
      .then(() => refreshData())
      .catch((loadError: Error) => {
        if (active) {
          setError(loadError.message);
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [status, refreshData]);

  const toggleStudentStatus = async (student: StudentProfile) => {
    setBusyId(student.user_id);
    setActionError("");

    const nextStatus = student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const response = await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: student.user_id, status: nextStatus }),
    });

    setBusyId("");

    if (!response.ok) {
      setActionError("We couldn't update this student right now.");
      return;
    }

    await refreshData();
  };

  const toggleTeacherStatus = async (teacher: TeacherProfile) => {
    setBusyId(teacher.user_id);
    setActionError("");

    const nextStatus = teacher.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const response = await fetch("/api/admin/teachers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: teacher.user_id, status: nextStatus }),
    });

    setBusyId("");

    if (!response.ok) {
      setActionError("We couldn't update this teacher right now.");
      return;
    }

    await refreshData();
  };

  const createStudent = async () => {
    setStudentFormBusy(true);
    setActionError("");

    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...studentForm,
          age: studentForm.age === "" ? null : Number(studentForm.age),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(payload?.error ?? "We couldn't create this student right now.");
        return;
      }

      setStudentForm({ full_name: "", email: "", password: "", age: "", mun_experience: "", debate_experience: "", goals: "" });
      await refreshData();
    } finally {
      setStudentFormBusy(false);
    }
  };

  const createTeacher = async () => {
    setTeacherFormBusy(true);
    setActionError("");

    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherForm),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setActionError(payload?.error ?? "We couldn't create this teacher right now.");
        return;
      }

      setTeacherForm({ full_name: "", email: "", password: "" });
      await refreshData();
    } finally {
      setTeacherFormBusy(false);
    }
  };

  const logOut = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/admin/login");
  };

  if (status === "loading") {
    return <DashboardShell onTabChange={setTab}><LoadingState /></DashboardShell>;
  }

  if (status === "denied") {
    return (
      <DashboardShell onTabChange={setTab}>
        <EmptyState
          title="ACCESS DENIED"
          message="This dashboard is restricted to the Vidwan administrator."
          action="BACK TO ADMIN LOGIN"
          onAction={() => window.location.replace("/admin/login")}
        />
      </DashboardShell>
    );
  }

  if (status === "error") {
    return <DashboardShell onTabChange={setTab}><EmptyState title="WE COULDN'T LOAD THIS" message={error} action="TRY AGAIN" onAction={() => window.location.reload()} /></DashboardShell>;
  }

  const filteredStudents = students.filter((student) => {
    const term = studentSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      student.full_name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardShell onTabChange={setTab}>
      <header className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#78b8ff]">Master admin</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] sm:text-6xl">Vidwan Control</h1>
        </div>
        <button onClick={logOut} className="min-h-11 self-start rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 transition hover:border-[#2387ff]/50 hover:text-white">Log out</button>
      </header>

      <div className="mt-6 flex gap-1.5 sm:mt-8 sm:gap-2">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Dashboard</TabButton>
        <TabButton active={tab === "students"} onClick={() => setTab("students")}>Students <span>{stats?.totalStudents ?? 0}</span></TabButton>
        <TabButton active={tab === "teachers"} onClick={() => setTab("teachers")}>Teachers <span>{stats?.totalTeachers ?? 0}</span></TabButton>
      </div>

      {actionError && <p role="alert" className="mt-4 text-sm text-red-200">{actionError}</p>}

      {tab === "overview" && (
        <section className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Students" value={stats?.totalStudents ?? 0} />
            <Stat label="Active students" value={stats?.activeStudents ?? 0} />
            <Stat label="Inactive students" value={stats?.inactiveStudents ?? 0} />
            <Stat label="Teachers" value={stats?.totalTeachers ?? 0} />
            <Stat label="Active teachers" value={stats?.activeTeachers ?? 0} />
            <Stat label="Upcoming meetings" value={stats?.upcomingMeetings ?? 0} />
            <Stat label="Recent announcements" value={stats?.recentAnnouncements ?? 0} />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 p-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">Upcoming meetings</p>
              <ul className="mt-5 space-y-3">
                {upcomingMeetings.length === 0 && <li className="text-sm text-white/40">No upcoming meetings.</li>}
                {upcomingMeetings.map((meeting) => (
                  <li key={meeting.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                    <span className="font-semibold text-white">{meeting.title}</span>
                    <span className="text-xs text-white/40">{formatDate(meeting.date)} · {meeting.start_time.slice(0, 5)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 p-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">Recent announcements</p>
              <ul className="mt-5 space-y-3">
                {recentAnnouncements.length === 0 && <li className="text-sm text-white/40">No announcements yet.</li>}
                {recentAnnouncements.map((announcement) => (
                  <li key={announcement.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                    <span className="font-semibold text-white">{announcement.title}</span>
                    <span className="text-xs text-white/40">{formatDate(announcement.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {tab === "students" && (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 p-4 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">Students</p>
            <input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search students..." className="w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm text-white outline-none focus:border-[#2387ff]/60 sm:max-w-xs" />
          </div>

          <details className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.18em] text-[#8bc3ff]">Create student account</summary>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void createStudent();
              }}
            >
              <Input label="FULL NAME" value={studentForm.full_name} onChange={(value) => setStudentForm({ ...studentForm, full_name: value })} required />
              <Input label="EMAIL" type="email" value={studentForm.email} onChange={(value) => setStudentForm({ ...studentForm, email: value })} required />
              <Input label="TEMPORARY PASSWORD" type="password" value={studentForm.password} onChange={(value) => setStudentForm({ ...studentForm, password: value })} required />
              <Input label="AGE" type="number" value={studentForm.age} onChange={(value) => setStudentForm({ ...studentForm, age: value })} />
              <Input label="MUN EXPERIENCE" value={studentForm.mun_experience} onChange={(value) => setStudentForm({ ...studentForm, mun_experience: value })} />
              <Input label="DEBATE EXPERIENCE" value={studentForm.debate_experience} onChange={(value) => setStudentForm({ ...studentForm, debate_experience: value })} />
              <div className="sm:col-span-2">
                <Input label="GOALS" value={studentForm.goals} onChange={(value) => setStudentForm({ ...studentForm, goals: value })} />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={studentFormBusy} className="min-h-11 rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white disabled:opacity-60">{studentFormBusy ? "Creating..." : "Create student →"}</button>
              </div>
            </form>
          </details>

          <div className="mt-6 grid gap-3 lg:hidden">
            {filteredStudents.length === 0 && <p className="py-10 text-center text-sm text-white/40">No students found.</p>}
            {filteredStudents.map((student) => (
              <div key={student.user_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{student.full_name}</p>
                    <p className="mt-1 text-xs text-white/40">{student.email}</p>
                  </div>
                  <StatusPill status={student.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/35">{student.age ? `${student.age} yrs` : ""} · {formatDate(student.created_at)}</span>
                  <button disabled={busyId === student.user_id} onClick={() => void toggleStudentStatus(student)} className="rounded-full border border-[#2387ff]/35 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8bc3ff] hover:bg-[#2387ff]/15 disabled:opacity-50">{busyId === student.user_id ? "Saving..." : student.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[9px] uppercase tracking-[0.22em] text-white/35">
                <tr><th className="px-3 py-4">Student</th><th className="px-3 py-4">Email</th><th className="px-3 py-4">Age</th><th className="px-3 py-4">Status</th><th className="px-3 py-4">Created</th><th className="px-3 py-4">Action</th></tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-white/40">No students found.</td></tr>}
                {filteredStudents.map((student) => (
                  <tr key={student.user_id} className="border-b border-white/[0.06] text-white/65 transition hover:bg-[#2387ff]/[0.08]">
                    <td className="px-3 py-4 font-semibold text-white">{student.full_name}</td>
                    <td className="px-3 py-4">{student.email}</td>
                    <td className="px-3 py-4">{student.age ?? "—"}</td>
                    <td className="px-3 py-4"><StatusPill status={student.status} /></td>
                    <td className="px-3 py-4 text-xs text-white/40">{formatDate(student.created_at)}</td>
                    <td className="px-3 py-4">
                      <button disabled={busyId === student.user_id} onClick={() => void toggleStudentStatus(student)} className="rounded-full border border-[#2387ff]/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8bc3ff] hover:bg-[#2387ff]/15 disabled:opacity-50">{busyId === student.user_id ? "Saving..." : student.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "teachers" && (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 p-4 sm:p-7">
          <p className="border-b border-white/10 pb-6 text-[10px] uppercase tracking-[0.4em] text-[#78b8ff]">Teachers</p>

          <details className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.18em] text-[#8bc3ff]">Create teacher account</summary>
            <form
              className="mt-5 grid gap-4 sm:grid-cols-3"
              onSubmit={(event) => {
                event.preventDefault();
                void createTeacher();
              }}
            >
              <Input label="FULL NAME" value={teacherForm.full_name} onChange={(value) => setTeacherForm({ ...teacherForm, full_name: value })} required />
              <Input label="EMAIL" type="email" value={teacherForm.email} onChange={(value) => setTeacherForm({ ...teacherForm, email: value })} required />
              <Input label="TEMPORARY PASSWORD" type="password" value={teacherForm.password} onChange={(value) => setTeacherForm({ ...teacherForm, password: value })} required />
              <div className="sm:col-span-3">
                <button type="submit" disabled={teacherFormBusy} className="min-h-11 rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#071321] transition hover:bg-[#2387ff] hover:text-white disabled:opacity-60">{teacherFormBusy ? "Creating..." : "Create teacher →"}</button>
              </div>
            </form>
          </details>

          <div className="mt-6 grid gap-3 lg:hidden">
            {teachers.length === 0 && <p className="py-10 text-center text-sm text-white/40">No teachers yet.</p>}
            {teachers.map((teacher) => (
              <div key={teacher.user_id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{teacher.name}</p>
                    <p className="mt-1 text-xs text-white/40">{teacher.email}</p>
                  </div>
                  <StatusPill status={teacher.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/35">{formatDate(teacher.created_at)}</span>
                  <button disabled={busyId === teacher.user_id} onClick={() => void toggleTeacherStatus(teacher)} className="rounded-full border border-[#2387ff]/35 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8bc3ff] hover:bg-[#2387ff]/15 disabled:opacity-50">{busyId === teacher.user_id ? "Saving..." : teacher.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[9px] uppercase tracking-[0.22em] text-white/35">
                <tr><th className="px-3 py-4">Teacher</th><th className="px-3 py-4">Email</th><th className="px-3 py-4">Status</th><th className="px-3 py-4">Created</th><th className="px-3 py-4">Action</th></tr>
              </thead>
              <tbody>
                {teachers.length === 0 && <tr><td colSpan={5} className="px-3 py-10 text-center text-white/40">No teachers yet.</td></tr>}
                {teachers.map((teacher) => (
                  <tr key={teacher.user_id} className="border-b border-white/[0.06] text-white/65 transition hover:bg-[#2387ff]/[0.08]">
                    <td className="px-3 py-4 font-semibold text-white">{teacher.name}</td>
                    <td className="px-3 py-4">{teacher.email}</td>
                    <td className="px-3 py-4"><StatusPill status={teacher.status} /></td>
                    <td className="px-3 py-4 text-xs text-white/40">{formatDate(teacher.created_at)}</td>
                    <td className="px-3 py-4">
                      <button disabled={busyId === teacher.user_id} onClick={() => void toggleTeacherStatus(teacher)} className="rounded-full border border-[#2387ff]/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#8bc3ff] hover:bg-[#2387ff]/15 disabled:opacity-50">{busyId === teacher.user_id ? "Saving..." : teacher.status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

function DashboardShell({ onTabChange, children }: { onTabChange: (tab: Tab) => void; children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#071321] px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white sm:min-h-screen sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_circle_at_80%_15%,rgba(35,135,255,0.14),transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <nav className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Link href="/" aria-label="Vidwan home" className="flex items-center">
            <Image src="/images/vidwan-logo.png" alt="Vidwan" width={128} height={128} className="h-10 w-10 object-contain" />
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/dashboard" className="rounded-full bg-[#2387ff]/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8bc3ff] transition hover:bg-[#2387ff]/25">Dashboard</Link>
            <button onClick={() => onTabChange("students")} className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white">Students</button>
            <button onClick={() => onTabChange("teachers")} className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white">Teachers</button>
            <Link href="/teacher/meetings" className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white">Meetings</Link>
            <Link href="/teacher/announcements" className="rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition hover:border-[#2387ff]/40 hover:bg-[#2387ff]/10 hover:text-white">Announcements</Link>
          </div>

          <span className="hidden text-right text-[9px] uppercase tracking-[0.2em] text-white/35 sm:block sm:text-[10px] sm:tracking-[0.28em]">
            Master control
          </span>
        </nav>

        <div className="mt-8 sm:mt-12">{children}</div>
      </div>
    </main>
  );
}

function LoadingState() {
  return <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-white/40">Loading admin workspace...</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-[9px] uppercase tracking-[0.24em] text-white/35">{label}</p><p className="mt-4 text-4xl font-bold tracking-[-0.06em] text-[#8bc3ff]">{value}</p></div>;
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition ${active ? "bg-[#2387ff]/20 text-[#8bc3ff]" : "text-white/40 hover:bg-white/[0.05] hover:text-white"}`}>{children}</button>;
}

function StatusPill({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return <span className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${active ? "bg-[#2387ff]/15 text-[#8bc3ff]" : "bg-white/[0.06] text-white/40"}`}>{status}</span>;
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-white/55">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#071321]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-[#2387ff]/60" />
    </label>
  );
}

function EmptyState({ title, message, action, onAction }: { title: string; message: string; action: string; onAction?: () => void }) {
  return <div className="rounded-[2rem] border border-white/10 bg-[#0a1b2e]/80 px-6 py-24 text-center"><p className="text-3xl font-bold tracking-[-0.05em]">{title}</p><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/45">{message}</p><button onClick={onAction} className="mt-8 rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#071321]">{action}</button></div>;
}
