export async function sendEmail({ to, subject, name, innerSubject, update_type, updated_by, task_status, task_priority, optional_message, task_link }) {
    const data = {
        to,
        subject,
        name,
        innerSubject,
        update_type,
        updated_by,
        task_status,
        task_priority,
        optional_message,
        task_link
    };

    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return {success: true, message: "📩 Email sent successfully" };
    } catch (error) {
        return {success: false, message: error.message || "Failed to send email" };
    }
}
