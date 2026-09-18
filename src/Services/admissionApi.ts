const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://al-iman-school-backend.vercel.app/api/v1";

/**
 * Backend Route: GET /admissions
 */
export async function getAdmissionRequests() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const response = await fetch(`${BASE_URL}/admissions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch admission applications from backend.");
  }

  const result = await response.json();
  return result.data || result;
}


export async function updateAdmissionStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const endpoint =
    status === "APPROVED"
      ? `${BASE_URL}/admissions/approve/${id}`
      : `${BASE_URL}/admissions/reject/${id}`;

  const options: RequestInit = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (status === "REJECTED") {
    options.body = JSON.stringify({
      reason: rejectionReason || "Application rejected by administrator.",
    });
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    throw new Error(`Failed to update application status to ${status}.`);
  }

  const result = await response.json();
  return result.data || result;
}