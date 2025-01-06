import { createSession } from "@/lib/session";

export async function login(state, formData) {
  const response = await fetch("https://your-external-api.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();
  await createSession(data);

  if (response.ok) {
    return response.json();
  } else {
    return {
      message: "An error occurred while login.",
    };
  }
}
