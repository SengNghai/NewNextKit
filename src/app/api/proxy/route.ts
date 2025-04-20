export async function GET(req: Request) {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
  
    if (!domain) {
      return new Response(JSON.stringify({ error: "缺少域名参数" }), { status: 400 });
    }
  
    try {
      const response = await fetch(`https://${domain}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
  
      const data = await response.text();
      return new Response(data, {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "域名无法访问" }), { status: 500 });
    }
  }
  