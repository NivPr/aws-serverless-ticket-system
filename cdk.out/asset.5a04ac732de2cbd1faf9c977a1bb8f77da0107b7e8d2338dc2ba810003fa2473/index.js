const { createTicket, searchTicketsByTitle, deleteTicket } = require('./services/ticketService');


exports.handler = async (event) => {
  try {
    const httpMethod = event.requestContext?.http?.method;
    const rawPath = event.rawPath;
    const stage = event.requestContext?.stage || "";
    const normalizedPath = rawPath.replace(`/${stage}`, "");
    const claims = event.requestContext?.authorizer?.jwt?.claims;
    const userId = claims?.sub;

    const body = event.body ? JSON.parse(event.body) : {};
    const { status, price, title, description, ticketId } = body;

    if (httpMethod === "POST" && normalizedPath === "/tickets/addTicket") {
      if (!userId) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
      const result = await createTicket({ userId, status, price, title, description });
      return { statusCode: 200, body: JSON.stringify({ message: "Ticket added!", data: result }) };
    }

    if (httpMethod === "GET" && normalizedPath === "/tickets/searchByTitle") {
      const keyword = event.queryStringParameters?.keyword;
      if (!keyword) return { statusCode: 400, body: JSON.stringify({ message: "Missing keyword" }) };

      const items = await searchTicketsByTitle(keyword);
      const tickets = items.map(item => ({
        Id: item.Id.S,
        userId: item.userId.S,
        createdAt: item.createdAt.S,
        status: item.status.S,
        price: Number(item.price.N),
        title: item.title.S,
        description: item.description.S,
      }));

      return { statusCode: 200, body: JSON.stringify({ message: "Search results", tickets }) };
    }

    if (httpMethod === "DELETE" && normalizedPath === "/tickets/delete") {
      if (!ticketId) return { statusCode: 400, body: JSON.stringify({ message: "Missing ticketId" }) };
      if (!userId) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };
      return await deleteTicket(ticketId, userId);
    }

    return { statusCode: 404, body: JSON.stringify({ message: "Route not found" }) };

  } catch (error) {
    console.error("Error in handler:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error", error: error.message }) };
  }
};

