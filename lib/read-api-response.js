export async function readApiResponse(response, fallbackMessage = "The server returned an unexpected response.") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const message = response.status === 404
      ? "The /api/demo-requests endpoint was not found. Check that its API route is included in your Vercel deployment."
      : "The demo-request endpoint returned a web page instead of JSON. Check the API route and Vercel function logs.";
    throw new Error(message);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }
  return data;
}
