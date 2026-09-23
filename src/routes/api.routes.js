import express from "express";

const router = express.Router();

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/health",
  },
  {
    method: "GET",
    path: "/api/health/db-test",
  },
  {
    method: "GET",
    path: "/api/users",
  },
  {
    method: "GET",
    path: "/api/users/telegram/:telegram_id",
  },
  {
    method: "POST",
    path: "/api/users",
  },
  {
    method: "POST",
    path: "/api/auth/telegram",
  },
  {
    method: "POST",
    path: "/api/matches/:telegram_id",
  },
  {
    method: "POST",
    path: "/api/matches/:telegram_id/like",
  },
  {
    method: "POST",
    path: "/api/matches/:telegram_id/dislike",
  },
  {
    method: "PATCH",
    path: "/api/users/telegram/:telegram_id",
  },
];

router.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const methods = [...new Set(apiEndpoints.map((api) => api.method))];

  const sections = methods
    .map((method) => {
      const endpoints = apiEndpoints
        .filter((api) => api.method === method)
        .map(
          (api) => `
            <li>
              <span class="method ${method.toLowerCase()}">${method}</span>
              <a href="${api.path}">
                ${baseUrl}${api.path}
              </a>
            </li>
          `,
        )
        .join("");

      return `
        <section>
          <h2>${method}</h2>
          <ul>
            ${endpoints}
          </ul>
        </section>
      `;
    })
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>API List</title>

        <style>
          body {
            background: #0f1117;
            color: #ffffff;
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
          }

          h1 {
            margin-bottom: 30px;
          }

          section {
            margin-bottom: 30px;
          }

          ul {
            list-style: none;
            padding: 0;
          }

          li {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
          }

          .method {
            display: inline-block;
            min-width: 65px;
            padding: 7px 10px;
            border-radius: 6px;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }

          .get {
            background: #166534;
            color: #ffffff;
          }

          .post {
            background: #1d4ed8;
            color: #ffffff;
          }

          .patch {
            background: orange;
            color: #ffffff;
          }
            
          a {
            color: #61dafb;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>

      <body>
        <h1>API Endpoints</h1>

        ${sections}
      </body>
    </html>
  `);
});

export default router;
