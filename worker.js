export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. GET /outages: Tally recent status per municipality (last 4 hours)
    // Accessible by anyone globally so relatives abroad can check on family
    if (request.method === "GET" && url.pathname === "/outages") {
      try {
        const query = `
          SELECT municipio, status, COUNT(*) as count 
          FROM reports 
          WHERE created_at >= datetime('now', '-4 hours')
          GROUP BY municipio, status
          ORDER BY count DESC
        `;
        const { results } = await env.DB.prepare(query).all();

        const summary = {};
        for (const row of results) {
          if (!summary[row.municipio]) {
            summary[row.municipio] = {
              status: row.status,
              count: row.count
            };
          }
        }

        return new Response(JSON.stringify(summary), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to read database" }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // 2. POST /report: Save a new report
    // Strictly restricted to users with a Cuban IP address ('CU')
    if (request.method === "POST" && url.pathname === "/report") {
      try {
        // Cloudflare Edge automatically parses the connecting IP country
        const country = request.cf ? request.cf.country : null;

        // If the request does NOT come from Cuba ('CU'), reject with 403 Forbidden
        // Note: For local testing, you can add an env variable check like (env.DEV_MODE === "true")
        if (country !== "CU" && env.DEV_MODE !== "true") {
          return new Response(JSON.stringify({ 
            error: "Solo se puede reportar desde una conexión en Cuba.", 
            code: "GEO_RESTRICTED" 
          }), { 
            status: 403, 
            headers: corsHeaders 
          });
        }

        const body = await request.json();
        const { municipio, status } = body;

        if (!municipio || !["SE_FUE", "VINO"].includes(status)) {
          return new Response(JSON.stringify({ error: "Invalid payload" }), { 
            status: 400, 
            headers: corsHeaders 
          });
        }

        // Anti-spam safeguard for NAT: cap identical logs within a 1-minute window
        const recentCheck = await env.DB.prepare(`
          SELECT COUNT(*) as recent_count 
          FROM reports 
          WHERE municipio = ? AND status = ? AND created_at >= datetime('now', '-1 minute')
        `).bind(municipio, status).first();

        if (recentCheck && recentCheck.recent_count > 10) {
          return new Response(JSON.stringify({ success: true, throttled: true }), { headers: corsHeaders });
        }

        await env.DB.prepare(`
          INSERT INTO reports (municipio, status) VALUES (?, ?)
        `).bind(municipio, status).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Write failed" }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }
};
