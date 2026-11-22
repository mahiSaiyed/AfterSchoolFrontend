const apiBase = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export async function request(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status})`);
    }
    return result;
}
