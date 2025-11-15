const TASK_EMAIL_TEMPLATE = ({ name = null, subject = null, update_type = null, updated_by = null, task_status = null, task_priority = null, optional_message = null, task_link = null }) => {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" 
               style="max-width:620px; background:#ffffff; border-radius:10px; padding:0; box-shadow:0 4px 20px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background:#16A34A; padding:35px 20px; border-radius:10px 10px 0 0; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:600;">
                Task Collab
              </h1>
              <p style="margin:6px 0 0; color:#e6ffe9; font-size:14px;">
                Task Update Notification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 25px;">

              <!-- Greeting -->
              <p style="margin:0 0 15px; font-size:15px; color:#333;">
                Hi ${name ? name : 'there'},
              </p>

              <!-- Intro -->
              <p style="margin:0 0 20px; font-size:15px; color:#444; line-height:1.6;">
                There’s an update on your task <strong>${subject}</strong>.
              </p>

              <!-- Task details card -->
              <table width="100%" cellpadding="10" cellspacing="0" 
                     style="background:#f0fdf4; border-left:4px solid #16A34A; border-radius:8px; font-size:14px; color:#333;">
                <tr>
                  <td style="font-weight:600; width:120px;">Update Type:</td>
                  <td>${update_type}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;">Updated By:</td>
                  <td>${updated_by}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;">Status:</td>
                  <td>${task_status}</td>
                </tr>
                <tr>
                  <td style="font-weight:600;">Priority:</td>
                  <td>${task_priority}</td>
                </tr>
              </table>

              <!-- Optional message -->
              <p style="margin:20px 0 25px; font-size:14px; color:#555; line-height:1.5;">
                ${optional_message}
              </p>

              <!-- Button -->
              <div style="text-align:center; margin-bottom:10px;">
                <a href="${task_link}"
                  style="
                    background:#16A34A;
                    color:#ffffff;
                    padding:14px 26px;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:15px;
                    font-weight:600;
                    display:inline-block;
                    box-shadow:0 4px 10px rgba(22,163,74,0.25);
                  ">
                  View Task
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px; text-align:center; font-size:12px; color:#777; border-top:1px solid #f0f0f0;">
              — Task Collab —<br>
              Effortless tracking. Smarter collaboration.
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>
  `
};
export { TASK_EMAIL_TEMPLATE };