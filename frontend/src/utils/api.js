export const fetchUserLanguage = async () => {
  const response = await fetch("/api/users/current", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    // try to get a more specific error message from the response
    let msg = "Failed to fetch user";
    try {
      const json = await response.json();
      if (json?.errorMessage) msg = json.errorMessage;
    } catch {
      // intentionally ignored
    }
    const err = new Error(`${msg} (${response.status})`);
    // Add a status property to the error object
    err.status = response.status;
    throw err;
  }
  return response.json();
};

export const updateUserLanguage = async (language) => {
  const response = await fetch("/api/users/language", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ language }),
  });

  if (!response.ok) {
    throw new Error("Failed to update user language");
  }
  return response.json();
};
