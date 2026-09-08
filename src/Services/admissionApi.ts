const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function submitAdmission(formData: FormData) {
  const response = await fetch(`${BASE_URL}/admissions`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
}
