import type { User } from "@/src/context/UserContext";

export interface UserDisplay {
  name: string;
  photoUrl: string | null;
  initial: string;
}

// Each role keeps its name and photo in a different profile, so resolve them in one place
export function getUserDisplay(user: User | null | undefined): UserDisplay {
  if (!user) return { name: "", photoUrl: null, initial: "U" };

  const student = user.studentProfile;
  const teacher = user.teacherProfile;
  const parent = user.parentProfile;

  let name = "";
  let photoUrl: string | null = null;

  if (student) {
    name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
    photoUrl = student.photoUrl || null;
  } else if (teacher) {
    name = teacher.name || "";
    photoUrl = teacher.photoUrl || null;
  } else if (parent) {
    name = parent.fatherName || parent.motherName || "";
  }

  if (!name) {
    name =
      user.name ||
      user.email?.split("@")[0] ||
      user.role?.replace("_", " ") ||
      "User";
  }

  const firstChar = Array.from(name.trim())[0] || "U";

  return { name, photoUrl, initial: firstChar.toUpperCase() };
}