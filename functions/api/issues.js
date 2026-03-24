// functions/api/issues.js
export async function onRequest(context) {
  // context.env 里包含了平台绑定的 KV 数据库，我们假设你绑定的名字叫 COUPLE_KV
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. 处理 GET 请求：获取列表
  if (request.method === "GET") {
    // 从 KV 数据库读取数据，如果没有则返回空数组
    const data = await env.COUPLE_KV.get("issue_list");
    return new Response(data || "[]", {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. 处理 POST 请求：添加新记录
  if (request.method === "POST") {
    const newIssue = await request.json();
    
    // 先获取现有的数据
    const existingDataStr = await env.COUPLE_KV.get("issue_list");
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
    
    // 把新问题加到最前面
    newIssue.id = Date.now().toString(); // 生成唯一ID
    existingData.unshift(newIssue);

    // 存回 KV 数据库
    await env.COUPLE_KV.put("issue_list", JSON.stringify(existingData));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // 3. 处理 PUT 请求：切换“已改正/需努力”状态
  if (request.method === "PUT") {
    const { id } = await request.json();
    
    const existingDataStr = await env.COUPLE_KV.get("issue_list");
    let existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
    
    // 找到对应的问题，反转其状态
    existingData = existingData.map(issue => {
      if (issue.id === id) {
        return { ...issue, resolved: !issue.resolved };
      }
      return issue;
    });

    // 存回 KV 数据库
    await env.COUPLE_KV.put("issue_list", JSON.stringify(existingData));

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("Method Not Allowed", { status: 405 });
}
